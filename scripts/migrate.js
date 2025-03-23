// Script para inicializar o banco de dados e converter dados do localStorage para MySQL
import { initializeDatabase, query } from '../server/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configuração para usar __dirname em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente - tentativa de diferentes locais para compatibilidade com cPanel
try {
  // Primeiro tenta o .env.production
  dotenv.config({ path: path.join(__dirname, '..', '.env.production') });
  console.log('Configurações carregadas de .env.production');
} catch (e) {
  try {
    // Se falhar, tenta .env
    dotenv.config();
    console.log('Configurações carregadas de .env');
  } catch (e) {
    console.log('Não foi possível carregar arquivo .env, usando variáveis de ambiente do sistema');
  }
}

// Função para verificar se o arquivo JSON existe
function checkJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Arquivo não encontrado: ${filePath}`);
    return false;
  }
  return true;
}

// Função para ler e processar um arquivo JSON
function readJsonFile(filePath) {
  if (!checkJsonFile(filePath)) {
    return [];
  }
  
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erro ao ler arquivo ${filePath}:`, error);
    return [];
  }
}

// Função para criar cópia de segurança do banco de dados
async function backupDatabase() {
  console.log('Criando backup do banco de dados antes da migração...');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups');
  
  // Criar diretório de backups se não existir
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);
  
  try {
    // Obter lista de tabelas no banco de dados
    const tables = await query('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0]);
    
    let backupData = '';
    
    // Para cada tabela, criar comando de criação e inserção
    for (const tableName of tableNames) {
      // Obter estrutura da tabela
      const createTable = await query(`SHOW CREATE TABLE ${tableName}`);
      backupData += `${createTable[0]['Create Table']};\n\n`;
      
      // Obter dados da tabela
      const rows = await query(`SELECT * FROM ${tableName}`);
      
      if (rows.length > 0) {
        // Criar comandos de inserção
        const columns = Object.keys(rows[0]).join(', ');
        
        for (const row of rows) {
          const values = Object.values(row).map(value => {
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return value;
          }).join(', ');
          
          backupData += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
        }
        
        backupData += '\n';
      }
    }
    
    // Salvar backup em arquivo
    fs.writeFileSync(backupFile, backupData);
    console.log(`Backup criado com sucesso em ${backupFile}`);
    return true;
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    return false;
  }
}

// Função para migrar clientes
async function migrateCustomers(filePath) {
  console.log('Migrando clientes...');
  const customers = readJsonFile(filePath);
  
  if (customers.length === 0) {
    console.log('Nenhum cliente para migrar');
    return;
  }
  
  for (const customer of customers) {
    try {
      await query(
        `INSERT INTO customers 
         (id, name, email, phone, address, city, state, postal_code, cpf_cnpj, birthdate, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         email = VALUES(email),
         phone = VALUES(phone),
         address = VALUES(address),
         city = VALUES(city),
         state = VALUES(state),
         postal_code = VALUES(postal_code),
         cpf_cnpj = VALUES(cpf_cnpj),
         birthdate = VALUES(birthdate),
         notes = VALUES(notes),
         updated_at = VALUES(updated_at)`,
        [
          customer.id,
          customer.name,
          customer.email || '',
          customer.phone || '',
          customer.address || '',
          customer.city || '',
          customer.state || '',
          customer.postalCode || '',
          customer.cpfCnpj || '',
          customer.birthdate ? new Date(customer.birthdate) : null,
          customer.notes || '',
          customer.createdAt || Date.now(),
          customer.updatedAt || Date.now()
        ]
      );
    } catch (error) {
      console.error(`Erro ao migrar cliente ${customer.id}:`, error);
    }
  }
  
  console.log(`${customers.length} clientes migrados com sucesso!`);
}

