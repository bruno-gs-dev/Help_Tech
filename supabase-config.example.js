// Copy this file to `supabase-config.js` and fill your Supabase project keys.
// WARNING: `SUPABASE_ANON_KEY` is public but should be used only for client-side read operations.
// For server-side operations use the Service Role Key in environment variables.

window.SUPABASE_URL = "https://your-project.supabase.co";
window.SUPABASE_ANON_KEY = "your-anon-key-here";

// If the Supabase UMD is already loaded, create a client instance for convenience
if (typeof supabase !== 'undefined' && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
    try {
        window.SUPABASE_CLIENT = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
        console.log('[supabase-config] SUPABASE_CLIENT created');
    } catch (e) {
        console.warn('[supabase-config] failed to create SUPABASE_CLIENT', e);
    }
}

// Note: Do NOT commit `supabase-config.js` with real keys to your repo. Keep it local or use environment injection.
