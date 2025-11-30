// Protected endpoint: verifies Firebase ID token, then upserts profile in Supabase
import admin from 'firebase-admin';

let adminInitialized = false;
function initFirebaseAdmin() {
  if (adminInitialized) return;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) return;
  // Handle escaped newlines in private key
  privateKey = privateKey.replace(/\\n/g, '\n');
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey })
  });
  adminInitialized = true;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Método não permitido' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ success: false, message: 'Supabase não configurado no servidor' });
  }

  // Ensure fetch for Node <18
  if (typeof fetch === 'undefined') {
    try {
      const nodeFetch = await import('node-fetch');
      global.fetch = nodeFetch.default || nodeFetch;
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Fetch não disponível no servidor' });
    }
  }

  try {
    initFirebaseAdmin();
    if (!adminInitialized) {
      return res.status(500).json({ success: false, message: 'Firebase Admin não configurado. Defina FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.' });
    }

    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Token de autorização ausente' });
    }
    const idToken = match[1];

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      return res.status(401).json({ success: false, message: 'ID token inválido', error: e.message });
    }

    const uid = decoded.uid;
    const { username, full_name, metadata } = req.body || {};

    // Call Supabase RPC upsert_profile
    const rpcUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/rpc/upsert_profile`;
    const rpcBody = { p_id: uid, p_username: username || null, p_full_name: full_name || null, p_metadata: metadata || {} };
    const resp = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify(rpcBody)
    });

    const text = await resp.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch (e) { body = text; }

    if (!resp.ok) {
      return res.status(500).json({ success: false, message: 'Erro ao upsert profile', status: resp.status, error: body });
    }

    // Fetch the profile row for convenience
    const getUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/profiles?id=eq.${uid}`;
    const getResp = await fetch(getUrl, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    });
    const getText = await getResp.text();
    let profile = null;
    try { profile = getText ? JSON.parse(getText) : null; } catch (e) { profile = getText; }

    return res.status(200).json({ success: true, message: 'Perfil upserted', data: { uid, profile } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro interno', error: error.message });
  }
}
