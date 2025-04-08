import { query } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Obter todos os itens do inventário
 */
export async function getAllItems() {
  try {
    console.log('Obtendo todos os itens do inventário do banco de dados...');
    const items = await query('SELECT * FROM inventory ORDER BY name ASC');
    console.log(`${items.length} itens encontrados no banco de dados`);
    return items;
  } catch (error) {
    console.error('Erro ao obter itens do inventário:', error);
    throw error;
  }
}

/**
 * Obter item do inventário por ID
 */
export async function getItemById(id) {
  try {
    console.log(`Obtendo item do inventário com ID ${id} do banco de dados...`);
    const items = await query('SELECT * FROM inventory WHERE id = ?', [id]);
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    console.error(`Erro ao obter item do inventário ${id}:`, error);
    throw error;
  }
}

/**
 * Buscar itens do inventário por termo
 */
export async function searchItems(term) {
  try {
    console.log(`Buscando itens do inventário com termo "${term}"...`);
    const searchTerm = `%${term}%`;
    const items = await query(
      'SELECT * FROM inventory WHERE name LIKE ? OR sku LIKE ? OR category LIKE ? ORDER BY name ASC',
      [searchTerm, searchTerm, searchTerm]
    );
    console.log(`${items.length} itens encontrados para o termo "${term}"`);
    return items;
  } catch (error) {
    console.error(`Erro ao buscar itens do inventário com termo "${term}":`, error);
    throw error;
  }
}

/**
 * Criar novo item no inventário
 */
