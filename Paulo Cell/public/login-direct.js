/**
 * Script para fazer login direto no sistema Paulo Cell
 * Este script configura um usuário diretamente no localStorage,
 * permitindo acesso ao sistema sem depender da API de autenticação.
 */

// Configurar usuário no localStorage
const setupUser = () => {
  const user = {
    id: '1',
    name: 'Paulo Cell',
    email: 'paullo.celullar2020@gmail.com'
  };
  
  // Salvar no localStorage
  localStorage.setItem('pauloCell_user', JSON.stringify(user));
  
  console.log('Usuário configurado com sucesso no localStorage:');
  console.log(user);
  console.log('Agora você pode acessar o dashboard em: /dashboard');
};

// Executar a configuração
setupUser();

// Instruções
console.log('\nComo usar:');
console.log('1. Abra o console do navegador na página de login');
console.log('2. Cole e execute este script');
console.log('3. Navegue para /dashboard');

// Redirecionar para o dashboard
window.location.href = '/dashboard'; 