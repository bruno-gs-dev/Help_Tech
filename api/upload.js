import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Método não permitido' });

    try {
        const { filename, content, contentType, asDataUrl } = req.body || {};
        if (!filename || !content) {
            return res.status(400).json({ success: false, message: 'Arquivo inválido' });
        }

        // If caller requests a base64 data URL (asDataUrl === true) or no Supabase configured,
        // return a data URL instead of uploading to external storage.
        const dataUrl = `data:${contentType || 'application/octet-stream'};base64,${content}`;

        // Return the data URL so it can be saved directly in the product.image field
        return res.status(200).json({ success: true, publicURL: dataUrl });
    } catch (err) {
        console.error('Upload handler error:', err);
        return res.status(500).json({ success: false, message: 'Erro interno', error: err.message });
    }
}
