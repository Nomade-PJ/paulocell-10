/**
 * Rotas para gerenciamento de documentos fiscais
 */
import express from 'express';
import { randomUUID } from 'crypto';
import { getDbConnection } from '../database.js';

const router = express.Router();

// Obter todos os documentos
router.get('/', async (req, res) => {
  try {
    const connection = await getDbConnection();
    const [rows] = await connection.execute(`
      SELECT d.*, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', i.id,
            'documentId', i.document_id,
            'description', i.description,
            'quantity', i.quantity,
            'unit', i.unit,
            'unitValue', i.unit_value,
            'totalValue', i.total_value
          )
        ) AS items
      FROM documents d
      LEFT JOIN document_items i ON d.id = i.document_id
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `);
    
    const documents = rows.map(doc => {
      // Converter dados JSON para objeto
      let items = [];
      try {
        items = JSON.parse(doc.items);
        // Remover entradas nulas (se houver)
        items = items.filter(item => item && item.id);
      } catch (e) {
        console.error('Erro ao processar itens do documento:', e);
      }
      
      return {
        id: doc.id,
        type: doc.type,
        number: doc.number,
        customer: doc.customer_name,
        customerId: doc.customer_id,
        date: doc.issue_date,
        value: doc.total_value,
        status: doc.status,
        items: items,
        paymentMethod: doc.payment_method,
        observations: doc.observations,
        invoiceId: doc.invoice_id,
        invoiceNumber: doc.invoice_number,
        invoiceKey: doc.invoice_key,
        invoiceUrl: doc.invoice_url,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at
      };
    });
    
    await connection.end();
    res.json(documents);
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ error: 'Erro ao buscar documentos' });
  }
});

