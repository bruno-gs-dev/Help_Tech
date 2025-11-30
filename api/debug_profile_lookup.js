import { createClient } from '@supabase/supabase-js';

// Debug endpoint: accepts { candidates: [ ... ] }
// Returns which candidates matched rows in `profiles` and basic row info.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const { candidates } = req.body || {};
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ success: false, message: 'candidates array required' });
    }

    const DEFAULT_SUPABASE_URL = 'https://ongzofvycmljqdjruvpv.supabase.co';
    const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3pvZnZ5Y21sanFkanJ1dnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjE3NDcsImV4cCI6MjA3ODY5Nzc0N30.i8W1i-OHBqzZ4CpGFMfQVpdiFFhL8KKkYSYMd048PGA';

    const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const results = [];

    // For each candidate, perform a set of searches: id, user_id column, metadata->>email, metadata->>sub
    for (const cand of candidates) {
      if (!cand) continue;
      // Try id equality
      const rowChecks = [];

      try {
        const { data: byId, error: errId } = await supabase.from('profiles').select('id,username,full_name,metadata').eq('id', cand).maybeSingle();
        if (!errId && byId) rowChecks.push({ method: 'id', row: byId });
      } catch (e) { /* ignore */ }

      try {
        const { data: byUserId, error: errU } = await supabase.from('profiles').select('id,username,full_name,metadata').eq('user_id', cand).maybeSingle();
        if (!errU && byUserId) rowChecks.push({ method: 'user_id', row: byUserId });
      } catch (e) { /* ignore */ }

      try {
        const { data: byEmail, error: errE } = await supabase.from('profiles').select('id,username,full_name,metadata').filter('metadata->>email', 'eq', String(cand)).maybeSingle();
        if (!errE && byEmail) rowChecks.push({ method: 'metadata.email', row: byEmail });
      } catch (e) { /* ignore */ }

      try {
        const { data: bySub, error: errS } = await supabase.from('profiles').select('id,username,full_name,metadata').filter('metadata->>sub', 'eq', String(cand)).maybeSingle();
        if (!errS && bySub) rowChecks.push({ method: 'metadata.sub', row: bySub });
      } catch (e) { /* ignore */ }

      results.push({ candidate: cand, matches: rowChecks });
    }

    return res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('debug_profile_lookup error', error);
    return res.status(500).json({ success: false, message: 'Internal error', error: error.message });
  }
}
