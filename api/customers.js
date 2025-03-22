import { query } from './db.js';

export default async function handler(req, res) {
  try {
    // Definir cabeçalhos CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // Responder ao método preflight OPTIONS
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Manipular diferentes métodos
    if (req.method === 'GET') {
      const customers = await query('SELECT * FROM customers LIMIT 100', []);
      return res.status(200).json(customers);
    }

    if (req.method === 'POST') {
      const customer = req.body;
      
      const result = await query(
        'INSERT INTO customers (id, name, email, phone, address, city, state, postal_code, cpf_cnpj, birthdate, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          customer.id,
          customer.name,
          customer.email,
          customer.phone,
          customer.address,
          customer.city,
          customer.state,
          customer.postal_code,
          customer.cpf_cnpj,
          customer.birthdate,
          customer.notes,
          Date.now(),
          Date.now()
        ]
      );

      return res.status(201).json({ success: true, id: customer.id });
    }

    // Método não permitido
    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 