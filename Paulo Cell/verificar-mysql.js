// Script para verificar o banco de dados MySQL
import mysql from 'mysql2/promise';

async function verificarMySQL() {
  console.log('Iniciando verificação do banco de dados MySQL...');
  
  try {
    // Conectar ao banco de dados
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'paulocell_user',
      password: 'PauloCell@2025',
      database: 'paulocell'
    });
    
    console.log('Conexão com MySQL estabelecida com sucesso!');
    
    // Listar tabelas
    const [tabelas] = await connection.query('SHOW TABLES');
    console.log('\n=== TABELAS NO BANCO DE DADOS ===');
    tabelas.forEach(tabela => {
      console.log(`- ${Object.values(tabela)[0]}`);
    });
    
    // Verificar tabela customers
    const [countClientes] = await connection.query('SELECT COUNT(*) as total FROM customers');
    console.log(`\nTotal de clientes: ${countClientes[0].total}`);
    
    if (countClientes[0].total > 0) {
      const [clientes] = await connection.query('SELECT id, name, email, phone FROM customers LIMIT 5');
      console.log('\n=== ÚLTIMOS CLIENTES CADASTRADOS ===');
      clientes.forEach((cliente, i) => {
        console.log(`${i+1}. ${cliente.name} (${cliente.email || 'sem email'}) - ${cliente.phone || 'sem telefone'}`);
      });
    } else {
      console.log('Nenhum cliente cadastrado no banco de dados.');
    }
    
    // Verificar tabela devices
    const [countDevices] = await connection.query('SELECT COUNT(*) as total FROM devices');
    console.log(`\nTotal de dispositivos: ${countDevices[0].total}`);
    
    // Verificar tabela services
    const [countServices] = await connection.query('SELECT COUNT(*) as total FROM services');
    console.log(`\nTotal de serviços: ${countServices[0].total}`);
    
    // Fechar conexão
    await connection.end();
    console.log('\nVerificação concluída com sucesso!');
    
  } catch (erro) {
    console.error('ERRO:', erro.message);
    if (erro.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Problema de acesso: verifique usuário e senha do MySQL');
    } else if (erro.code === 'ECONNREFUSED') {
      console.error('Não foi possível conectar ao MySQL. Verifique se o serviço está em execução.');
    }
  }
}

verificarMySQL(); 