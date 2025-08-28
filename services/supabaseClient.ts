// services/supabaseClient.ts

import { createClient } from '@supabase/supabase-js'
import { Database } from '../supabase'

// --- TESTE DE DIAGNÓSTICO DEFINITIVO (VERSÃO 2) ---
// Certifique-se de que os valores abaixo são CÓPIAS EXATAS do seu painel.
// Vá para Supabase -> Project Settings -> API e copie novamente.

const supabaseUrl = "https://dtotbffomfnxcsdgnwig.supabase.co"; // Ex: "https://dtotbffomfnxcsdgnwig.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0b3RiZmZvbWZueGNzZGdud2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMTQwNDgsImV4cCI6MjA3MTg5MDA0OH0.2MRkrFLfejcXsZ_j44odGRBJ4bnljG7JFccXH30XSa8"; // Copie a chave que começa com "eyJ..."

// -----------------------------------------

// --- REVELANDO AS CREDENCIAIS ---
// Este código irá imprimir a chave completa no console para verificação.
// ATENÇÃO: Isto é APENAS para depuração. NUNCA deixe este console.log no código final.
console.log("--- VERIFICAÇÃO FINAL DE CREDENCIAIS ---");
console.log("URL EM USO:", supabaseUrl);
console.log("CHAVE EM USO:", supabaseAnonKey);
console.log("--------------------------------------");
// ---------------------------------


if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "COLE_SUA_PROJECT_URL_AQUI") {
  throw new Error("ERRO CRÍTICO: Preencha os valores supabaseUrl e supabaseAnonKey diretamente no arquivo services/supabaseClient.ts para realizar o teste.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)