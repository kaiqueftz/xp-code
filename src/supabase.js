// src/supabase.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// Configuração do Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliZmt4aHNzbnR0bHJqaWpkYmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2NTk1NTQsImV4cCI6MjA0MjIzNTU1NH0.ghKoV90o61_2-CSfDlA08emIDUhXHeCmyrTA87LyJqg';
const supabaseUrl = 'https://ibfkxhssnttlrjijdbbv.supabase.co/'; // Substitua pela sua chave de API
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
