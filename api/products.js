// Serverless Function para produtos integrando com Supabase
// Arquivo: api/products.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ongzofvycmljqdjruvpv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3pvZnZ5Y21sanFkanJ1dnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjE3NDcsImV4cCI6MjA3ODY5Nzc0N30.i8W1i-OHBqzZ4CpGFMfQVpdiFFhL8KKkYSYMd048PGA';

function sendMissingEnv(res) {
    return res.status(500).json({
        success: false,
        message: 'Variáveis de ambiente do Supabase não configuradas. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.'
    });
}

function normalizeProduct(input) {
    if (!input || typeof input !== 'object') return input;
    const out = { ...input };

    // Try to coerce numeric fields
    ['price', 'compare_at_price', 'cost', 'stock_quantity', 'weight', 'rating', 'reviews'].forEach(key => {
        if (out[key] !== undefined && out[key] !== null) {
            const n = Number(out[key]);
            if (!Number.isNaN(n)) out[key] = n;
        }
    });

    // published boolean
    if (out.published !== undefined) {
        if (typeof out.published === 'string') {
            out.published = out.published === 'true' || out.published === '1';
        } else {
            out.published = Boolean(out.published);
        }
    }

    return out;
}

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return sendMissingEnv(res);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false }
    });

    try {
        // GET - listar ou obter por id
        if (req.method === 'GET') {
            const { id } = req.query || {};

            if (id) {
                const { data, error } = await supabase.from('products').select('*').eq('id', id).limit(1).single();
                if (error) throw error;
                return res.status(200).json({ success: true, data });
            }

            const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return res.status(200).json({ success: true, data });
        }

        // POST - criar
        if (req.method === 'POST') {
            const payload = normalizeProduct(req.body);

            const { data, error } = await supabase.from('products').insert([payload]).select().single();
            if (error) throw error;

            return res.status(201).json({ success: true, message: 'Produto adicionado com sucesso', data });
        }

        // PUT - atualizar
        if (req.method === 'PUT') {
            const { id } = req.query || req.body || {};
            const productId = id || (req.body && req.body.id);

            if (!productId) {
                return res.status(400).json({ success: false, message: 'ID do produto é obrigatório para atualização' });
            }

            const payload = normalizeProduct(req.body);
            // Remove id from payload if present to avoid conflicts
            if (payload.id) delete payload.id;

            const { data, error } = await supabase.from('products').update(payload).eq('id', productId).select().single();
            if (error) throw error;

            return res.status(200).json({ success: true, message: 'Produto atualizado com sucesso', data });
        }

        // DELETE - deletar
        if (req.method === 'DELETE') {
            const { id } = req.query || req.body || {};
            const productId = id || (req.body && req.body.id);

            if (!productId) {
                return res.status(400).json({ success: false, message: 'ID do produto é obrigatório para exclusão' });
            }

            const { data, error } = await supabase.from('products').delete().eq('id', productId).select().single();
            if (error) throw error;

            return res.status(200).json({ success: true, message: 'Produto deletado com sucesso', data });
        }

        return res.status(405).json({ success: false, message: 'Método não permitido' });
    } catch (error) {
        // Supabase errors sometimes have details in error.message or error.details
        const msg = error && error.message ? error.message : String(error);
        return res.status(500).json({ success: false, message: 'Erro ao processar requisição', error: msg });
    }
}
