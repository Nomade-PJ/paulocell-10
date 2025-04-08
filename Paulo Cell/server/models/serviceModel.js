import { query } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Obter todos os serviços da base de dados
 */
export async function getAllServices() {
  try {
    console.log('Obtendo todos os serviços do banco de dados...');
    const services = await query('SELECT * FROM services ORDER BY created_at DESC');
    console.log(`${services.length} serviços encontrados no banco de dados`);
    return services;
  } catch (error) {
    console.error('Erro ao obter serviços:', error);
    throw error;
  }
}

/**
 * Obter serviço por ID
 */
export async function getServiceById(id) {
  try {
    console.log(`Obtendo serviço com ID ${id} do banco de dados...`);
    const services = await query('SELECT * FROM services WHERE id = ?', [id]);
    return services.length > 0 ? services[0] : null;
  } catch (error) {
    console.error(`Erro ao obter serviço ${id}:`, error);
    throw error;
  }
}

/**
 * Obter serviços por cliente
 */
export async function getServicesByCustomer(customerId) {
  try {
    console.log(`Obtendo serviços do cliente ${customerId} do banco de dados...`);
    const services = await query('SELECT * FROM services WHERE customer_id = ? ORDER BY created_at DESC', [customerId]);
    console.log(`${services.length} serviços encontrados para o cliente ${customerId}`);
    return services;
  } catch (error) {
    console.error(`Erro ao obter serviços do cliente ${customerId}:`, error);
    throw error;
  }
}

/**
 * Obter serviços por dispositivo
 */
export async function getServicesByDevice(deviceId) {
  try {
    console.log(`Obtendo serviços do dispositivo ${deviceId} do banco de dados...`);
    const services = await query('SELECT * FROM services WHERE device_id = ? ORDER BY created_at DESC', [deviceId]);
    console.log(`${services.length} serviços encontrados para o dispositivo ${deviceId}`);
    return services;
  } catch (error) {
    console.error(`Erro ao obter serviços do dispositivo ${deviceId}:`, error);
    throw error;
  }
}

/**
 * Criar novo serviço
 */
