import express from 'express';
import * as customerModel from '../models/customerModel.js';

const router = express.Router();

// GET /api/customers - Listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const customers = await customerModel.getAllCustomers();
    const clientCustomers = customers.map(customerModel.toClientModel);
    res.json(clientCustomers);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ message: 'Erro ao buscar clientes', error: error.message });
  }
});

// GET /api/customers/:id - Buscar cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await customerModel.getCustomerById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    
    res.json(customerModel.toClientModel(customer));
  } catch (error) {
    console.error(`Erro ao buscar cliente ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao buscar cliente', error: error.message });
  }
});

// POST /api/customers - Criar novo cliente
router.post('/', async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ message: 'Nome do cliente é obrigatório' });
    }
    
    const newCustomer = await customerModel.createCustomer(req.body);
    res.status(201).json(customerModel.toClientModel(newCustomer));
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ message: 'Erro ao criar cliente', error: error.message });
  }
});

// PUT /api/customers/:id - Atualizar cliente existente
router.put('/:id', async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ message: 'Nome do cliente é obrigatório' });
    }
    
    const customer = await customerModel.getCustomerById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    
    const updatedCustomer = await customerModel.updateCustomer(req.params.id, req.body);
    res.json(customerModel.toClientModel(updatedCustomer));
  } catch (error) {
    console.error(`Erro ao atualizar cliente ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao atualizar cliente', error: error.message });
  }
});

// DELETE /api/customers/:id - Excluir cliente
router.delete('/:id', async (req, res) => {
  try {
    const customer = await customerModel.getCustomerById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    
    await customerModel.deleteCustomer(req.params.id);
    res.json({ message: 'Cliente excluído com sucesso', id: req.params.id });
  } catch (error) {
    console.error(`Erro ao excluir cliente ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao excluir cliente', error: error.message });
  }
});

// GET /api/customers/search/:term - Buscar clientes por termo
router.get('/search/:term', async (req, res) => {
  try {
    const customers = await customerModel.searchCustomers(req.params.term);
    const clientCustomers = customers.map(customerModel.toClientModel);
    res.json(clientCustomers);
  } catch (error) {
    console.error(`Erro ao pesquisar clientes por "${req.params.term}":`, error);
    res.status(500).json({ message: 'Erro ao pesquisar clientes', error: error.message });
  }
});

export default router; 