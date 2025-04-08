// Script para verificar tabelas e registros no MySQL
console.log('Verificando banco de dados MySQL...');
const mysql = require('mysql2/promise');

async function verificarBanco() {
  try {
    // Criar conexão com o banco de dados
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'paulocell_user',
      password: 'PauloCell@2025',
      database: 'paulocell'
    });
    
    console.log('Conectado ao MySQL com sucesso!');
    
    // 1. Listar tabelas
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n=== TABELAS NO BANCO DE DADOS ===');
    tables.forEach(table => {
      console.log('- ' + Object.values(table)[0]);
    });
    
    // 2. Contar registros em cada tabela
    const tabelas = ['customers', 'devices', 'services', 'users', 'inventory', 'documents', 'company_settings'];
    console.log('\n=== CONTAGEM DE REGISTROS ===');
    
    for (const tabela of tabelas) {
      try {
        const [result] = await connection.query(`SELECT COUNT(*) as total FROM ${tabela}`);
        console.log(`${tabela}: ${result[0].total} registros`);
      } catch (err) {
        console.log(`${tabela}: Erro ao contar - ${err.message}`);
      }
    }
    
    // 3. Verificar estrutura da tabela customers
    try {
      const [fields] = await connection.query('DESCRIBE customers');
      console.log('\n=== ESTRUTURA DA TABELA CUSTOMERS ===');
      fields.forEach(field => {
        console.log(`${field.Field}: ${field.Type}`);
      });
    } catch (err) {
      console.error('Erro ao obter estrutura da tabela customers:', err.message);
    }
    
    // 4. Mostrar alguns registros de clientes
    try {
      const [customers] = await connection.query('SELECT id, name, email, phone FROM customers LIMIT 5');
      console.log('\n=== ALGUNS CLIENTES NO BANCO ===');
      if (customers.length === 0) {
        console.log('Nenhum cliente encontrado no banco de dados.');
      } else {
        customers.forEach((customer, index) => {
          console.log(`Cliente ${index+1}: ${customer.name} (${customer.email || 'sem email'}, ${customer.phone || 'sem telefone'})`);
        });
      }
    } catch (err) {
      console.error('Erro ao obter clientes:', err.message);
    }
    
    console.log('\nVerificação concluída!');
    await connection.end();
    
  } catch (error) {
    console.error('Erro ao verificar banco de dados:', error.message);
    process.exit(1);
  }
}

verificarBanco();