export async function createService(serviceData) {
  try {
    console.log('Criando novo serviço no banco de dados:', serviceData);
    
    // Validar campos obrigatórios
    if (!serviceData.description || !serviceData.customerId) {
      throw new Error('Descrição e ID do cliente são obrigatórios');
    }
    
    // Gerar ID único se não fornecido
    const id = serviceData.id || uuidv4();
    const now = Date.now();
    
    // Preparar dados para inserção
    const service = {
      id,
      customer_id: serviceData.customerId,
      device_id: serviceData.deviceId || null,
      type: serviceData.type || 'repair',
      description: serviceData.description,
      status: serviceData.status || 'pending',
      price: serviceData.price || 0,
      cost: serviceData.cost || 0,
      warranty_days: serviceData.warrantyDays || 0,
      diagnosis: serviceData.diagnosis || null,
      solution: serviceData.solution || null,
      technician: serviceData.technician || null,
      scheduled_date: serviceData.scheduledDate || null,
      start_date: serviceData.startDate || null,
      finish_date: serviceData.finishDate || null,
      parts_used: JSON.stringify(serviceData.partsUsed || []),
      notes: serviceData.notes || null,
      created_at: serviceData.createdAt || now,
      updated_at: now
    };
    
    // Executar a inserção
    await query(`
      INSERT INTO services 
      (id, customer_id, device_id, type, description, status, price, cost, warranty_days, 
       diagnosis, solution, technician, scheduled_date, start_date, finish_date, 
       parts_used, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      service.id,
      service.customer_id,
      service.device_id,
      service.type,
      service.description,
      service.status,
      service.price,
      service.cost,
      service.warranty_days,
      service.diagnosis,
      service.solution,
      service.technician,
      service.scheduled_date,
      service.start_date,
      service.finish_date,
      service.parts_used,
      service.notes,
      service.created_at,
      service.updated_at
    ]);
    
    console.log(`Serviço criado com ID: ${service.id}`);
    return service;
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    throw error;
  }
}

/**
 * Atualizar serviço existente
 */
export async function updateService(id, serviceData) {
  try {
    console.log(`Atualizando serviço ${id} no banco de dados:`, serviceData);
    
    // Verificar se o serviço existe
    const existingService = await getServiceById(id);
    if (!existingService) {
      throw new Error(`Serviço com ID ${id} não encontrado`);
    }
    
    // Preparar dados para atualização
    const updatedService = {
      customer_id: serviceData.customerId ?? existingService.customer_id,
      device_id: serviceData.deviceId ?? existingService.device_id,
      type: serviceData.type ?? existingService.type,
      description: serviceData.description ?? existingService.description,
      status: serviceData.status ?? existingService.status,
      price: serviceData.price ?? existingService.price,
      cost: serviceData.cost ?? existingService.cost,
      warranty_days: serviceData.warrantyDays ?? existingService.warranty_days,
      diagnosis: serviceData.diagnosis ?? existingService.diagnosis,
      solution: serviceData.solution ?? existingService.solution,
      technician: serviceData.technician ?? existingService.technician,
      scheduled_date: serviceData.scheduledDate ?? existingService.scheduled_date,
      start_date: serviceData.startDate ?? existingService.start_date,
      finish_date: serviceData.finishDate ?? existingService.finish_date,
      parts_used: serviceData.partsUsed ? JSON.stringify(serviceData.partsUsed) : existingService.parts_used,
      notes: serviceData.notes ?? existingService.notes,
      updated_at: Date.now()
    };
    
    // Executar a atualização
    await query(`
      UPDATE services
      SET 
        customer_id = ?,
        device_id = ?,
        type = ?,
        description = ?,
        status = ?,
        price = ?,
        cost = ?,
        warranty_days = ?,
        diagnosis = ?,
        solution = ?,
        technician = ?,
        scheduled_date = ?,
        start_date = ?,
        finish_date = ?,
        parts_used = ?,
        notes = ?,
        updated_at = ?
      WHERE id = ?
    `, [
      updatedService.customer_id,
      updatedService.device_id,
      updatedService.type,
      updatedService.description,
      updatedService.status,
      updatedService.price,
      updatedService.cost,
      updatedService.warranty_days,
      updatedService.diagnosis,
      updatedService.solution,
      updatedService.technician,
      updatedService.scheduled_date,
      updatedService.start_date,
      updatedService.finish_date,
      updatedService.parts_used,
      updatedService.notes,
      updatedService.updated_at,
      id
    ]);
    
    console.log(`Serviço ${id} atualizado com sucesso`);
    return { ...existingService, ...updatedService, id };
  } catch (error) {
    console.error(`Erro ao atualizar serviço ${id}:`, error);
    throw error;
  }
}

/**
 * Excluir serviço
 */
export async function deleteService(id) {
  try {
    console.log(`Excluindo serviço ${id} do banco de dados...`);
    
    // Verificar se o serviço existe
    const existingService = await getServiceById(id);
    if (!existingService) {
      throw new Error(`Serviço com ID ${id} não encontrado`);
    }
    
    // Executar a exclusão
    await query('DELETE FROM services WHERE id = ?', [id]);
    
    console.log(`Serviço ${id} excluído com sucesso`);
    return { id, deleted: true };
  } catch (error) {
    console.error(`Erro ao excluir serviço ${id}:`, error);
    throw error;
  }
}

/**
 * Converter modelo do banco para modelo do cliente
 */
export function toClientModel(service) {
  // Converter parts_used de JSON para array
  let partsUsed = [];
  try {
    if (service.parts_used) {
      partsUsed = JSON.parse(service.parts_used);
    }
  } catch (e) {
    console.error('Erro ao converter parts_used:', e);
  }
  
  return {
    id: service.id,
    customerId: service.customer_id,
    deviceId: service.device_id,
    type: service.type,
    description: service.description,
    status: service.status,
    price: service.price,
    cost: service.cost,
    warrantyDays: service.warranty_days,
    diagnosis: service.diagnosis,
    solution: service.solution,
    technician: service.technician,
    scheduledDate: service.scheduled_date,
    startDate: service.start_date,
    finishDate: service.finish_date,
    partsUsed: partsUsed,
    notes: service.notes,
    createdAt: service.created_at,
    updatedAt: service.updated_at
  };
} 