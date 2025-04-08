/**
 * Script para testar a autenticação no sistema Paulo Cell
 * 
 * Este script testa o login usando as credenciais padrão e verifica
 * se o serviço de autenticação está funcionando corretamente.
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:8081/api';

async function testLogin() {
  console.log('=== Teste de autenticação no sistema Paulo Cell ===');
  console.log(`URL da API: ${API_URL}`);
  
  try {
    // Verificar se o servidor está respondendo
    console.log('\nTestando conexão com o servidor...');
    const healthResponse = await fetch(`${API_URL}/health`);
    
    if (healthResponse.ok) {
      console.log('✅ Servidor está online e respondendo.');
    } else {
      console.log('❌ Servidor não está respondendo corretamente.');
      console.log(`Status: ${healthResponse.status} ${healthResponse.statusText}`);
      return;
    }
    
    // Testar login com credenciais padrão
    console.log('\nTestando login com credenciais padrão...');
    
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        emailOrUsername: 'paulocell',
        password: 'paulocell@admin'
      })
    });
    
    if (loginResponse.ok) {
      const userData = await loginResponse.json();
      console.log('✅ Login bem-sucedido!');
      console.log('Dados do usuário:');
      console.log(JSON.stringify(userData, null, 2));
    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Falha no login:');
      console.log(`Status: ${loginResponse.status} ${loginResponse.statusText}`);
      console.log('Mensagem de erro:', errorData.message);
    }
    
  } catch (error) {
    console.error('\n❌ Erro ao executar teste:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\nO servidor parece estar offline ou a porta está incorreta.');
      console.log('Verifique se:');
      console.log('1. O servidor está em execução');
      console.log('2. A porta configurada (8081) está correta');
      console.log('3. Não há firewalls bloqueando a conexão');
    }
  }
  
  console.log('\n=== Teste de autenticação concluído ===');
}

// Executar o teste
testLogin(); 