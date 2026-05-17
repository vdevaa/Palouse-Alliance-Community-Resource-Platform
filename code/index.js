import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { validate as validateUuid } from 'uuid';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const PORT = Number(process.env.PORT || 3001);

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) in environment');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const app = express();

const TRUSTED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((value) => value.trim()).filter(Boolean)
  : [];
const allowAllOrigins = TRUSTED_ORIGINS.length === 0;

app.use(
  cors({
    origin: (origin, callback) => {
      const normalizedOrigin = origin?.trim();

      if (!normalizedOrigin || allowAllOrigins || TRUSTED_ORIGINS.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);
app.use(express.json());

app.options('/api/login', cors());

app.all('/api/login', (req, res, next) => {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'method_not_allowed',
      message: 'The login endpoint only accepts POST requests.',
      allowed: 'POST',
    });
  }
  next();
});

const rateLimitStore = new Map();
const loginAttempts = new Map();

function createRateLimiter({ keyFn, maxRequests = 30, windowMs = 60_000 }) {
  return (req, res, next) => {
    const key = keyFn(req) || req.ip || 'global';
    const now = Date.now();
    const entry = rateLimitStore.get(key) || { count: 0, firstRequestAt: now };

    if (now - entry.firstRequestAt >= windowMs) {
      entry.count = 0;
      entry.firstRequestAt = now;
    }

    entry.count += 1;
    rateLimitStore.set(key, entry);

    if (entry.count > maxRequests) {
      return res.status(429).json({
        error: 'rate_limit_exceeded',
        message: 'Too many requests. Please try again later.',
      });
    }

    next();
  };
}

function normalizeLoginKey(req) {
  const ip = req.ip || 'unknown';
  const email = (req.body?.email || '').trim().toLowerCase();
  return `${ip}:${email}`;
}

function getLoginDelay(attemptCount) {
  if (attemptCount <= 3) {
    return 0;
  }
  return Math.min(10 + (attemptCount - 3) * 5, 60);
}

function getLoginAttemptData(req) {
  const key = normalizeLoginKey(req);
  const now = Date.now();
  const entry = loginAttempts.get(key) || {
    count: 0,
    firstFailedAt: now,
    blockedUntil: 0,
  };

  if (now - entry.firstFailedAt > 5 * 60_000) {
    entry.count = 0;
    entry.firstFailedAt = now;
    entry.blockedUntil = 0;
  }

  return { entry, key };
}

function recordFailedLogin(req) {
  const { entry, key } = getLoginAttemptData(req);
  const now = Date.now();
  entry.count += 1;
  entry.firstFailedAt = now;
  const delaySeconds = getLoginDelay(entry.count);
  entry.blockedUntil = delaySeconds > 0 ? now + delaySeconds * 1000 : 0;
  loginAttempts.set(key, entry);
  return entry;
}

function clearLoginAttempts(req) {
  const { key } = getLoginAttemptData(req);
  loginAttempts.delete(key);
}

function parseBearerToken(req) {
  const authorization = req.headers.authorization || req.headers.Authorization || '';
  const [scheme, token] = authorization.split(' ');
  return scheme?.toLowerCase() === 'bearer' ? token : null;
}

async function requireAdmin(req, res, next) {
  const token = parseBearerToken(req);

  if (!token) {
    return res.status(401).json({
      error: 'authentication_required',
      message: 'Authentication token is required.',
    });
  }

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({
      error: 'invalid_token',
      message: 'Authentication failed.',
    });
  }

  req.authUser = user;

  const { data, error: profileError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !data || data.role !== 'admin') {
    return res.status(403).json({
      error: 'forbidden',
      message: 'Admin access is required.',
    });
  }

  req.authUserRole = data.role;
  next();
}

const publicRateLimiter = createRateLimiter({
  keyFn: (req) => req.ip,
  maxRequests: 60,
  windowMs: 60_000,
});

const adminRateLimiter = createRateLimiter({
  keyFn: (req) => req.authUser?.id || req.ip,
  maxRequests: 30,
  windowMs: 60_000,
});

app.post('/api/login', publicRateLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  const now = Date.now();
  const { entry } = getLoginAttemptData(req);

  if (entry.blockedUntil > now) {
    return res.status(429).json({
      error: 'login_rate_limited',
      message: `Too many failed login attempts. Try again in ${Math.ceil((entry.blockedUntil - now) / 1000)} seconds.`,
      retry_after: Math.ceil((entry.blockedUntil - now) / 1000),
    });
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'email_required', message: 'Email is required.' });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'password_required', message: 'Password is required and must be at least 8 characters.' });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data?.session) {
      const failedEntry = recordFailedLogin(req);
      const delay = getLoginDelay(failedEntry.count);
      return res.status(401).json({
        error: 'invalid_credentials',
        message: 'Invalid email or password.',
        retry_after: delay > 0 ? delay : undefined,
      });
    }

    clearLoginAttempts(req);

    return res.status(200).json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  } catch (err) {
    console.error('Unexpected /api/login error:', err);
    return res.status(500).json({ error: 'internal_error', message: 'An unexpected error occurred.' });
  }
});

