import express from 'express';
import * as customerModel from '../models/customerModel.js';
// Importe outros modelos conforme necessário

const router = express.Router();

// POST /api/sync - Sincronizar dados do localStorage com o banco de dados
router.post('/', async (req, res) => {
  try {
    console.log('=================== INICIANDO SINCRONIZAÇÃO ===================');
    const { customers, devices, services } = req.body;
    
    // Contadores de operações
    const stats = {
      customers: { created: 0, updated: 0, failed: 0, total: 0 },
      devices: { created: 0, updated: 0, failed: 0, total: 0 },
      services: { created: 0, updated: 0, failed: 0, total: 0 }
    };
    
    // Processar clientes
    if (customers && Array.isArray(customers)) {
      stats.customers.total = customers.length;
      console.log(`Sincronizando ${customers.length} clientes...`);
      
      for (const customer of customers) {
        try {
          if (!customer.id) {
            console.error('Cliente sem ID, impossível sincronizar:', customer);
            stats.customers.failed++;
            continue;
          }
          
          // Verificar se o cliente já existe
          const existingCustomer = await customerModel.getCustomerById(customer.id);
          
          if (existingCustomer) {
            // Atualizar cliente existente
            console.log(`Atualizando cliente: ${customer.id} - ${customer.name}`);
            await customerModel.updateCustomer(customer.id, customer);
            stats.customers.updated++;
          } else {
            // Criar novo cliente
            console.log(`Criando novo cliente: ${customer.id} - ${customer.name}`);
            await customerModel.createCustomer(customer);
            stats.customers.created++;
          }
        } catch (error) {
          console.error(`Erro ao sincronizar cliente ${customer.id || 'sem ID'}:`, error);
          stats.customers.failed++;
        }
      }
      
      console.log(`Sincronização de clientes concluída: ${stats.customers.created} criados, ${stats.customers.updated} atualizados, ${stats.customers.failed} falhas`);
    } else {
      console.log('Nenhum cliente para sincronizar');
    }
    
    // Processar dispositivos (implementar quando houver modelo)
    // if (devices && Array.isArray(devices)) {
    //   // Lógica similar ao processamento de clientes
    // }
    
    // Processar serviços (implementar quando houver modelo)
    // if (services && Array.isArray(services)) {
    //   // Lógica similar ao processamento de clientes
    // }
    
    // Carregar clientes atualizados para retornar ao cliente
    console.log('Carregando clientes atualizados do banco de dados...');
    const updatedCustomers = await customerModel.getAllCustomers();
    const clientCustomers = updatedCustomers.map(customerModel.toClientModel);
    
    // Responder com estatísticas da sincronização e dados atualizados
    console.log('=================== SINCRONIZAÇÃO CONCLUÍDA ===================');
    res.json({
      message: 'Sincronização concluída',
      stats,
      timestamp: new Date().toISOString(),
      data: {
        customers: clientCustomers
        // Adicionar outros dados conforme necessário
      }
    });
  } catch (error) {
    console.error('Erro na sincronização:', error);
    res.status(500).json({ message: 'Erro na sincronização', error: error.message });
  }
});

// GET /api/sync/fetch - Obter todos os dados atualizados do banco de dados
router.get('/fetch', async (req, res) => {
  try {
    console.log('=================== OBTENDO DADOS DO SERVIDOR ===================');
    
    // Carregar dados de clientes do banco de dados
    console.log('Carregando clientes do banco de dados...');
    const customers = await customerModel.getAllCustomers();
    const clientCustomers = customers.map(customerModel.toClientModel);
    
    // Carregar dispositivos (implementar quando houver modelo)
    // const devices = await deviceModel.getAllDevices();
    // const clientDevices = devices.map(deviceModel.toClientModel);
    
    // Carregar serviços (implementar quando houver modelo)
    // const services = await serviceModel.getAllServices();
    // const clientServices = services.map(serviceModel.toClientModel);
    
    // Responder com os dados atualizados
    console.log(`Enviando dados: ${clientCustomers.length} clientes`);
    console.log('=================== DADOS OBTIDOS COM SUCESSO ===================');
    res.json({
      message: 'Dados obtidos com sucesso',
      timestamp: new Date().toISOString(),
      data: {
        customers: clientCustomers,
        // devices: clientDevices,
        // services: clientServices
      }
    });
  } catch (error) {
    console.error('Erro ao obter dados do servidor:', error);
    res.status(500).json({ message: 'Erro ao obter dados do servidor', error: error.message });
  }
});

export default router; 