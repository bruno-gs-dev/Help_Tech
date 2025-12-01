
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ongzofvycmljqdjruvpv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3pvZnZ5Y21sanFkanJ1dnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjE3NDcsImV4cCI6MjA3ODY5Nzc0N30.i8W1i-OHBqzZ4CpGFMfQVpdiFFhL8KKkYSYMd048PGA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
    console.log('Testing Supabase connection with Anon Key...');
    const { data, error } = await supabase.from('products').select('*').limit(1);

    if (error) {
        console.error('Error connecting to Supabase:', error);
    } else {
        console.log('Successfully connected to Supabase!');
        console.log('Products found:', data.length);
        if (data.length > 0) {
            console.log('Sample product:', data[0]);
        }
    }
}

testConnection();
