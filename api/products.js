// Exemplo de Serverless Function para produtos
// Arquivo: api/products.js

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET - Listar produtos
    if (req.method === 'GET') {
        try {
            // Por enquanto, retorna os produtos do JSON
            // No futuro, você pode conectar a um banco de dados
            const fs = require('fs');
            const path = require('path');
            const productsPath = path.join(process.cwd(), 'products.json');
            const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

            return res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao carregar produtos',
                error: error.message
            });
        }
    }

    // POST - Adicionar produto
    if (req.method === 'POST') {
        try {
            const newProduct = req.body;

            // Aqui você adicionaria ao banco de dados
            // Por enquanto, apenas retorna sucesso

            return res.status(201).json({
                success: true,
                message: 'Produto adicionado com sucesso',
                data: newProduct
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao adicionar produto',
                error: error.message
            });
        }
    }

    // PUT - Atualizar produto
    if (req.method === 'PUT') {
        try {
            const { id } = req.query;
            const updatedProduct = req.body;

            // Aqui você atualizaria no banco de dados

            return res.status(200).json({
                success: true,
                message: 'Produto atualizado com sucesso',
                data: updatedProduct
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao atualizar produto',
                error: error.message
            });
        }
    }

    // DELETE - Deletar produto
    if (req.method === 'DELETE') {
        try {
            const { id } = req.query;

            // Aqui você deletaria do banco de dados

            return res.status(200).json({
                success: true,
                message: 'Produto deletado com sucesso'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao deletar produto',
                error: error.message
            });
        }
    }

    return res.status(405).json({
        success: false,
        message: 'Método não permitido'
    });
}
