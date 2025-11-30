// Serverless Function para capturar informações
// Substitui: dashboard_logged/area_administrativa/capturar_informacoes.php

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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

    try {
        const { action } = req.body;

        // OBTER INFORMAÇÕES DO PARCEIRO
        if (action === 'partner-info') {
            // Aqui você buscaria do banco de dados
            // Por enquanto, retorna dados de exemplo
            const partnerData = {
                nome: 'HelPTech Aluguel de Tecnologia',
                cnpj: '12.345.678/0001-90',
                email: 'admin@helptech.com',
                telefone: '(11) 98765-4321',
                descricao: 'Empresa especializada em aluguel de equipamentos tecnológicos de alta qualidade.',
                endereco: 'Rua da Tecnologia, 123 - São Paulo, SP'
            };

            return res.status(200).json({
                success: true,
                data: partnerData
            });
        }

        // OBTER INFORMAÇÕES DO USUÁRIO (profiles)
        if (action === 'user-info') {
            // Accept userId from client (frontend should send it)
            const userId = req.body.userId || null;

            // Setup Supabase client (use service role key when available, fallback to anon key for testing)
            const DEFAULT_SUPABASE_URL = 'https://ongzofvycmljqdjruvpv.supabase.co';
            const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3pvZnZ5Y21sanFkanJ1dnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjE3NDcsImV4cCI6MjA3ODY5Nzc0N30.i8W1i-OHBqzZ4CpGFMfQVpdiFFhL8KKkYSYMd048PGA';
            const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;

            // Critical: Use Service Role Key to bypass RLS policies so we can read any profile by ID.
            // If the environment variable isn't set, we fall back to Anon key, which will likely fail for non-admins due to RLS.
            const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

            if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
                console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY is not set. API calls for non-admin profiles may fail due to RLS.');
            }

            const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

            try {
                if (!userId) {
                    return res.status(400).json({ success: false, message: 'userId não fornecido' });
                }

                // Determine lookup strategy: if userId looks like a UUID, query by id.
                // Otherwise, try other columns (user_id) and metadata->>email.
                const isUUID = typeof userId === 'string' && /^[0-9a-fA-F-]{36}$/.test(userId);
                let data = null;
                let error = null;

                if (isUUID) {
                    const resp = await supabase.from('profiles').select('id,username,full_name,role,is_admin,metadata').eq('id', userId).maybeSingle();
                    data = resp.data; error = resp.error;
                } else {
                    // try user_id column
                    const resp1 = await supabase.from('profiles').select('id,username,full_name,role,is_admin,metadata').eq('user_id', userId).maybeSingle();
                    data = resp1.data; error = resp1.error;
                    if (!data) {
                        // try metadata email
                        const resp2 = await supabase.from('profiles').select('id,username,full_name,role,is_admin,metadata').filter('metadata->>email', 'eq', String(userId)).maybeSingle();
                        data = resp2.data; error = resp2.error;
                    }
                }

                if (error) {
                    console.error('Erro ao buscar profile:', error);
                    return res.status(500).json({ success: false, message: 'Erro ao buscar perfil', error: error.message || String(error) });
                }

                if (!data) {
                    return res.status(404).json({ success: false, message: 'Perfil não encontrado' });
                }

                // Extract image if present in metadata (support multiple keys)
                const metadata = data.metadata || {};
                const image = metadata.profile_pic || metadata.image || metadata.avatar || null;

                // Map profile fields to expected response shape
                const usuario = {
                    id: data.id,
                    name: data.full_name || data.username || null,
                    email: metadata.email || null,
                    phone: metadata.phone || null,
                    birthdate: metadata.birthdate || null,
                    image: image
                };

                return res.status(200).json({ success: true, data: usuario });
            } catch (err) {
                console.error('capturar_informacoes user-info exception', err);
                return res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
            }
        }

        return res.status(400).json({
            success: false,
            message: 'Ação inválida'
        });

    } catch (error) {
        console.error('Erro:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao processar requisição',
            error: error.message
        });
    }
}
