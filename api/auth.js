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

    // LOGIN
    if (action === 'login') {
        try {
            // Aqui você verificaria no banco de dados
            // Por enquanto, apenas um exemplo

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
            // Aqui você salvaria no banco de dados

            return res.status(201).json({
                success: true,
                message: 'Usuário registrado com sucesso',
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
