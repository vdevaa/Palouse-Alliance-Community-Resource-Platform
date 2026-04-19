import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
      user_metadata: {
        role: role || 'member',
        organization_id: organization_id || null,
        wants_notifications: true
      }
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

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
