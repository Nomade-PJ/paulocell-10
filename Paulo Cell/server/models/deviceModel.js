import { query } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Obter todos os dispositivos da base de dados
 */
export async function getAllDevices() {
  try {
    console.log('Obtendo todos os dispositivos do banco de dados...');
    const devices = await query('SELECT * FROM devices ORDER BY created_at DESC');
    console.log(`${devices.length} dispositivos encontrados no banco de dados`);
    return devices;
  } catch (error) {
    console.error('Erro ao obter dispositivos:', error);
    throw error;
  }
}

/**
 * Obter dispositivo por ID
 */
export async function getDeviceById(id) {
  try {
    console.log(`Obtendo dispositivo com ID ${id} do banco de dados...`);
    const devices = await query('SELECT * FROM devices WHERE id = ?', [id]);
    return devices.length > 0 ? devices[0] : null;
  } catch (error) {
    console.error(`Erro ao obter dispositivo ${id}:`, error);
    throw error;
  }
}

/**
 * Obter dispositivos por proprietário (cliente)
 */
export async function getDevicesByOwner(ownerId) {
  try {
    console.log(`Obtendo dispositivos do cliente ${ownerId} do banco de dados...`);
    const devices = await query('SELECT * FROM devices WHERE owner = ? ORDER BY created_at DESC', [ownerId]);
    console.log(`${devices.length} dispositivos encontrados para o cliente ${ownerId}`);
    return devices;
  } catch (error) {
    console.error(`Erro ao obter dispositivos do cliente ${ownerId}:`, error);
    throw error;
  }
}

/**
 * Criar novo dispositivo
 */
export async function createDevice(deviceData) {
  try {
    console.log('Criando novo dispositivo no banco de dados:', deviceData);
    
    // Validar campos obrigatórios
    if (!deviceData.brand || !deviceData.model) {
      throw new Error('Marca e modelo do dispositivo são obrigatórios');
    }
    
    // Gerar ID único se não fornecido
    const id = deviceData.id || uuidv4();
    const now = Date.now();
    
    // Preparar dados para inserção
    const device = {
      id,
      brand: deviceData.brand,
      model: deviceData.model,
      owner: deviceData.owner || null,
      serial_number: deviceData.serialNumber || null,
      imei: deviceData.imei || null,
      purchase_date: deviceData.purchaseDate || null,
      status: deviceData.status || 'active',
      condition: deviceData.condition || 'good',
      notes: deviceData.notes || null,
      created_at: deviceData.createdAt || now,
      updated_at: now
    };
    
    // Executar a inserção
    await query(`
      INSERT INTO devices 
      (id, brand, model, owner, serial_number, imei, purchase_date, status, condition, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      device.id,
      device.brand,
      device.model,
      device.owner,
      device.serial_number,
      device.imei,
      device.purchase_date,
      device.status,
      device.condition,
      device.notes,
      device.created_at,
      device.updated_at
    ]);
    
    console.log(`Dispositivo criado com ID: ${device.id}`);
    return device;
  } catch (error) {
    console.error('Erro ao criar dispositivo:', error);
    throw error;
  }
}

/**
 * Atualizar dispositivo existente
 */
export async function updateDevice(id, deviceData) {
  try {
    console.log(`Atualizando dispositivo ${id} no banco de dados:`, deviceData);
    
    // Validar campos obrigatórios
    if (!deviceData.brand || !deviceData.model) {
      throw new Error('Marca e modelo do dispositivo são obrigatórios');
    }
    
    // Verificar se o dispositivo existe
    const existingDevice = await getDeviceById(id);
    if (!existingDevice) {
      throw new Error(`Dispositivo com ID ${id} não encontrado`);
    }
    
    // Preparar dados para atualização
    const updatedDevice = {
      brand: deviceData.brand,
      model: deviceData.model,
      owner: deviceData.owner ?? existingDevice.owner,
      serial_number: deviceData.serialNumber ?? existingDevice.serial_number,
      imei: deviceData.imei ?? existingDevice.imei,
      purchase_date: deviceData.purchaseDate ?? existingDevice.purchase_date,
      status: deviceData.status ?? existingDevice.status,
      condition: deviceData.condition ?? existingDevice.condition,
      notes: deviceData.notes ?? existingDevice.notes,
      updated_at: Date.now()
    };
    
    // Executar a atualização
    await query(`
      UPDATE devices
      SET 
        brand = ?,
        model = ?,
        owner = ?,
        serial_number = ?,
        imei = ?,
        purchase_date = ?,
        status = ?,
        condition = ?,
        notes = ?,
        updated_at = ?
      WHERE id = ?
    `, [
      updatedDevice.brand,
      updatedDevice.model,
      updatedDevice.owner,
      updatedDevice.serial_number,
      updatedDevice.imei,
      updatedDevice.purchase_date,
      updatedDevice.status,
      updatedDevice.condition,
      updatedDevice.notes,
      updatedDevice.updated_at,
      id
    ]);
    
    console.log(`Dispositivo ${id} atualizado com sucesso`);
    return { ...existingDevice, ...updatedDevice, id };
  } catch (error) {
    console.error(`Erro ao atualizar dispositivo ${id}:`, error);
    throw error;
  }
}

/**
 * Excluir dispositivo
 */
export async function deleteDevice(id) {
  try {
    console.log(`Excluindo dispositivo ${id} do banco de dados...`);
    
    // Verificar se o dispositivo existe
    const existingDevice = await getDeviceById(id);
    if (!existingDevice) {
      throw new Error(`Dispositivo com ID ${id} não encontrado`);
    }
    
    // Executar a exclusão
    await query('DELETE FROM devices WHERE id = ?', [id]);
    
    console.log(`Dispositivo ${id} excluído com sucesso`);
    return { id, deleted: true };
  } catch (error) {
    console.error(`Erro ao excluir dispositivo ${id}:`, error);
    throw error;
  }
}

/**
 * Converter modelo do banco para modelo do cliente
 */
export function toClientModel(device) {
  return {
    id: device.id,
    brand: device.brand,
    model: device.model,
    owner: device.owner,
    serialNumber: device.serial_number,
    imei: device.imei,
    purchaseDate: device.purchase_date,
    status: device.status,
    condition: device.condition,
    notes: device.notes,
    createdAt: device.created_at,
    updatedAt: device.updated_at
  };
} 