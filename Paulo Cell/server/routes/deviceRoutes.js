import express from 'express';
import * as deviceModel from '../models/deviceModel.js';

const router = express.Router();

// GET /api/devices - Listar todos os dispositivos
router.get('/', async (req, res) => {
  try {
    const devices = await deviceModel.getAllDevices();
    const clientDevices = devices.map(deviceModel.toClientModel);
    res.json(clientDevices);
  } catch (error) {
    console.error('Erro ao buscar dispositivos:', error);
    res.status(500).json({ message: 'Erro ao buscar dispositivos', error: error.message });
  }
});

// GET /api/devices/:id - Buscar dispositivo por ID
router.get('/:id', async (req, res) => {
  try {
    const device = await deviceModel.getDeviceById(req.params.id);
    
    if (!device) {
      return res.status(404).json({ message: 'Dispositivo não encontrado' });
    }
    
    res.json(deviceModel.toClientModel(device));
  } catch (error) {
    console.error(`Erro ao buscar dispositivo ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao buscar dispositivo', error: error.message });
  }
});

// GET /api/devices/owner/:ownerId - Buscar dispositivos por proprietário (cliente)
router.get('/owner/:ownerId', async (req, res) => {
  try {
    const devices = await deviceModel.getDevicesByOwner(req.params.ownerId);
    const clientDevices = devices.map(deviceModel.toClientModel);
    res.json(clientDevices);
  } catch (error) {
    console.error(`Erro ao buscar dispositivos do cliente ${req.params.ownerId}:`, error);
    res.status(500).json({ message: 'Erro ao buscar dispositivos do cliente', error: error.message });
  }
});

// POST /api/devices - Criar novo dispositivo
router.post('/', async (req, res) => {
  try {
    if (!req.body.brand || !req.body.model) {
      return res.status(400).json({ message: 'Marca e modelo do dispositivo são obrigatórios' });
    }
    
    const newDevice = await deviceModel.createDevice(req.body);
    res.status(201).json(deviceModel.toClientModel(newDevice));
  } catch (error) {
    console.error('Erro ao criar dispositivo:', error);
    res.status(500).json({ message: 'Erro ao criar dispositivo', error: error.message });
  }
});

// PUT /api/devices/:id - Atualizar dispositivo existente
router.put('/:id', async (req, res) => {
  try {
    if (!req.body.brand || !req.body.model) {
      return res.status(400).json({ message: 'Marca e modelo do dispositivo são obrigatórios' });
    }
    
    const device = await deviceModel.getDeviceById(req.params.id);
    
    if (!device) {
      return res.status(404).json({ message: 'Dispositivo não encontrado' });
    }
    
    const updatedDevice = await deviceModel.updateDevice(req.params.id, req.body);
    res.json(deviceModel.toClientModel(updatedDevice));
  } catch (error) {
    console.error(`Erro ao atualizar dispositivo ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao atualizar dispositivo', error: error.message });
  }
});

// DELETE /api/devices/:id - Excluir dispositivo
router.delete('/:id', async (req, res) => {
  try {
    const device = await deviceModel.getDeviceById(req.params.id);
    
    if (!device) {
      return res.status(404).json({ message: 'Dispositivo não encontrado' });
    }
    
    await deviceModel.deleteDevice(req.params.id);
    res.json({ message: 'Dispositivo excluído com sucesso', id: req.params.id });
  } catch (error) {
    console.error(`Erro ao excluir dispositivo ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao excluir dispositivo', error: error.message });
  }
});

export default router; 