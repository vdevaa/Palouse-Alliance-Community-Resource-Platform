import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { validate as validateUuid } from 'uuid';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY;
const PORT = Number(process.env.PORT || 3001);

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) in environment');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const app = express();
app.use(cors());
app.use(express.json());

function isValidRole(role) {
  return role === 'admin' || role === 'member';
}

function generateSecurePassword(length = 24) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
  const randomBytes = crypto.randomBytes(length);
  let password = '';

  for (let i = 0; i < length; i += 1) {
    password += charset[randomBytes[i] % charset.length];
  }

  return password;
}

app.post('/api/register', async (req, res) => {
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
      return res.status(400).json({ error: 'supabase_create_user_failed', message: createError.message, details: createError });
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
        return res.status(400).json({ error: 'profile_update_failed', message: updateError.message, details: updateError });
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
    return res.status(500).json({ error: 'internal_error', message: err?.message || String(err) });
  }
});

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function isValidEmail(value) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

app.post('/api/organizations', async (req, res) => {
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
      return res.status(400).json({ error: 'organization_create_failed', message: error.message, details: error });
    }

    return res.status(201).json({ id: data?.id, name: name.trim() });
  } catch (err) {
    console.error('Unexpected /api/organizations error:', err);
    return res.status(500).json({ error: 'internal_error', message: err?.message || String(err) });
  }
});

app.get('/api/organizations', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('organizations')
      .select('id, name, description, phone_number, email, location')
      .neq('name', 'Unaffiliated')
      .order('name', { ascending: true });

    if (error) {
      return res.status(400).json({ error: 'organizations_fetch_failed', message: error.message, details: error });
    }

    return res.status(200).json(data || []);
  } catch (err) {
    console.error('Unexpected /api/organizations GET error:', err);
    return res.status(500).json({ error: 'internal_error', message: err?.message || String(err) });
  }
});

app.get('/api/users', async (_req, res) => {
  try {
    const [authResponse, profileResponse] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      supabaseAdmin.from('users').select('id, role, organization_id'),
    ]);

    if (authResponse.error) {
      return res.status(400).json({ error: 'users_auth_fetch_failed', message: authResponse.error.message, details: authResponse.error });
    }

    if (profileResponse.error) {
      return res.status(400).json({ error: 'users_profile_fetch_failed', message: profileResponse.error.message, details: profileResponse.error });
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

app.patch('/api/organizations/:id', async (req, res) => {
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
      return res.status(400).json({ error: 'organization_update_failed', message: error.message, details: error });
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

app.delete('/api/organizations/:id', async (req, res) => {
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
      return res.status(400).json({ error: 'organization_delete_failed', message: error.message, details: error });
    }

    if (!data) {
      return res.status(404).json({ error: 'not_found', message: 'Organization not found.' });
    }

    return res.status(200).json({ id: data.id });
  } catch (err) {
    console.error('Unexpected /api/organizations DELETE error:', err);
    return res.status(500).json({ error: 'internal_error', message: err?.message || String(err) });
  }
});

app.patch('/api/users/:id', async (req, res) => {
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
      return res.status(400).json({ error: 'user_update_failed', message: error.message, details: error });
    }

    if (!data) {
      return res.status(404).json({ error: 'not_found', message: 'User not found.' });
    }

    return res.status(200).json({ id: data.id });
  } catch (err) {
    console.error('Unexpected /api/users PATCH error:', err);
    return res.status(500).json({ error: 'internal_error', message: err?.message || String(err) });
  }
});

app.post('/api/users/:id/reset-password', async (req, res) => {
  const { id } = req.params;

  if (!validateUuid(id)) {
    return res.status(400).json({ error: 'invalid_id', message: 'User id must be a valid UUID.' });
  }

  const password = generateSecurePassword(16);

  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      password,
    });

    if (error) {
      return res.status(400).json({ error: 'user_password_reset_failed', message: error.message, details: error });
    }

    return res.status(200).json({ password });
  } catch (err) {
    console.error('Unexpected /api/users RESET PASSWORD error:', err);
    return res.status(500).json({ error: 'internal_error', message: err?.message || String(err) });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  if (!validateUuid(id)) {
    return res.status(400).json({ error: 'invalid_id', message: 'User id must be a valid UUID.' });
  }

  try {
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) {
      return res.status(400).json({ error: 'user_delete_failed', message: authError.message, details: authError });
    }

    const { error: rowError } = await supabaseAdmin.from('users').delete().eq('id', id);
    if (rowError) {
      console.error('Unexpected /api/users DELETE row error:', rowError);
    }

    return res.status(200).json({ id });
  } catch (err) {
    console.error('Unexpected /api/users DELETE error:', err);
    return res.status(500).json({ error: 'internal_error', message: err?.message || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