export async function createItem(itemData) {
  try {
    console.log('Criando novo item no inventário:', itemData);
    
    // Validar campos obrigatórios
    if (!itemData.name) {
      throw new Error('Nome do item é obrigatório');
    }
    
    // Gerar ID único se não fornecido
    const id = itemData.id || uuidv4();
    const now = Date.now();
    
    // Preparar dados para inserção
    const item = {
      id,
      name: itemData.name,
      sku: itemData.sku || null,
      description: itemData.description || null,
      category: itemData.category || 'Outros',
      quantity: itemData.quantity || 0,
      unit: itemData.unit || 'un',
      cost_price: itemData.costPrice || 0,
      sell_price: itemData.sellPrice || 0,
      min_stock: itemData.minStock || 0,
      location: itemData.location || null,
      supplier: itemData.supplier || null,
      last_purchase: itemData.lastPurchase || null,
      image_url: itemData.imageUrl || null,
      notes: itemData.notes || null,
      created_at: itemData.createdAt || now,
      updated_at: now
    };
    
    // Executar a inserção
    await query(`
      INSERT INTO inventory 
      (id, name, sku, description, category, quantity, unit, cost_price, sell_price, 
       min_stock, location, supplier, last_purchase, image_url, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      item.id,
      item.name,
      item.sku,
      item.description,
      item.category,
      item.quantity,
      item.unit,
      item.cost_price,
      item.sell_price,
      item.min_stock,
      item.location,
      item.supplier,
      item.last_purchase,
      item.image_url,
      item.notes,
      item.created_at,
      item.updated_at
    ]);
    
    console.log(`Item de inventário criado com ID: ${item.id}`);
    return item;
  } catch (error) {
    console.error('Erro ao criar item no inventário:', error);
    throw error;
  }
}

/**
 * Atualizar item existente no inventário
 */
export async function updateItem(id, itemData) {
  try {
    console.log(`Atualizando item do inventário ${id}:`, itemData);
    
    // Verificar se o item existe
    const existingItem = await getItemById(id);
    if (!existingItem) {
      throw new Error(`Item do inventário com ID ${id} não encontrado`);
    }
    
    // Preparar dados para atualização
    const updatedItem = {
      name: itemData.name ?? existingItem.name,
      sku: itemData.sku ?? existingItem.sku,
      description: itemData.description ?? existingItem.description,
      category: itemData.category ?? existingItem.category,
      quantity: itemData.quantity ?? existingItem.quantity,
      unit: itemData.unit ?? existingItem.unit,
      cost_price: itemData.costPrice ?? existingItem.cost_price,
      sell_price: itemData.sellPrice ?? existingItem.sell_price,
      min_stock: itemData.minStock ?? existingItem.min_stock,
      location: itemData.location ?? existingItem.location,
      supplier: itemData.supplier ?? existingItem.supplier,
      last_purchase: itemData.lastPurchase ?? existingItem.last_purchase,
      image_url: itemData.imageUrl ?? existingItem.image_url,
      notes: itemData.notes ?? existingItem.notes,
      updated_at: Date.now()
    };
    
    // Executar a atualização
    await query(`
      UPDATE inventory
      SET 
        name = ?,
        sku = ?,
        description = ?,
        category = ?,
        quantity = ?,
        unit = ?,
        cost_price = ?,
        sell_price = ?,
        min_stock = ?,
        location = ?,
        supplier = ?,
        last_purchase = ?,
        image_url = ?,
        notes = ?,
        updated_at = ?
      WHERE id = ?
    `, [
      updatedItem.name,
      updatedItem.sku,
      updatedItem.description,
      updatedItem.category,
      updatedItem.quantity,
      updatedItem.unit,
      updatedItem.cost_price,
      updatedItem.sell_price,
      updatedItem.min_stock,
      updatedItem.location,
      updatedItem.supplier,
      updatedItem.last_purchase,
      updatedItem.image_url,
      updatedItem.notes,
      updatedItem.updated_at,
      id
    ]);
    
    console.log(`Item do inventário ${id} atualizado com sucesso`);
    return { ...existingItem, ...updatedItem, id };
  } catch (error) {
    console.error(`Erro ao atualizar item do inventário ${id}:`, error);
    throw error;
  }
}

/**
 * Atualizar quantidade de um item do inventário
 */
export async function updateItemQuantity(id, quantity, notes = null) {
  try {
    console.log(`Atualizando quantidade do item ${id} para ${quantity}`);
    
    // Verificar se o item existe
    const existingItem = await getItemById(id);
    if (!existingItem) {
      throw new Error(`Item do inventário com ID ${id} não encontrado`);
    }
    
    // Executar a atualização de quantidade
    await query(`
      UPDATE inventory
      SET quantity = ?, updated_at = ?, notes = CONCAT(IFNULL(notes, ''), ?)
      WHERE id = ?
    `, [
      quantity,
      Date.now(),
      notes ? `\n${new Date().toLocaleString()}: ${notes}` : '',
      id
    ]);
    
    console.log(`Quantidade do item ${id} atualizada para ${quantity}`);
    return { ...existingItem, quantity, updatedAt: Date.now() };
  } catch (error) {
    console.error(`Erro ao atualizar quantidade do item ${id}:`, error);
    throw error;
  }
}

/**
 * Excluir item do inventário
 */
export async function deleteItem(id) {
  try {
    console.log(`Excluindo item do inventário ${id}...`);
    
    // Verificar se o item existe
    const existingItem = await getItemById(id);
    if (!existingItem) {
      throw new Error(`Item do inventário com ID ${id} não encontrado`);
    }
    
    // Executar a exclusão
    await query('DELETE FROM inventory WHERE id = ?', [id]);
    
    console.log(`Item do inventário ${id} excluído com sucesso`);
    return { id, deleted: true };
  } catch (error) {
    console.error(`Erro ao excluir item do inventário ${id}:`, error);
    throw error;
  }
}

/**
 * Converter modelo do banco para modelo do cliente
 */
export function toClientModel(item) {
  return {
    id: item.id,
    name: item.name,
    sku: item.sku,
    description: item.description,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    costPrice: item.cost_price,
    sellPrice: item.sell_price,
    minStock: item.min_stock,
    location: item.location,
    supplier: item.supplier,
    lastPurchase: item.last_purchase,
    imageUrl: item.image_url,
    notes: item.notes,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  };
} 