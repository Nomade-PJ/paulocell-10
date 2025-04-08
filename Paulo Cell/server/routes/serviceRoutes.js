import express from 'express';
import * as serviceModel from '../models/serviceModel.js';

const router = express.Router();

// GET /api/services - Listar todos os serviços
router.get('/', async (req, res) => {
  try {
    const services = await serviceModel.getAllServices();
    const clientServices = services.map(serviceModel.toClientModel);
    res.json(clientServices);
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ message: 'Erro ao buscar serviços', error: error.message });
  }
});

// GET /api/services/:id - Buscar serviço por ID
router.get('/:id', async (req, res) => {
  try {
    const service = await serviceModel.getServiceById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }
    
    res.json(serviceModel.toClientModel(service));
  } catch (error) {
    console.error(`Erro ao buscar serviço ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao buscar serviço', error: error.message });
  }
});

// GET /api/services/customer/:customerId - Buscar serviços por cliente
router.get('/customer/:customerId', async (req, res) => {
  try {
    const services = await serviceModel.getServicesByCustomer(req.params.customerId);
    const clientServices = services.map(serviceModel.toClientModel);
    res.json(clientServices);
  } catch (error) {
    console.error(`Erro ao buscar serviços do cliente ${req.params.customerId}:`, error);
    res.status(500).json({ message: 'Erro ao buscar serviços do cliente', error: error.message });
  }
});

// GET /api/services/device/:deviceId - Buscar serviços por dispositivo
router.get('/device/:deviceId', async (req, res) => {
  try {
    const services = await serviceModel.getServicesByDevice(req.params.deviceId);
    const clientServices = services.map(serviceModel.toClientModel);
    res.json(clientServices);
  } catch (error) {
    console.error(`Erro ao buscar serviços do dispositivo ${req.params.deviceId}:`, error);
    res.status(500).json({ message: 'Erro ao buscar serviços do dispositivo', error: error.message });
  }
});

// POST /api/services - Criar novo serviço
router.post('/', async (req, res) => {
  try {
    if (!req.body.description || !req.body.customerId) {
      return res.status(400).json({ message: 'Descrição e ID do cliente são obrigatórios' });
    }
    
    const newService = await serviceModel.createService(req.body);
    res.status(201).json(serviceModel.toClientModel(newService));
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ message: 'Erro ao criar serviço', error: error.message });
  }
});

// PUT /api/services/:id - Atualizar serviço existente
router.put('/:id', async (req, res) => {
  try {
    const service = await serviceModel.getServiceById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }
    
    const updatedService = await serviceModel.updateService(req.params.id, req.body);
    res.json(serviceModel.toClientModel(updatedService));
  } catch (error) {
    console.error(`Erro ao atualizar serviço ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao atualizar serviço', error: error.message });
  }
});

// DELETE /api/services/:id - Excluir serviço
router.delete('/:id', async (req, res) => {
  try {
    const service = await serviceModel.getServiceById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }
    
    await serviceModel.deleteService(req.params.id);
    res.json({ message: 'Serviço excluído com sucesso', id: req.params.id });
  } catch (error) {
    console.error(`Erro ao excluir serviço ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao excluir serviço', error: error.message });
  }
});

export default router; 