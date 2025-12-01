// Serverless endpoint to list Supabase users using the Service Role Key
// Usage: GET /api/admin_list_users

export default async function handler(req, res) {
    // Protect this endpoint with an ADMIN_TOOL_KEY header
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-tool-key');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Método não permitido' });

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

        // Ensure fetch exists (Node <18)
        if (typeof fetch === 'undefined') {
            try {
                const nodeFetch = await import('node-fetch');
                global.fetch = nodeFetch.default || nodeFetch;
            } catch (e) {
                console.error('fetch not available and node-fetch import failed', e);
                return res.status(500).json({ success: false, message: 'Fetch não disponível no servidor' });
            }
        }

        const adminUrl = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users?limit=200`;

        const resp = await fetch(adminUrl, {
            method: 'GET',
            headers: {
                apikey: SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            }
        });

        const text = await resp.text();
        let body = null;
        try { body = text ? JSON.parse(text) : null; } catch (e) { body = text; }

        if (!resp.ok) {
            console.error('admin_list_users error', resp.status, body);
            if (resp.status === 403 && body && body.error_code === 'not_admin') {
                return res.status(403).json({ success: false, message: 'Chave não é Service Role Key (not_admin)', status: resp.status, error: body, hint: 'Defina SUPABASE_SERVICE_ROLE_KEY com a Service Role Key (Dashboard → Settings → API → Service Role Key) no Vercel Environment Variables' });
            }

            return res.status(500).json({ success: false, message: 'Erro ao chamar Supabase admin API', status: resp.status, error: body });
        }

        return res.status(200).json({ success: true, data: body });
    } catch (error) {
        console.error('admin_list_users exception', error);
        return res.status(500).json({ success: false, message: 'Erro interno', error: error.message });
    }
}
