// Serverless Function para capturar informações
// Substitui: dashboard_logged/area_administrativa/capturar_informacoes.php

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