// Obter documento por ID
router.get('/:id', async (req, res) => {
  try {
    const connection = await getDbConnection();
    const [rows] = await connection.execute(`
      SELECT d.*, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', i.id,
            'documentId', i.document_id,
            'description', i.description,
            'quantity', i.quantity,
            'unit', i.unit,
            'unitValue', i.unit_value,
            'totalValue', i.total_value
          )
        ) AS items
      FROM documents d
      LEFT JOIN document_items i ON d.id = i.document_id
      WHERE d.id = ?
      GROUP BY d.id
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }
    
    const doc = rows[0];
    
    // Converter dados JSON para objeto
    let items = [];
    try {
      items = JSON.parse(doc.items);
      // Remover entradas nulas (se houver)
      items = items.filter(item => item && item.id);
    } catch (e) {
      console.error('Erro ao processar itens do documento:', e);
    }
    
    const document = {
      id: doc.id,
      type: doc.type,
      number: doc.number,
      customer: doc.customer_name,
      customerId: doc.customer_id,
      date: doc.issue_date,
      value: doc.total_value,
      status: doc.status,
      items: items,
      paymentMethod: doc.payment_method,
      observations: doc.observations,
      invoiceId: doc.invoice_id,
      invoiceNumber: doc.invoice_number,
      invoiceKey: doc.invoice_key,
      invoiceUrl: doc.invoice_url,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at
    };
    
    await connection.end();
    res.json(document);
  } catch (error) {
    console.error('Erro ao buscar documento:', error);
    res.status(500).json({ error: 'Erro ao buscar documento' });
  }
});

// Criar novo documento
router.post('/', async (req, res) => {
  const connection = await getDbConnection();
  try {
    await connection.beginTransaction();
    
    const {
      type,
      number,
      customer,
      customerId,
      date,
      value,
      status,
      items,
      paymentMethod,
      observations,
      invoiceId,
      invoiceNumber,
      invoiceKey,
      invoiceUrl
    } = req.body;
    
    // Inserir documento
    const [result] = await connection.execute(`
      INSERT INTO documents (
        id, type, number, customer_name, customer_id, issue_date, 
        total_value, status, payment_method, observations,
        invoice_id, invoice_number, invoice_key, invoice_url
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.body.id || randomUUID(),
      type,
      number,
      customer,
      customerId,
      date,
      value,
      status || 'Pendente',
      paymentMethod,
      observations,
      invoiceId,
      invoiceNumber,
      invoiceKey,
      invoiceUrl
    ]);
    
    const documentId = req.body.id || result.insertId;
    
    // Inserir itens do documento
    if (items && items.length > 0) {
      for (const item of items) {
        await connection.execute(`
          INSERT INTO document_items (
            id, document_id, description, quantity, unit, unit_value, total_value
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          item.id || randomUUID(),
          documentId,
          item.description,
          item.quantity,
          item.unit || 'un',
          item.unitValue,
          item.totalValue || (item.quantity * item.unitValue)
        ]);
      }
    }
    
    await connection.commit();
    
    res.status(201).json({ 
      id: documentId,
      message: 'Documento criado com sucesso' 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao criar documento:', error);
    res.status(500).json({ error: 'Erro ao criar documento' });
  } finally {
    await connection.end();
  }
});

// Atualizar documento
router.put('/:id', async (req, res) => {
  const connection = await getDbConnection();
  try {
    await connection.beginTransaction();
    
    const documentId = req.params.id;
    
    // Verificar se documento existe
    const [existingDoc] = await connection.execute('SELECT id FROM documents WHERE id = ?', [documentId]);
    
    if (existingDoc.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Documento não encontrado' });
    }
    
    const {
      type,
      number,
      customer,
      customerId,
      date,
      value,
      status,
      items,
      paymentMethod,
      observations,
      invoiceId,
      invoiceNumber,
      invoiceKey,
      invoiceUrl
    } = req.body;
    
    // Atualizar documento
    await connection.execute(`
      UPDATE documents SET
        type = ?,
        number = ?,
        customer_name = ?,
        customer_id = ?,
        issue_date = ?,
        total_value = ?,
        status = ?,
        payment_method = ?,
        observations = ?,
        invoice_id = ?,
        invoice_number = ?,
        invoice_key = ?,
        invoice_url = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      type,
      number,
      customer,
      customerId,
      date,
      value,
      status,
      paymentMethod,
      observations,
      invoiceId,
      invoiceNumber,
      invoiceKey,
      invoiceUrl,
      documentId
    ]);
    
    // Remover itens antigos
    await connection.execute('DELETE FROM document_items WHERE document_id = ?', [documentId]);
    
    // Inserir novos itens
    if (items && items.length > 0) {
      for (const item of items) {
        await connection.execute(`
          INSERT INTO document_items (
            id, document_id, description, quantity, unit, unit_value, total_value
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          item.id || randomUUID(),
          documentId,
          item.description,
          item.quantity,
          item.unit || 'un',
          item.unitValue,
          item.totalValue || (item.quantity * item.unitValue)
        ]);
      }
    }
    
    await connection.commit();
    
    res.json({ 
      message: 'Documento atualizado com sucesso' 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao atualizar documento:', error);
    res.status(500).json({ error: 'Erro ao atualizar documento' });
  } finally {
    await connection.end();
  }
});

// Excluir documento
router.delete('/:id', async (req, res) => {
  const connection = await getDbConnection();
  try {
    await connection.beginTransaction();
    
    const documentId = req.params.id;
    
    // Excluir itens do documento
    await connection.execute('DELETE FROM document_items WHERE document_id = ?', [documentId]);
    
    // Excluir documento
    const [result] = await connection.execute('DELETE FROM documents WHERE id = ?', [documentId]);
    
    await connection.commit();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }
    
    res.json({ message: 'Documento excluído com sucesso' });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao excluir documento:', error);
    res.status(500).json({ error: 'Erro ao excluir documento' });
  } finally {
    await connection.end();
  }
});

// Obter documentos por cliente
router.get('/customer/:customerId', async (req, res) => {
  try {
    const connection = await getDbConnection();
    const [rows] = await connection.execute(`
      SELECT d.*, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', i.id,
            'documentId', i.document_id,
            'description', i.description,
            'quantity', i.quantity,
            'unit', i.unit,
            'unitValue', i.unit_value,
            'totalValue', i.total_value
          )
        ) AS items
      FROM documents d
      LEFT JOIN document_items i ON d.id = i.document_id
      WHERE d.customer_id = ?
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `, [req.params.customerId]);
    
    const documents = rows.map(doc => {
      // Converter dados JSON para objeto
      let items = [];
      try {
        items = JSON.parse(doc.items);
        // Remover entradas nulas (se houver)
        items = items.filter(item => item && item.id);
      } catch (e) {
        console.error('Erro ao processar itens do documento:', e);
      }
      
      return {
        id: doc.id,
        type: doc.type,
        number: doc.number,
        customer: doc.customer_name,
        customerId: doc.customer_id,
        date: doc.issue_date,
        value: doc.total_value,
        status: doc.status,
        items: items,
        paymentMethod: doc.payment_method,
        observations: doc.observations,
        invoiceId: doc.invoice_id,
        invoiceNumber: doc.invoice_number,
        invoiceKey: doc.invoice_key,
        invoiceUrl: doc.invoice_url,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at
      };
    });
    
    await connection.end();
    res.json(documents);
  } catch (error) {
    console.error('Erro ao buscar documentos por cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar documentos por cliente' });
  }
});

export default router; 