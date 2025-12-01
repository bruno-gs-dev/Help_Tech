// Creates an admin user using Supabase Admin API and upserts profile.
// Protected by an ADMIN_TOOL_KEY header matching the env var.

export default async function handler(req, res) {
  // Allow CORS for simple testing — keep limited in production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-tool-key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Método não permitido' });

  try {
    const ADMIN_TOOL_KEY = process.env.ADMIN_TOOL_KEY;
    const providedKey = req.headers['x-admin-tool-key'] || req.headers['admin-tool-key'];
    if (!ADMIN_TOOL_KEY) {
      return res.status(500).json({ success: false, message: 'ADMIN_TOOL_KEY não configurado no servidor. Defina uma chave para proteger este endpoint.' });
    }
    if (!providedKey || providedKey !== ADMIN_TOOL_KEY) {
      return res.status(401).json({ success: false, message: 'Chave administrativa inválida' });
    }

    const DEFAULT_SUPABASE_URL = 'https://ongzofvycmljqdjruvpv.supabase.co';
    const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3pvZnZ5Y21sanFkanJ1dnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjE3NDcsImV4cCI6MjA3ODY5Nzc0N30.i8W1i-OHBqzZ4CpGFMfQVpdiFFhL8KKkYSYMd048PGA';

    const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ success: false, message: 'SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados no servidor' });
    }

    // Required admin credentials in env
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_FULL_NAME = process.env.ADMIN_FULL_NAME || 'Site Admin';

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return res.status(400).json({ success: false, message: 'Defina ADMIN_EMAIL e ADMIN_PASSWORD nas variáveis de ambiente antes de chamar este endpoint.' });
    }

    // Ensure fetch exists
    if (typeof fetch === 'undefined') {
      try {
        const nodeFetch = await import('node-fetch');
        global.fetch = nodeFetch.default || nodeFetch;
      } catch (e) {
        console.error('fetch not available', e);
        return res.status(500).json({ success: false, message: 'Fetch não disponível no servidor' });
      }
    }

    // 1) Create user via Admin API
    const adminUrl = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users`;
    const payload = { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, user_metadata: { name: ADMIN_FULL_NAME } };

    const createResp = await fetch(adminUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const createText = await createResp.text();
    let createData = null;
    try { createData = createText ? JSON.parse(createText) : null; } catch (e) { createData = createText; }

    if (!createResp.ok) {
      console.error('create admin user failed', createResp.status, createData);
      return res.status(createResp.status === 403 ? 403 : 500).json({ success: false, message: 'Erro ao criar usuário admin no Supabase', status: createResp.status, error: createData });
    }

    const userId = createData?.id;
    if (!userId) {
      return res.status(500).json({ success: false, message: 'Usuário criado mas id não retornado', data: createData });
    }

    // 2) Upsert profile via RPC upsert_profile (we created this function earlier)
    const rpcUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/rpc/upsert_profile`;
    const rpcBody = { p_id: userId, p_username: ADMIN_USERNAME, p_full_name: ADMIN_FULL_NAME, p_metadata: { migrated: true } };

    const rpcResp = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify(rpcBody)
    });

    const rpcText = await rpcResp.text();
    let rpcData = null;
    try { rpcData = rpcText ? JSON.parse(rpcText) : null; } catch (e) { rpcData = rpcText; }
    if (!rpcResp.ok) {
      console.error('upsert_profile failed', rpcResp.status, rpcData);
      // proceed but warn
    }

    // 3) Mark profile as admin via PATCH to profiles
    const patchUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/profiles?id=eq.${userId}`;
    const patchBody = { is_admin: true, role: 'admin' };

    const patchResp = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'return=representation'
      },
      body: JSON.stringify(patchBody)
    });

    const patchText = await patchResp.text();
    let patchData = null;
    try { patchData = patchText ? JSON.parse(patchText) : null; } catch (e) { patchData = patchText; }

    if (!patchResp.ok) {
      console.error('patch profile failed', patchResp.status, patchData);
      return res.status(500).json({ success: false, message: 'Usuário criado mas falha ao marcar como admin', user: createData, upsert: rpcData, patchError: patchData });
    }

    return res.status(201).json({ success: true, message: 'Admin criado e marcado com sucesso', user: createData, profile: patchData });

  } catch (error) {
    console.error('create_admin_user exception', error);
    return res.status(500).json({ success: false, message: 'Erro interno', error: error.message });
  }
}