function isValidRole(role) {
  return role === 'admin' || role === 'member';
}

app.post('/api/register', requireAdmin, adminRateLimiter, async (req, res) => {
  const { email, password, role, organization_id } = req.body || {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'email_required' });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'weak_password', message: 'Password must be at least 8 characters.' });
  }
  if (role != null && role !== '' && !isValidRole(role)) {
    return res.status(400).json({ error: 'invalid_role', message: 'role must be "admin" or "member".' });
  }
  if (organization_id != null && organization_id !== '') {
    if (typeof organization_id !== 'string' || !validateUuid(organization_id)) {
      return res.status(400).json({ error: 'invalid_organization_id', message: 'organization_id must be a UUID.' });
    }
  }

  let createdUserId = null;

  try {
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      return res.status(400).json({ error: 'supabase_create_user_failed', message: createError.message });
    }

    createdUserId = createData.user?.id;
    if (!createdUserId) {
      return res.status(500).json({ error: 'supabase_missing_user_id' });
    }

    const updatePayload = {};
    if (role) updatePayload.role = role;
    if (organization_id) updatePayload.organization_id = organization_id;

    if (Object.keys(updatePayload).length > 0) {
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('users')
        .update(updatePayload)
        .eq('id', createdUserId)
        .select('id')
        .maybeSingle();

      if (updateError) {
        await supabaseAdmin.auth.admin.deleteUser(createdUserId).catch(() => {});
        return res.status(400).json({ error: 'profile_update_failed', message: updateError.message });
      }

      if (!updateData) {
        await supabaseAdmin.auth.admin.deleteUser(createdUserId).catch(() => {});
        return res.status(500).json({ error: 'profile_update_failed_no_row', message: 'public.users row was not found to update; user creation rolled back.' });
      }
    }

    return res.status(201).json({ id: createdUserId, email });
  } catch (err) {
    if (createdUserId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(createdUserId);
      } catch (delErr) {
        console.error('Rollback deleteUser failed:', delErr);
      }
    }
    console.error('Unexpected /api/register error:', err);
    return res.status(500).json({ error: 'internal_error', message: 'An unexpected error occurred.' });
  }
});

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function isValidEmail(value) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

app.post('/api/organizations', requireAdmin, adminRateLimiter, async (req, res) => {
  const { name, description, phone_number, email, location } = req.body || {};

  if (!isNonEmptyString(name)) {
    return res.status(400).json({ error: 'name_required', message: 'Organization name is required.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'invalid_email', message: 'Please provide a valid email address.' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('organizations')
      .insert([
        {
          name: name.trim(),
          description: description?.trim() || null,
          phone_number: phone_number?.trim() || null,
          email: email?.trim() || null,
          location: location?.trim() || null,
        },
      ])
      .select('id')
      .maybeSingle();

    if (error) {
      if (error.code === '23505' || error.details?.includes('organizations_name_key')) {
        return res.status(409).json({ error: 'name_taken', message: 'An organization with that name already exists.' });
      }
      return res.status(400).json({ error: 'organization_create_failed', message: error.message });
    }

    return res.status(201).json({ id: data?.id, name: name.trim() });
  } catch (err) {
    console.error('Unexpected /api/organizations error:', err);
    return res.status(500).json({ error: 'internal_error', message: 'An unexpected error occurred.' });
  }
});

app.get('/api/organizations', publicRateLimiter, async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('organizations')
      .select('id, name, description, phone_number, email, location')
      .neq('name', 'Unaffiliated')
      .order('name', { ascending: true });

    if (error) {
      return res.status(400).json({ error: 'organizations_fetch_failed', message: error.message });
    }

    return res.status(200).json(data || []);
  } catch (err) {
    console.error('Unexpected /api/organizations GET error:', err);
    return res.status(500).json({ error: 'internal_error', message: 'An unexpected error occurred.' });
  }
});

app.get('/api/users', requireAdmin, adminRateLimiter, async (_req, res) => {
  try {
    const [authResponse, profileResponse] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      supabaseAdmin.from('users').select('id, role, organization_id'),
    ]);

    if (authResponse.error) {
      return res.status(400).json({ error: 'users_auth_fetch_failed', message: authResponse.error.message });
    }

    if (profileResponse.error) {
      return res.status(400).json({ error: 'users_profile_fetch_failed', message: profileResponse.error.message });
    }

    const profilesById = new Map((profileResponse.data || []).map((profile) => [profile.id, profile]));
    const users = (authResponse.data?.users || []).map((authUser) => {
      const profile = profilesById.get(authUser.id);
      return {
        id: authUser.id,
        email: authUser.email || null,
        role: profile?.role || null,
        organization_id: profile?.organization_id || null,
      };
    });

    (profileResponse.data || []).forEach((profile) => {
      if (!users.some((user) => user.id === profile.id)) {
        users.push({
          id: profile.id,
          email: null,
          role: profile.role || null,
          organization_id: profile.organization_id || null,
        });
      }
    });

    return res.status(200).json(users);
  } catch (err) {
    console.error('Unexpected /api/users GET error:', err);
    return res.status(500).json({ error: 'internal_error', message: err?.message || String(err) });
  }
});

