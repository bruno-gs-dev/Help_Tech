// Endpoint de diagnóstico: verifica presença e validade da SUPABASE_SERVICE_ROLE_KEY
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-tool-key');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Método não permitido' });

    try {
        const ADMIN_TOOL_KEY = process.env.ADMIN_TOOL_KEY;
        const providedKey = req.headers['x-admin-tool-key'] || req.headers['admin-tool-key'];
        if (ADMIN_TOOL_KEY && (!providedKey || providedKey !== ADMIN_TOOL_KEY)) {
            return res.status(401).json({ success: false, message: 'Chave administrativa inválida' });
        }

        const DEFAULT_SUPABASE_URL = 'https://ongzofvycmljqdjruvpv.supabase.co';
        const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3pvZnZ5Y21sanFkanJ1dnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjE3NDcsImV4cCI6MjA3ODY5Nzc0N30.i8W1i-OHBqzZ4CpGFMfQVpdiFFhL8KKkYSYMd048PGA';

        const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
        const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_KEY;

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            return res.status(400).json({
                success: false,
                message: 'Variáveis de ambiente faltando',
                details: {
                    has_SUPABASE_URL: !!SUPABASE_URL,
                    has_SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY
                }
            });
        }

        // Ensure fetch exists
        if (typeof fetch === 'undefined') {
            try {
                const nodeFetch = await import('node-fetch');
                global.fetch = nodeFetch.default || nodeFetch;
            } catch (e) {
                console.error('fetch not available and node-fetch import failed', e);
                return res.status(500).json({ success: false, message: 'Fetch não disponível no servidor' });
            }
        }

        const adminUrl = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users?limit=1`;
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

        if (resp.ok) {
            return res.status(200).json({ success: true, admin_key_valid: true, message: 'Service Role Key válida e com privilégios admin' });
        }

        if (resp.status === 403 && body && body.error_code === 'not_admin') {
            return res.status(403).json({ success: false, admin_key_valid: false, reason: 'not_admin', message: 'A key presente não tem privilégios admin (provavelmente é a anon key). Use a Service Role Key.' });
        }

        return res.status(500).json({ success: false, admin_key_valid: false, status: resp.status, message: 'Erro ao verificar a Service Role Key', error: body });
    } catch (error) {
        console.error('check_supabase_service_role exception', error);
        return res.status(500).json({ success: false, message: 'Erro interno', error: error.message });
    }
}
