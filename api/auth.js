// Exemplo de Serverless Function para autenticação
// Arquivo: api/auth.js

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Método não permitido'
        });
    }

    const { action, email, password, name } = req.body;

    // Basic input validation for register
    function badRequest(msg) {
        return res.status(400).json({ success: false, message: msg });
    }

    // LOGIN — try to authenticate against Supabase if possible
    if (action === 'login') {
        try {
            // Fallbacks for testing (hardcoded). Replace in production.
            const DEFAULT_SUPABASE_URL = 'https://ongzofvycmljqdjruvpv.supabase.co';
            const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3pvZnZ5Y21sanFkanJ1dnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjE3NDcsImV4cCI6MjA3ODY5Nzc0N30.i8W1i-OHBqzZ4CpGFMfQVpdiFFhL8KKkYSYMd048PGA';

            const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
            const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

            // If Supabase config available, call the token endpoint (grant_type=password)
            if (SUPABASE_URL && SUPABASE_ANON_KEY) {
                // Ensure fetch available
                if (typeof fetch === 'undefined') {
                    try {
                        const nodeFetch = await import('node-fetch');
                        global.fetch = nodeFetch.default || nodeFetch;
                    } catch (e) {
                        console.error('fetch is not available and node-fetch could not be imported', e);
                        return res.status(500).json({ success: false, message: 'Erro interno: fetch não disponível no servidor' });
                    }
                }

                const tokenUrl = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token?grant_type=password`;
                const body = new URLSearchParams();
                body.append('email', email || '');
                body.append('password', password || '');

                const resp = await fetch(tokenUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        apikey: SUPABASE_ANON_KEY
                    },
                    body: body.toString()
                });

                const text = await resp.text();
                let data = null;
                try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

                if (!resp.ok) {
                    // forward Supabase error
                    console.error('Supabase sign-in error', resp.status, data);
                    return res.status(resp.status === 400 ? 401 : 500).json({ success: false, message: 'Falha ao autenticar', status: resp.status, error: data });
                }

                return res.status(200).json({ success: true, message: 'Autenticado via Supabase', data });
            }

            // If no Supabase client configured server-side, instruct to use client-side Supabase
            return res.status(400).json({ success: false, message: 'Autenticação não configurada no servidor. Use Supabase client no frontend.' });
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ success: false, message: 'Erro ao fazer login', error: error.message });
        }
    }

    // REGISTRO
    if (action === 'register') {
        try {
            if (!email) return badRequest('Email é obrigatório');
            if (!password) return badRequest('Senha é obrigatória');
            if (typeof password === 'string' && password.length < 6) return badRequest('Senha deve ter ao menos 6 caracteres');
            // If Supabase server-side keys are available, create the user in Supabase
            // Fallbacks for testing: prefer service role key from env, otherwise use anon key (may be limited)
            const DEFAULT_SUPABASE_URL = 'https://ongzofvycmljqdjruvpv.supabase.co';
            const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3pvZnZ5Y21sanFkanJ1dnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjE3NDcsImV4cCI6MjA3ODY5Nzc0N30.i8W1i-OHBqzZ4CpGFMfQVpdiFFhL8KKkYSYMd048PGA';

            const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
            const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

            // Build a basic user metadata object if name is provided
            const user_metadata = {};
            if (name) user_metadata.name = name;
            if (req.body.first_name) user_metadata.first_name = req.body.first_name;
            if (req.body.last_name) user_metadata.last_name = req.body.last_name;

            // Generate full_name and username if not present
            if (!user_metadata.full_name && (user_metadata.first_name || user_metadata.last_name)) {
                user_metadata.full_name = ((user_metadata.first_name || '') + ' ' + (user_metadata.last_name || '')).trim();
            }
            if (!user_metadata.username && email) {
                user_metadata.username = email.split('@')[0];
            }

            if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
                // Ensure fetch is available (Node <18 environments)
                if (typeof fetch === 'undefined') {
                    try {
                        // eslint-disable-next-line global-require
                        const nodeFetch = await import('node-fetch');
                        // node-fetch exports default
                        global.fetch = nodeFetch.default || nodeFetch;
                    } catch (e) {
                        console.error('fetch is not available and node-fetch could not be imported', e);
                        return res.status(500).json({ success: false, message: 'Erro interno: fetch não disponível no servidor' });
                    }
                }
                // Use the Admin REST API to create the user
                const adminUrl = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users`;

                const payload = {
                    email: email,
                    password: password,
                    user_metadata: user_metadata
                };

                // Use fetch to call the admin endpoint
                const resp = await fetch(adminUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_SERVICE_ROLE_KEY,
                        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
                    },
                    body: JSON.stringify(payload)
                });

                let resultText = null;
                let result = null;
                try {
                    resultText = await resp.text();
                    // Try parse JSON
                    result = resultText ? JSON.parse(resultText) : null;
                } catch (e) {
                    // not JSON
                    result = resultText;
                }

                if (!resp.ok) {
                    console.error('Supabase admin create user error', resp.status, result);
                    // If Supabase returns 403 not_admin, give a helpful message about the Service Role Key
                    if (resp.status === 403 && result && result.error_code === 'not_admin') {
                        return res.status(403).json({
                            success: false,
                            message: 'Erro ao criar usuário no Supabase',
                            status: resp.status,
                            error: result,
                            hint: 'O key usado não tem privilégios admin. Verifique se SUPABASE_SERVICE_ROLE_KEY está configurado e é a Service Role Key (Dashboard → Settings → API → Service Role Key), não a anon key.'
                        });
                    }

                    // Return the status and API message if possible
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao criar usuário no Supabase',
                        status: resp.status,
                        error: result
                    });
                }

                // After creating the auth user, try to create a corresponding profile row
                try {
                    const createdUser = result && typeof result === 'object' ? result : null;
                    const newUserId = createdUser && (createdUser.id || createdUser.user_id) ? (createdUser.id || createdUser.user_id) : null;
                    if (newUserId) {
                        const username = (email && email.split && email.split('@') && email.split('@')[0]) ? email.split('@')[0] : null;
                        const profilePayload = [{
                            id: newUserId,
                            username: username,
                            full_name: name || null,
                            user_id: newUserId,
                            metadata: { email: email },
                            role: 'authenticated',
                            is_admin: false
                        }];

                        const restUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/profiles?on_conflict=id`;
                        const profileResp = await fetch(restUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                                'Prefer': 'return=representation'
                            },
                            body: JSON.stringify(profilePayload)
                        });

                        let profileResult = null;
                        try { profileResult = profileResp.ok ? await profileResp.json() : await profileResp.text(); } catch (e) { profileResult = null; }
                        if (!profileResp.ok) {
                            console.warn('Failed to create profile row after user creation', profileResp.status, profileResult);
                        } else {
                            console.log('Profile row created/updated for user', newUserId);
                        }
                    }
                } catch (profileErr) {
                    console.warn('Error while creating profile after auth user creation', profileErr);
                }

                return res.status(201).json({ success: true, message: 'Usuário registrado no Supabase com sucesso', data: result });
            }

            // Fallback behavior: previous mock response (no persistence)
            return res.status(201).json({
                success: true,
                message: 'Usuário registrado (modo fallback - sem persistência)',
                data: {
                    id: Date.now(),
                    name: name,
                    email: email
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao registrar usuário',
                error: error.message
            });
        }
    }

    return res.status(400).json({
        success: false,
        message: 'Ação inválida'
    });
}
