// Script para verificar tabelas e registros no MySQL
console.log('Verificando banco de dados MySQL...');
import mysql from 'mysql2';

// Criar conexão com o banco de dados
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'paulocell_user',
  password: 'PauloCell@2025',
  database: 'paulocell'
});

// Conectar ao banco de dados
connection.connect(function(err) {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err.message);
    console.error('Código de erro:', err.code);
    process.exit(1);
  }
  
  console.log('Conectado ao MySQL com sucesso!');
  
  // 1. Listar tabelas
  connection.query('SHOW TABLES', function(error, results) {
    if (error) {
      console.error('Erro ao listar tabelas:', error.message);
      connection.end();
      return;
    }
    
    console.log('\n=== TABELAS NO BANCO DE DADOS ===');
    results.forEach(table => {
      console.log('- ' + Object.values(table)[0]);
    });
    
    // 2. Contar registros em cada tabela
    const tabelas = ['customers', 'devices', 'services', 'users', 'inventory', 'documents', 'company_settings'];
    console.log('\n=== CONTAGEM DE REGISTROS ===');
    
    let completed = 0;
    
    tabelas.forEach(tabela => {
      connection.query(`SELECT COUNT(*) as total FROM ${tabela}`, function(err, result) {
        completed++;
        
        if (err) {
          console.log(`${tabela}: Erro ao contar - ${err.message}`);
        } else {
          console.log(`${tabela}: ${result[0].total} registros`);
        }
        
        // Quando todas as consultas terminarem, verificamos a estrutura das tabelas
        if (completed === tabelas.length) {
          // 3. Verificar estrutura da tabela customers
          connection.query('DESCRIBE customers', function(err, fields) {
            if (err) {
              console.error('Erro ao obter estrutura da tabela customers:', err.message);
            } else {
              console.log('\n=== ESTRUTURA DA TABELA CUSTOMERS ===');
              fields.forEach(field => {
                console.log(`${field.Field}: ${field.Type}`);
              });
            }
            
            // 4. Mostrar alguns registros de clientes
            connection.query('SELECT id, name, email, phone FROM customers LIMIT 5', function(err, customers) {
              if (err) {
                console.error('Erro ao obter clientes:', err.message);
              } else {
                console.log('\n=== ALGUNS CLIENTES NO BANCO ===');
                if (customers.length === 0) {
                  console.log('Nenhum cliente encontrado no banco de dados.');
                } else {
                  customers.forEach((customer, index) => {
                    console.log(`Cliente ${index+1}: ${customer.name} (${customer.email || 'sem email'}, ${customer.phone || 'sem telefone'})`);
                  });
                }
              }
              
              console.log('\nVerificação concluída!');
              connection.end();
            });
          });
        }
      });
    });
  });
});