app.patch('/api/organizations/:id', requireAdmin, adminRateLimiter, async (req, res) => {
  const { id } = req.params;
  const { name, description, phone_number, email, location } = req.body || {};

  if (!validateUuid(id)) {
    return res.status(400).json({ error: 'invalid_id', message: 'Organization id must be a valid UUID.' });
  }

  if (!isNonEmptyString(name)) {
    return res.status(400).json({ error: 'name_required', message: 'Organization name is required.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'invalid_email', message: 'Please provide a valid email address.' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('organizations')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        phone_number: phone_number?.trim() || null,
        email: email?.trim() || null,
        location: location?.trim() || null,
      })
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) {
      if (error.code === '23505' || error.details?.includes('organizations_name_key')) {
        return res.status(409).json({ error: 'name_taken', message: 'An organization with that name already exists.' });
      }
      return res.status(400).json({ error: 'organization_update_failed', message: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'not_found', message: 'Organization not found.' });
    }

    return res.status(200).json({ id: data.id, name: name.trim() });
  } catch (err) {
    console.error('Unexpected /api/organizations PATCH error:', err);
    return res.status(500).json({ error: 'internal_error', message: err?.message || String(err) });
  }
});

app.delete('/api/organizations/:id', requireAdmin, adminRateLimiter, async (req, res) => {
  const { id } = req.params;

  if (!validateUuid(id)) {
    return res.status(400).json({ error: 'invalid_id', message: 'Organization id must be a valid UUID.' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('organizations')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) {
      return res.status(400).json({ error: 'organization_delete_failed', message: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'not_found', message: 'Organization not found.' });
    }

    return res.status(200).json({ id: data.id });
  } catch (err) {
    console.error('Unexpected /api/organizations DELETE error:', err);
    return res.status(500).json({ error: 'internal_error', message: 'An unexpected error occurred.' });
  }
});

app.patch('/api/users/:id', requireAdmin, adminRateLimiter, async (req, res) => {
  const { id } = req.params;
  const { role, organization_id } = req.body || {};

  if (!validateUuid(id)) {
    return res.status(400).json({ error: 'invalid_id', message: 'User id must be a valid UUID.' });
  }

  if (role != null && !isValidRole(role)) {
    return res.status(400).json({ error: 'invalid_role', message: 'role must be "admin" or "member".' });
  }

  if (organization_id != null && organization_id !== '' && !validateUuid(organization_id)) {
    return res.status(400).json({ error: 'invalid_organization_id', message: 'organization_id must be a UUID.' });
  }

  const updatePayload = {};
  if (role != null) updatePayload.role = role;
  updatePayload.organization_id = organization_id === '' ? null : organization_id || null;

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) {
      return res.status(400).json({ error: 'user_update_failed', message: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'not_found', message: 'User not found.' });
    }

    return res.status(200).json({ id: data.id });
  } catch (err) {
    console.error('Unexpected /api/users PATCH error:', err);
    return res.status(500).json({ error: 'internal_error', message: 'An unexpected error occurred.' });
  }
});

app.post('/api/users/:id/reset-password', requireAdmin, adminRateLimiter, async (req, res) => {
  const { id } = req.params;
  const { password } = req.body || {};

  if (!validateUuid(id)) {
    return res.status(400).json({ error: 'invalid_id', message: 'User id must be a valid UUID.' });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'weak_password', message: 'Password must be at least 8 characters.' });
  }

  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      password,
    });

    if (error) {
      return res.status(400).json({ error: 'user_password_reset_failed', message: 'Unable to reset the user password.' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Unexpected /api/users RESET PASSWORD error:', err);
    return res.status(500).json({ error: 'internal_error', message: 'An unexpected error occurred.' });
  }
});

app.delete('/api/users/:id', requireAdmin, adminRateLimiter, async (req, res) => {
  const { id } = req.params;

  if (!validateUuid(id)) {
    return res.status(400).json({ error: 'invalid_id', message: 'User id must be a valid UUID.' });
  }

  try {
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) {
      return res.status(400).json({ error: 'user_delete_failed', message: authError.message });
    }

    const { error: rowError } = await supabaseAdmin.from('users').delete().eq('id', id);
    if (rowError) {
      console.error('Unexpected /api/users DELETE row error:', rowError);
    }

    return res.status(200).json({ id });
  } catch (err) {
    console.error('Unexpected /api/users DELETE error:', err);
    return res.status(500).json({ error: 'internal_error', message: 'An unexpected error occurred.' });
  }
});

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

export default app;
