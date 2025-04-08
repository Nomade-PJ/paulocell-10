import { query } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

// Buscar todos os clientes
export async function getAllCustomers() {
  return await query('SELECT * FROM customers ORDER BY name');
}

// Buscar cliente por ID
export async function getCustomerById(id) {
  const customers = await query('SELECT * FROM customers WHERE id = ?', [id]);
  return customers[0];
}

// Criar um novo cliente
export async function createCustomer(customer) {
  // Debug: Mostrar os dados recebidos do cliente
  console.log('============== CRIANDO CLIENTE ==============');
  console.log('Dados recebidos:', JSON.stringify(customer, null, 2));
  
  const id = customer.id || uuidv4();
  const now = Date.now();
  
  // Extrair dados do endereço estruturado, se existir
  let address = customer.address || '';
  
  if (typeof customer.address === 'object' && customer.address !== null) {
    // Se o endereço vier como objeto, convertemos para string
    console.log('Endereço recebido como objeto:', customer.address);
    address = customer.address.street || '';
  }
  
  const newCustomer = {
    id,
    name: customer.name,
    email: customer.email || '',
    phone: customer.phone || '',
    address: address,
    city: customer.city || '',
    state: customer.state || '',
    postal_code: customer.postalCode || '',
    cpf_cnpj: customer.cpfCnpj || '',
    birthdate: customer.birthdate ? new Date(customer.birthdate) : null,
    notes: customer.notes || '',
    created_at: now,
    updated_at: now
  };
  
  // Debug: Mostrar os dados formatados para inserção
  console.log('Dados formatados para inserção:', JSON.stringify(newCustomer, null, 2));
  
  try {
    await query(
      `INSERT INTO customers 
       (id, name, email, phone, address, city, state, postal_code, cpf_cnpj, birthdate, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newCustomer.id,
        newCustomer.name,
        newCustomer.email,
        newCustomer.phone,
        newCustomer.address,
        newCustomer.city,
        newCustomer.state,
        newCustomer.postal_code,
        newCustomer.cpf_cnpj,
        newCustomer.birthdate,
        newCustomer.notes,
        newCustomer.created_at,
        newCustomer.updated_at
      ]
    );
    console.log('Cliente inserido com sucesso no banco de dados!');
    return newCustomer;
  } catch (error) {
    console.error('Erro ao inserir cliente no banco de dados:', error);
    throw error;
  }
}

// Atualizar um cliente existente
export async function updateCustomer(id, customer) {
  const now = Date.now();
  
  const updatedCustomer = {
    name: customer.name,
    email: customer.email || '',
    phone: customer.phone || '',
    address: customer.address || '',
    city: customer.city || '',
    state: customer.state || '',
    postal_code: customer.postalCode || '',
    cpf_cnpj: customer.cpfCnpj || '',
    birthdate: customer.birthdate ? new Date(customer.birthdate) : null,
    notes: customer.notes || '',
    updated_at: now
  };
  
  await query(
    `UPDATE customers 
     SET name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, 
         postal_code = ?, cpf_cnpj = ?, birthdate = ?, notes = ?, updated_at = ?
     WHERE id = ?`,
    [
      updatedCustomer.name,
      updatedCustomer.email,
      updatedCustomer.phone,
      updatedCustomer.address,
      updatedCustomer.city,
      updatedCustomer.state,
      updatedCustomer.postal_code,
      updatedCustomer.cpf_cnpj,
      updatedCustomer.birthdate,
      updatedCustomer.notes,
      updatedCustomer.updated_at,
      id
    ]
  );
  
  return { id, ...updatedCustomer };
}

// Excluir um cliente
export async function deleteCustomer(id) {
  await query('DELETE FROM customers WHERE id = ?', [id]);
  return { id };
}

// Buscar clientes por termo de pesquisa
export async function searchCustomers(searchTerm) {
  const term = `%${searchTerm}%`;
  return await query(
    `SELECT * FROM customers 
     WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR cpf_cnpj LIKE ?
     ORDER BY name`,
    [term, term, term, term]
  );
}

// Converter dados do DB para o formato do frontend
export function toClientModel(dbCustomer) {
  return {
    id: dbCustomer.id,
    name: dbCustomer.name,
    email: dbCustomer.email || '',
    phone: dbCustomer.phone || '',
    address: dbCustomer.address || '',
    city: dbCustomer.city || '',
    state: dbCustomer.state || '',
    postalCode: dbCustomer.postal_code || '',
    cpfCnpj: dbCustomer.cpf_cnpj || '',
    birthdate: dbCustomer.birthdate ? new Date(dbCustomer.birthdate).toISOString().split('T')[0] : '',
    notes: dbCustomer.notes || '',
    createdAt: dbCustomer.created_at,
    updatedAt: dbCustomer.updated_at
  };
} 