// Função para migrar dispositivos
async function migrateDevices(filePath) {
  console.log('Migrando dispositivos...');
  const devices = readJsonFile(filePath);
  
  if (devices.length === 0) {
    console.log('Nenhum dispositivo para migrar');
    return;
  }
  
  for (const device of devices) {
    try {
      await query(
        `INSERT INTO devices 
         (id, owner, owner_name, type, brand, model, color, serial_number, imei, password, condition_desc, accessories, problem_description, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         owner = VALUES(owner),
         owner_name = VALUES(owner_name),
         type = VALUES(type),
         brand = VALUES(brand),
         model = VALUES(model),
         color = VALUES(color),
         serial_number = VALUES(serial_number),
         imei = VALUES(imei),
         password = VALUES(password),
         condition_desc = VALUES(condition_desc),
         accessories = VALUES(accessories),
         problem_description = VALUES(problem_description),
         notes = VALUES(notes),
         updated_at = VALUES(updated_at)`,
        [
          device.id,
          device.owner || null,
          device.ownerName || '',
          device.type,
          device.brand,
          device.model,
          device.color || '',
          device.serialNumber || '',
          device.imei || '',
          device.password || '',
          device.condition || '',
          JSON.stringify(device.accessories || []),
          device.problemDescription || '',
          device.notes || '',
          device.createdAt || Date.now(),
          device.updatedAt || Date.now()
        ]
      );
    } catch (error) {
      console.error(`Erro ao migrar dispositivo ${device.id}:`, error);
    }
  }
  
  console.log(`${devices.length} dispositivos migrados com sucesso!`);
}

// Função para migrar serviços
async function migrateServices(filePath) {
  console.log('Migrando serviços...');
  const services = readJsonFile(filePath);
  
  if (services.length === 0) {
    console.log('Nenhum serviço para migrar');
    return;
  }
  
  for (const service of services) {
    try {
      await query(
        `INSERT INTO services 
         (id, customer_id, customer_name, device_id, device_description, type, custom_type, description, budget, status, priority, warranty, parts, labor_cost, start_date, end_date, technician, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         customer_id = VALUES(customer_id),
         customer_name = VALUES(customer_name),
         device_id = VALUES(device_id),
         device_description = VALUES(device_description),
         type = VALUES(type),
         custom_type = VALUES(custom_type),
         description = VALUES(description),
         budget = VALUES(budget),
         status = VALUES(status),
         priority = VALUES(priority),
         warranty = VALUES(warranty),
         parts = VALUES(parts),
         labor_cost = VALUES(labor_cost),
         start_date = VALUES(start_date),
         end_date = VALUES(end_date),
         technician = VALUES(technician),
         notes = VALUES(notes),
         updated_at = VALUES(updated_at)`,
        [
          service.id,
          service.customerId || null,
          service.customerName,
          service.deviceId || null,
          service.deviceDescription || '',
          service.type,
          service.customType || '',
          service.description,
          service.budget || 0,
          service.status,
          service.priority,
          service.warranty || '',
          JSON.stringify(service.parts || []),
          service.laborCost || 0,
          service.startDate,
          service.endDate || null,
          service.technician || '',
          service.notes || '',
          service.createdAt || Date.now(),
          service.updatedAt || Date.now()
        ]
      );
    } catch (error) {
      console.error(`Erro ao migrar serviço ${service.id}:`, error);
    }
  }
  
  console.log(`${services.length} serviços migrados com sucesso!`);
}

// Função para migrar items de inventário
async function migrateInventory(filePath) {
  console.log('Migrando inventário...');
  const inventory = readJsonFile(filePath);
  
  if (inventory.length === 0) {
    console.log('Nenhum item de inventário para migrar');
    return;
  }
  
  for (const item of inventory) {
    try {
      await query(
        `INSERT INTO inventory 
         (id, name, category, quantity, price, min_quantity, supplier, location, description, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         category = VALUES(category),
         quantity = VALUES(quantity),
         price = VALUES(price),
         min_quantity = VALUES(min_quantity),
         supplier = VALUES(supplier),
         location = VALUES(location),
         description = VALUES(description),
         updated_at = VALUES(updated_at)`,
        [
          item.id,
          item.name,
          item.category,
          item.quantity,
          item.price,
          item.minQuantity || 0,
          item.supplier || '',
          item.location || '',
          item.description || '',
          item.createdAt || Date.now(),
          item.updatedAt || Date.now()
        ]
      );
    } catch (error) {
      console.error(`Erro ao migrar item de inventário ${item.id}:`, error);
    }
  }
  
  console.log(`${inventory.length} itens de inventário migrados com sucesso!`);
}

