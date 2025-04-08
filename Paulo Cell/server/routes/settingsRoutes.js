import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// GET /api/settings/company - Obter configurações da empresa
router.get('/company', async (req, res) => {
  try {
    const settings = await query('SELECT * FROM company_settings WHERE id = 1');
    
    if (settings.length === 0) {
      return res.status(404).json({ message: 'Configurações da empresa não encontradas' });
    }
    
    // Converter endereço de JSON para objeto (se for string)
    const companyData = settings[0];
    if (typeof companyData.address === 'string') {
      try {
        companyData.address = JSON.parse(companyData.address);
      } catch (e) {
        console.warn('Erro ao analisar endereço:', e);
      }
    }
    
    res.json(companyData);
  } catch (error) {
    console.error('Erro ao obter configurações da empresa:', error);
    res.status(500).json({ message: 'Erro ao obter configurações da empresa', error: error.message });
  }
});

// PUT /api/settings/company - Atualizar configurações da empresa
router.put('/company', async (req, res) => {
  try {
    const { name, phone, email, address, cpf_cnpj, logo_url, primary_color, secondary_color, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Nome da empresa é obrigatório' });
    }
    
    // Converter endereço para JSON se for um objeto
    const addressStr = typeof address === 'object' ? JSON.stringify(address) : address;
    
    const now = Date.now();
    
    await query(`
      UPDATE company_settings
      SET 
        name = ?,
        phone = ?,
        email = ?,
        address = ?,
        cpf_cnpj = ?,
        logo_url = ?,
        primary_color = ?,
        secondary_color = ?,
        notes = ?,
        updated_at = ?
      WHERE id = 1
    `, [
      name,
      phone || null,
      email || null,
      addressStr || null,
      cpf_cnpj || null,
      logo_url || null,
      primary_color || null,
      secondary_color || null,
      notes || null,
      now
    ]);
    
    // Obter dados atualizados
    const updatedSettings = await query('SELECT * FROM company_settings WHERE id = 1');
    
    // Converter endereço de JSON para objeto (se for string)
    const companyData = updatedSettings[0];
    if (typeof companyData.address === 'string') {
      try {
        companyData.address = JSON.parse(companyData.address);
      } catch (e) {
        console.warn('Erro ao analisar endereço:', e);
      }
    }
    
    res.json(companyData);
  } catch (error) {
    console.error('Erro ao atualizar configurações da empresa:', error);
    res.status(500).json({ message: 'Erro ao atualizar configurações da empresa', error: error.message });
  }
});

// GET /api/settings/notifications - Obter configurações de notificações
router.get('/notifications', async (req, res) => {
  try {
    const settings = await query('SELECT * FROM notification_settings WHERE id = 1');
    
    if (settings.length === 0) {
      return res.status(404).json({ message: 'Configurações de notificações não encontradas' });
    }
    
    res.json(settings[0]);
  } catch (error) {
    console.error('Erro ao obter configurações de notificações:', error);
    res.status(500).json({ message: 'Erro ao obter configurações de notificações', error: error.message });
  }
});

// PUT /api/settings/notifications - Atualizar configurações de notificações
router.put('/notifications', async (req, res) => {
  try {
    const { 
      new_service, 
      service_completed, 
      low_inventory, 
      customer_birthday, 
      email_notifications, 
      sms_notifications 
    } = req.body;
    
    const now = Date.now();
    
    await query(`
      UPDATE notification_settings
      SET 
        new_service = ?,
        service_completed = ?,
        low_inventory = ?,
        customer_birthday = ?,
        email_notifications = ?,
        sms_notifications = ?,
        updated_at = ?
      WHERE id = 1
    `, [
      new_service !== undefined ? new_service : true,
      service_completed !== undefined ? service_completed : true,
      low_inventory !== undefined ? low_inventory : true,
      customer_birthday !== undefined ? customer_birthday : false,
      email_notifications !== undefined ? email_notifications : true,
      sms_notifications !== undefined ? sms_notifications : false,
      now
    ]);
    
    // Obter dados atualizados
    const updatedSettings = await query('SELECT * FROM notification_settings WHERE id = 1');
    res.json(updatedSettings[0]);
  } catch (error) {
    console.error('Erro ao atualizar configurações de notificações:', error);
    res.status(500).json({ message: 'Erro ao atualizar configurações de notificações', error: error.message });
  }
});

// GET /api/settings/invoice-api - Obter configurações da API de notas fiscais
router.get('/invoice-api', async (req, res) => {
  try {
    const settings = await query('SELECT * FROM invoice_api_settings WHERE id = 1');
    
    if (settings.length === 0) {
      return res.status(404).json({ message: 'Configurações da API de notas fiscais não encontradas' });
    }
    
    res.json(settings[0]);
  } catch (error) {
    console.error('Erro ao obter configurações da API de notas fiscais:', error);
    res.status(500).json({ message: 'Erro ao obter configurações da API de notas fiscais', error: error.message });
  }
});

// PUT /api/settings/invoice-api - Atualizar configurações da API de notas fiscais
router.put('/invoice-api', async (req, res) => {
  try {
    const { api_key, environment, company_id } = req.body;
    
    const now = Date.now();
    
    await query(`
      UPDATE invoice_api_settings
      SET 
        api_key = ?,
        environment = ?,
        company_id = ?,
        updated_at = ?
      WHERE id = 1
    `, [
      api_key || '',
      environment || 'sandbox',
      company_id || '',
      now
    ]);
    
    // Obter dados atualizados
    const updatedSettings = await query('SELECT * FROM invoice_api_settings WHERE id = 1');
    res.json(updatedSettings[0]);
  } catch (error) {
    console.error('Erro ao atualizar configurações da API de notas fiscais:', error);
    res.status(500).json({ message: 'Erro ao atualizar configurações da API de notas fiscais', error: error.message });
  }
});

export default router; 