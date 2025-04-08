// Rota para sincronização completa
router.post('/all', async (req, res) => {
  try {
    console.log('🔄 Iniciando sincronização completa...');
    
    // Obter todos os dados atualizados
    const customers = await customerModel.getAllCustomers();
    const devices = await deviceModel.getAllDevices();
    const services = await serviceModel.getAllServices();
    const inventoryItems = await inventoryModel.getAllItems();
    const settings = await settingsModel.getAllSettings();
    const documents = await documentModel.getAllDocuments();
    
    console.log(`✅ Sincronização completa realizada com sucesso: 
      - ${customers.length} clientes
      - ${devices.length} dispositivos
      - ${services.length} serviços
      - ${inventoryItems.length} itens de inventário
      - ${documents.length} documentos`);
      
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        customers,
        devices,
        services,
        inventory: inventoryItems,
        settings,
        documents
      }
    });
  } catch (error) {
    console.error('❌ Erro na sincronização completa:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro na sincronização completa', 
      message: error.message 
    });
  }
}); 