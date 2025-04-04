/**
 * Configuração do cliente Supabase
 * 
 * Este arquivo configura a conexão com o Supabase e exporta o cliente
 * para ser usado em toda a aplicação.
 */

import { createClient } from '@supabase/supabase-js';

// URL e chave anônima do Supabase (serão substituídas pelas configurações da hospedagem)
// Estes valores serão atualizados com base nas credenciais fornecidas pela instalação no Hostinger
const supabaseUrl = process.env.SUPABASE_URL || 'https://sua-url-supabase.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sua-chave-anon-supabase';

// Criar cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Persistir sessão no storage do navegador
    autoRefreshToken: true, // Renovar token automaticamente
    detectSessionInUrl: true, // Detectar token na URL para autenticação via OAuth
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Limite de eventos por segundo
    },
  },
});

/**
 * Verifica a conexão com o Supabase
 * @returns {Promise<boolean>} Status da conexão
 */
export const checkSupabaseConnection = async () => {
  try {
    // Fazer uma chamada simples para verificar conectividade
    const { error } = await supabase.from('health_check').select('*').limit(1);
    
    // Se não houver erro específico de conexão, consideramos conectado
    return !error || !error.message.includes('connection');
  } catch (error) {
    console.error('Erro ao verificar conexão com Supabase:', error);
    return false;
  }
};

export default supabase; 