// Função para migrar documentos
async function migrateDocuments(filePath) {
  console.log('Migrando documentos...');
  const documents = readJsonFile(filePath);
  
  if (documents.length === 0) {
    console.log('Nenhum documento para migrar');
    return;
  }
  
  for (const doc of documents) {
    try {
      await query(
        `INSERT INTO documents 
         (id, type, customer_id, customer_name, items, subtotal, discount, tax, total, payment_method, status, due_date, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         type = VALUES(type),
         customer_id = VALUES(customer_id),
         customer_name = VALUES(customer_name),
         items = VALUES(items),
         subtotal = VALUES(subtotal),
         discount = VALUES(discount),
         tax = VALUES(tax),
         total = VALUES(total),
         payment_method = VALUES(payment_method),
         status = VALUES(status),
         due_date = VALUES(due_date),
         notes = VALUES(notes),
         updated_at = VALUES(updated_at)`,
        [
          doc.id,
          doc.type,
          doc.customerId || null,
          doc.customerName,
          JSON.stringify(doc.items || []),
          doc.subtotal,
          doc.discount || 0,
          doc.tax || 0,
          doc.total,
          doc.paymentMethod || '',
          doc.status,
          doc.dueDate || null,
          doc.notes || '',
          doc.createdAt || Date.now(),
          doc.updatedAt || Date.now()
        ]
      );
    } catch (error) {
      console.error(`Erro ao migrar documento ${doc.id}:`, error);
    }
  }
  
  console.log(`${documents.length} documentos migrados com sucesso!`);
}

// Função principal
async function main() {
  try {
    console.log('Iniciando processo de migração de dados...');
    
    // Inicializar banco de dados
    await initializeDatabase();
    
    // Verificar se devemos criar backup antes de prosseguir
    const shouldBackup = process.argv.includes('--backup') || process.argv.includes('-b');
    if (shouldBackup) {
      const backupSuccess = await backupDatabase();
      if (!backupSuccess && !process.argv.includes('--force')) {
        console.error('Backup falhou e a flag --force não foi especificada. Abortando migração.');
        process.exit(1);
      }
    }
    
    // Verificar diretório de dados
    const dataDir = process.argv.includes('--data-dir') 
      ? process.argv[process.argv.indexOf('--data-dir') + 1] 
      : path.join(__dirname, '..', 'data');
    
    console.log(`Usando diretório de dados: ${dataDir}`);
    
    if (!fs.existsSync(dataDir)) {
      console.log(`Diretório ${dataDir} não existe. Criando...`);
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Verificar se existem arquivos para migrar
    const migrationFiles = {
      customers: path.join(dataDir, 'customers.json'),
      devices: path.join(dataDir, 'devices.json'),
      services: path.join(dataDir, 'services.json'),
      inventory: path.join(dataDir, 'inventory.json'),
      documents: path.join(dataDir, 'documents.json')
    };
    
    // Verificar quais entidades migrar
    const entitiesToMigrate = process.argv.includes('--entities')
      ? process.argv[process.argv.indexOf('--entities') + 1].split(',')
      : Object.keys(migrationFiles);
    
    // Mostrar informações da migração
    console.log('Entidades a serem migradas:', entitiesToMigrate.join(', '));
    
    // Migrar cada entidade selecionada
    for (const entity of entitiesToMigrate) {
      if (entity === 'customers' && fs.existsSync(migrationFiles.customers)) {
        await migrateCustomers(migrationFiles.customers);
      }
      
      if (entity === 'devices' && fs.existsSync(migrationFiles.devices)) {
        await migrateDevices(migrationFiles.devices);
      }
      
      if (entity === 'services' && fs.existsSync(migrationFiles.services)) {
        await migrateServices(migrationFiles.services);
      }
      
      if (entity === 'inventory' && fs.existsSync(migrationFiles.inventory)) {
        await migrateInventory(migrationFiles.inventory);
      }
      
      if (entity === 'documents' && fs.existsSync(migrationFiles.documents)) {
        await migrateDocuments(migrationFiles.documents);
      }
    }
    
    console.log('Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro durante o processo de migração:', error);
    process.exit(1);
  }
}

// Executar função principal se este arquivo for executado diretamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export { main, migrateCustomers, migrateDevices, migrateServices, migrateInventory, migrateDocuments }; 