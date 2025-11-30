import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Método não permitido' });

    try {
        const { filename, content, contentType } = req.body || {};
        if (!filename || !content) {
            return res.status(400).json({ success: false, message: 'Arquivo inválido' });
        }

        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            return res.status(500).json({ success: false, message: 'Supabase não configurado no servidor' });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const bucket = process.env.SUPABASE_BUCKET || 'product-images';
        const safeName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
        const buffer = Buffer.from(content, 'base64');

        const { error } = await supabase.storage.from(bucket).upload(safeName, buffer, { contentType: contentType || 'application/octet-stream' });
        if (error) {
            console.error('Supabase upload error:', error);
            return res.status(500).json({ success: false, message: 'Erro ao enviar arquivo para o storage', error: error.message });
        }

        const { publicURL } = supabase.storage.from(bucket).getPublicUrl(safeName);
        return res.status(200).json({ success: true, publicURL });
    } catch (err) {
        console.error('Upload handler error:', err);
        return res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
    }
}
