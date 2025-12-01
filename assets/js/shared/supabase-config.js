// Supabase configuration
window.SUPABASE_CONFIG = {
  url: 'https://ongzofvycmljqdjruvpv.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3pvZnZ5Y21sanFkanJ1dnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjE3NDcsImV4cCI6MjA3ODY5Nzc0N30.i8W1i-OHBqzZ4CpGFMfQVpdiFFhL8KKkYSYMd048PGA'
};

// Create a Supabase client instance when the UMD script is loaded
try {
  if (window.SUPABASE_CONFIG && window.supabase && !window.SUPABASE_CLIENT) {
    window.SUPABASE_CLIENT = supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
    console.log('[supabase-config] SUPABASE_CLIENT created');
  }
} catch (e) {
  console.warn('[supabase-config] failed to create SUPABASE_CLIENT', e);
}
