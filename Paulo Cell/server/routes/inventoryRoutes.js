import express from 'express';
import * as inventoryModel from '../models/inventoryModel.js';

const router = express.Router();

// GET /api/inventory - Listar todos os itens do inventário
router.get('/', async (req, res) => {
  try {
    const items = await inventoryModel.getAllItems();
    const clientItems = items.map(inventoryModel.toClientModel);
    res.json(clientItems);
  } catch (error) {
    console.error('Erro ao buscar itens do inventário:', error);
    res.status(500).json({ message: 'Erro ao buscar itens do inventário', error: error.message });
  }
});

// GET /api/inventory/:id - Buscar item do inventário por ID
router.get('/:id', async (req, res) => {
  try {
    const item = await inventoryModel.getItemById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }
    
    res.json(inventoryModel.toClientModel(item));
  } catch (error) {
    console.error(`Erro ao buscar item do inventário ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao buscar item do inventário', error: error.message });
  }
});

// GET /api/inventory/search/:term - Buscar itens do inventário por termo
router.get('/search/:term', async (req, res) => {
  try {
    const items = await inventoryModel.searchItems(req.params.term);
    const clientItems = items.map(inventoryModel.toClientModel);
    res.json(clientItems);
  } catch (error) {
    console.error(`Erro ao buscar itens do inventário com termo "${req.params.term}":`, error);
    res.status(500).json({ message: 'Erro ao buscar itens do inventário', error: error.message });
  }
});

// POST /api/inventory - Criar novo item no inventário
router.post('/', async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ message: 'Nome do item é obrigatório' });
    }
    
    const newItem = await inventoryModel.createItem(req.body);
    res.status(201).json(inventoryModel.toClientModel(newItem));
  } catch (error) {
    console.error('Erro ao criar item no inventário:', error);
    res.status(500).json({ message: 'Erro ao criar item no inventário', error: error.message });
  }
});

// PUT /api/inventory/:id - Atualizar item existente no inventário
router.put('/:id', async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ message: 'Nome do item é obrigatório' });
    }
    
    const item = await inventoryModel.getItemById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }
    
    const updatedItem = await inventoryModel.updateItem(req.params.id, req.body);
    res.json(inventoryModel.toClientModel(updatedItem));
  } catch (error) {
    console.error(`Erro ao atualizar item do inventário ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao atualizar item do inventário', error: error.message });
  }
});

// PATCH /api/inventory/:id/quantity - Atualizar apenas a quantidade de um item
router.patch('/:id/quantity', async (req, res) => {
  try {
    if (req.body.quantity === undefined) {
      return res.status(400).json({ message: 'Quantidade é obrigatória' });
    }
    
    const item = await inventoryModel.getItemById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }
    
    const updatedItem = await inventoryModel.updateItemQuantity(
      req.params.id, 
      req.body.quantity, 
      req.body.notes
    );
    
    res.json(inventoryModel.toClientModel(updatedItem));
  } catch (error) {
    console.error(`Erro ao atualizar quantidade do item ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao atualizar quantidade do item', error: error.message });
  }
});

// DELETE /api/inventory/:id - Excluir item do inventário
router.delete('/:id', async (req, res) => {
  try {
    const item = await inventoryModel.getItemById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }
    
    await inventoryModel.deleteItem(req.params.id);
    res.json({ message: 'Item excluído com sucesso', id: req.params.id });
  } catch (error) {
    console.error(`Erro ao excluir item do inventário ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao excluir item do inventário', error: error.message });
  }
});

export default router; 