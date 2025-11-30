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

    // LOGIN (keeps existing behavior: this endpoint is a fallback)
    if (action === 'login') {
        try {
            if (email === 'admin@helptech.com' && password === 'admin123') {
                return res.status(200).json({
                    success: true,
                    message: 'Login realizado com sucesso',
                    data: {
                        id: 1,
                        name: 'Admin',
                        email: email,
                        token: 'exemplo-token-jwt'
                    }
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou senha incorretos'
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao fazer login',
                error: error.message
            });
        }
    }

    // REGISTRO
    if (action === 'register') {
        try {
            if (!email) return badRequest('Email é obrigatório');
            if (!password) return badRequest('Senha é obrigatória');
            if (typeof password === 'string' && password.length < 6) return badRequest('Senha deve ter ao menos 6 caracteres');
            // If Supabase server-side keys are available, create the user in Supabase
            const SUPABASE_URL = process.env.SUPABASE_URL;
            const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

            // Build a basic user metadata object if name is provided
            const user_metadata = {};
            if (name) user_metadata.name = name;
            if (req.body.first_name) user_metadata.first_name = req.body.first_name;
            if (req.body.last_name) user_metadata.last_name = req.body.last_name;

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
                    // Return the status and API message if possible
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao criar usuário no Supabase',
                        status: resp.status,
                        error: result
                    });
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
