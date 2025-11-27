// Serverless Function para alterar informações
// Substitui: dashboard_logged/area_administrativa/alterar_informacoes.php

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

        // ADICIONAR PRODUTO
        if (action === 'add') {
            const { name, category, price, status, rating, description, image } = req.body;

            // Aqui você conectaria com um banco de dados
            // Por enquanto, retorna sucesso simulado
            const newProduct = {
                id: Date.now(),
                name,
                category,
                price: parseFloat(price),
                status,
                rating: parseFloat(rating),
                description,
                image,
                reviews: 0,
                period: 'dia'
            };

            return res.status(201).json({
                success: true,
                message: 'Produto adicionado com sucesso!',
                data: newProduct
            });
        }

        // EDITAR PRODUTO
        if (action === 'edit') {
            const { id, name, category, price, status, rating, description, image } = req.body;

            const updatedProduct = {
                id: parseInt(id),
                name,
                category,
                price: parseFloat(price),
                status,
                rating: parseFloat(rating),
                description,
                image
            };

            return res.status(200).json({
                success: true,
                message: 'Produto atualizado com sucesso!',
                data: updatedProduct
            });
        }

        // DELETAR PRODUTO
        if (action === 'delete') {
            const { id } = req.body;

            return res.status(200).json({
                success: true,
                message: 'Produto excluído com sucesso!'
            });
        }

        // ATUALIZAR INFORMAÇÕES DO PARCEIRO
        if (action === 'update-partner') {
            const { nome, cnpj, email, telefone, descricao, endereco } = req.body;

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
