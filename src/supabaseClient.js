// src/supabaseClient.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Carrega as variáveis de ambiente
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
