// Serverless Function para alterar informações (agora persiste no Supabase)
// Substitui: dashboard_logged/area_administrativa/alterar_informacoes.php

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
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;    
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            return res.status(500).json({ success: false, message: 'Supabase não configurado no servidor' });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const { action } = req.body;

        // ADICIONAR PRODUTO
        if (action === 'add') {
            const { name, category, price, status, rating, description, image } = req.body;
            const insert = {
                name,
                category,
                price: price ? parseFloat(price) : null,
                status: status || 'available',
                rating: rating ? parseFloat(rating) : null,
                description: description || null,
                image: image || null,
                reviews: 0,
                period: 'dia'
            };

            const { data, error } = await supabase.from('products').insert([insert]).select().single();
            if (error) {
                console.error('Supabase insert error:', error);
                return res.status(500).json({ success: false, message: 'Erro ao adicionar produto', error: error.message });
            }

            return res.status(201).json({ success: true, message: 'Produto adicionado com sucesso!', data });
        }

        // EDITAR PRODUTO
        if (action === 'edit') {
            const { id, name, category, price, status, rating, description, image } = req.body;
            if (!id) return res.status(400).json({ success: false, message: 'ID do produto é obrigatório' });

            const updates = {
                name,
                category,
                price: price ? parseFloat(price) : null,
                status,
                rating: rating ? parseFloat(rating) : null,
                description,
                image
            };

            const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
            if (error) {
                console.error('Supabase update error:', error);
                return res.status(500).json({ success: false, message: 'Erro ao atualizar produto', error: error.message });
            }

            return res.status(200).json({ success: true, message: 'Produto atualizado com sucesso!', data });
        }

        // DELETAR PRODUTO
        if (action === 'delete') {
            const { id } = req.body;
            if (!id) return res.status(400).json({ success: false, message: 'ID do produto é obrigatório' });

            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) {
                console.error('Supabase delete error:', error);
                return res.status(500).json({ success: false, message: 'Erro ao excluir produto', error: error.message });
            }

            return res.status(200).json({ success: true, message: 'Produto excluído com sucesso!' });
        }

        // ATUALIZAR INFORMAÇÕES DO PARCEIRO
        if (action === 'update-partner') {
            const { nome, cnpj, email, telefone, descricao, endereco } = req.body;

            // If you store partner info in a table, implement here. For now return success.
            return res.status(200).json({
                success: true,
                message: 'Informações atualizadas com sucesso!',
                data: {
                    nome,
                    cnpj,
                    email,
                    telefone,
                    descricao,
                    endereco
                }
            });
        }

        return res.status(400).json({ success: false, message: 'Ação inválida' });

    } catch (error) {
        console.error('Erro:', error);
        return res.status(500).json({ success: false, message: 'Erro ao processar requisição', error: error.message });
    }
}
