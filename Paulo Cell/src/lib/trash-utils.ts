import { toast } from 'sonner';
import { CustomerAPI, DeviceAPI, ServiceAPI, DocumentAPI, SyncAPI } from './api-service';

// Keys for storing deleted items in localStorage (para modo offline)
export const DELETED_CUSTOMERS_KEY = 'pauloCell_deleted_customers';
export const DELETED_DEVICES_KEY = 'pauloCell_deleted_devices';
export const DELETED_SERVICES_KEY = 'pauloCell_deleted_services';
export const DELETED_DOCUMENTS_KEY = 'pauloCell_deleted_documents';

// Interface para lixeira
interface TrashItem {
  id: string;
  name: string;
  type: string;
  deletedAt: string;
  data: any;
}

/**
 * Move um cliente para a lixeira
 */
export const trashCustomer = async (customerId: string): Promise<boolean> => {
  try {
    // Status online/offline
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      try {
        // 1. Obter dados do cliente para preservar
        const customer = await CustomerAPI.getById(customerId);
        
        // 2. Mover para lixeira no servidor (soft delete)
        await CustomerAPI.moveToTrash(customerId);
        
        // 3. Atualizar lixeira local para fallback offline
        addToLocalTrash('customer', customer);
        
        // 4. Mostrar mensagem de sucesso
        toast.success('Cliente movido para a lixeira');
        return true;
      } catch (apiError) {
        console.error('Erro ao mover cliente para lixeira via API:', apiError);
        
        // Fallback para modo offline
        return trashCustomerOffline(customerId);
      }
    } else {
      // Modo offline
      return trashCustomerOffline(customerId);
    }
  } catch (error) {
    console.error('Erro ao mover cliente para lixeira:', error);
    toast.error('Erro ao mover cliente para lixeira');
    return false;
  }
};

/**
 * Fallback offline para mover um cliente para lixeira
 */
const trashCustomerOffline = async (customerId: string): Promise<boolean> => {
  try {
    // Carregar cliente do localStorage
    const savedCustomers = localStorage.getItem('pauloCell_customers');
    if (!savedCustomers) {
      toast.error('Nenhum dado de cliente encontrado');
      return false;
    }
    
    const customers = JSON.parse(savedCustomers);
    const customer = customers.find((c: any) => c.id === customerId);
    
    if (!customer) {
      toast.error('Cliente não encontrado');
      return false;
    }
    
    // Remover o cliente da lista de clientes
    const updatedCustomers = customers.filter((c: any) => c.id !== customerId);
    localStorage.setItem('pauloCell_customers', JSON.stringify(updatedCustomers));
    
    // Adicionar à lixeira
    addToLocalTrash('customer', customer);
    
    // Sucesso
    toast.success('Cliente movido para a lixeira (modo offline)');
    return true;
  } catch (error) {
    console.error('Erro ao mover cliente para lixeira (offline):', error);
    toast.error('Erro ao mover cliente para lixeira');
    return false;
  }
};

/**
 * Adiciona um item à lixeira local
 */
const addToLocalTrash = (type: string, data: any) => {
  try {
    const trashItem: TrashItem = {
      id: data.id,
      name: data.name || data.description || data.number || 'Item sem nome',
      type,
      deletedAt: new Date().toISOString(),
      data
    };
    
    let trashKey = '';
    switch (type) {
      case 'customer':
        trashKey = DELETED_CUSTOMERS_KEY;
        break;
      case 'device':
        trashKey = DELETED_DEVICES_KEY;
        break;
      case 'service':
        trashKey = DELETED_SERVICES_KEY;
        break;
      case 'document':
        trashKey = DELETED_DOCUMENTS_KEY;
        break;
      default:
        throw new Error('Tipo de item inválido para a lixeira');
    }
    
    // Carregar itens já na lixeira
    const savedItems = localStorage.getItem(trashKey);
    const trashItems = savedItems ? JSON.parse(savedItems) : [];
    
    // Adicionar novo item
    trashItems.push(trashItem);
    
    // Salvar de volta
    localStorage.setItem(trashKey, JSON.stringify(trashItems));
  } catch (error) {
    console.error('Erro ao adicionar item à lixeira local:', error);
  }
};

/**
 * Move um dispositivo para a lixeira
 */
export const trashDevice = async (deviceId: string): Promise<boolean> => {
  try {
    // Status online/offline
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      try {
        // 1. Obter dados do dispositivo para preservar
        const device = await DeviceAPI.getById(deviceId);
        
        // 2. Mover para lixeira no servidor (soft delete)
        await DeviceAPI.moveToTrash(deviceId);
        
        // 3. Atualizar lixeira local para fallback offline
        addToLocalTrash('device', device);
        
        // 4. Mostrar mensagem de sucesso
        toast.success('Dispositivo movido para a lixeira');
        return true;
      } catch (apiError) {
        console.error('Erro ao mover dispositivo para lixeira via API:', apiError);
        
        // Fallback para modo offline
        return trashDeviceOffline(deviceId);
      }
    } else {
      // Modo offline
      return trashDeviceOffline(deviceId);
    }
  } catch (error) {
    console.error('Erro ao mover dispositivo para lixeira:', error);
    toast.error('Erro ao mover dispositivo para lixeira');
    return false;
  }
};

/**
 * Fallback offline para mover um dispositivo para lixeira
 */
const trashDeviceOffline = async (deviceId: string): Promise<boolean> => {
  try {
    // Implementação similar ao trashCustomerOffline
    const savedDevices = localStorage.getItem('pauloCell_devices');
    if (!savedDevices) {
      toast.error('Nenhum dado de dispositivo encontrado');
      return false;
    }
    
    const devices = JSON.parse(savedDevices);
    const device = devices.find((d: any) => d.id === deviceId);
    
    if (!device) {
      toast.error('Dispositivo não encontrado');
      return false;
    }
    
    // Remover o dispositivo da lista
    const updatedDevices = devices.filter((d: any) => d.id !== deviceId);
    localStorage.setItem('pauloCell_devices', JSON.stringify(updatedDevices));
    
    // Adicionar à lixeira
    addToLocalTrash('device', device);
    
    // Sucesso
    toast.success('Dispositivo movido para a lixeira (modo offline)');
    return true;
  } catch (error) {
    console.error('Erro ao mover dispositivo para lixeira (offline):', error);
    toast.error('Erro ao mover dispositivo para lixeira');
    return false;
  }
};

/**
 * Move um serviço para a lixeira
 */
export const trashService = async (serviceId: string): Promise<boolean> => {
  try {
    // Status online/offline
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      try {
        // 1. Obter dados do serviço para preservar
        const service = await ServiceAPI.getById(serviceId);
        
        // 2. Mover para lixeira no servidor (soft delete)
        await ServiceAPI.moveToTrash(serviceId);
        
        // 3. Atualizar lixeira local para fallback offline
        addToLocalTrash('service', service);
        
        // 4. Mostrar mensagem de sucesso
        toast.success('Serviço movido para a lixeira');
        return true;
      } catch (apiError) {
        console.error('Erro ao mover serviço para lixeira via API:', apiError);
        
        // Fallback para modo offline
        return trashServiceOffline(serviceId);
      }
    } else {
      // Modo offline
      return trashServiceOffline(serviceId);
    }
  } catch (error) {
    console.error('Erro ao mover serviço para lixeira:', error);
    toast.error('Erro ao mover serviço para lixeira');
    return false;
  }
};

/**
 * Fallback offline para mover um serviço para lixeira
 */
const trashServiceOffline = async (serviceId: string): Promise<boolean> => {
  try {
    // Implementação similar ao trashCustomerOffline
    const savedServices = localStorage.getItem('pauloCell_services');
    if (!savedServices) {
      toast.error('Nenhum dado de serviço encontrado');
      return false;
    }
    
    const services = JSON.parse(savedServices);
    const service = services.find((s: any) => s.id === serviceId);
    
    if (!service) {
      toast.error('Serviço não encontrado');
      return false;
    }
    
    // Remover o serviço da lista
    const updatedServices = services.filter((s: any) => s.id !== serviceId);
    localStorage.setItem('pauloCell_services', JSON.stringify(updatedServices));
    
    // Adicionar à lixeira
    addToLocalTrash('service', service);
    
    // Sucesso
    toast.success('Serviço movido para a lixeira (modo offline)');
    return true;
  } catch (error) {
    console.error('Erro ao mover serviço para lixeira (offline):', error);
    toast.error('Erro ao mover serviço para lixeira');
    return false;
  }
};

/**
 * Move um documento para a lixeira
 */
export const trashDocument = async (documentId: string): Promise<boolean> => {
  try {
    // Status online/offline
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      try {
        // 1. Obter dados do documento para preservar
        const document = await DocumentAPI.getById(documentId);
        
        // 2. Mover para lixeira no servidor (soft delete)
        await DocumentAPI.moveToTrash(documentId);
        
        // 3. Atualizar lixeira local para fallback offline
        addToLocalTrash('document', document);
        
        // 4. Mostrar mensagem de sucesso
        toast.success('Documento movido para a lixeira');
        return true;
      } catch (apiError) {
        console.error('Erro ao mover documento para lixeira via API:', apiError);
        
        // Fallback para modo offline
        return trashDocumentOffline(documentId);
      }
    } else {
      // Modo offline
      return trashDocumentOffline(documentId);
    }
  } catch (error) {
    console.error('Erro ao mover documento para lixeira:', error);
    toast.error('Erro ao mover documento para lixeira');
    return false;
  }
};

/**
 * Fallback offline para mover um documento para lixeira
 */
const trashDocumentOffline = async (documentId: string): Promise<boolean> => {
  try {
    // Implementação similar ao trashCustomerOffline
    const savedDocuments = localStorage.getItem('pauloCell_documents');
    if (!savedDocuments) {
      toast.error('Nenhum dado de documento encontrado');
      return false;
    }
    
    const documents = JSON.parse(savedDocuments);
    const document = documents.find((d: any) => d.id === documentId);
    
    if (!document) {
      toast.error('Documento não encontrado');
      return false;
    }
    
    // Remover o documento da lista
    const updatedDocuments = documents.filter((d: any) => d.id !== documentId);
    localStorage.setItem('pauloCell_documents', JSON.stringify(updatedDocuments));
    
    // Adicionar à lixeira
    addToLocalTrash('document', document);
    
    // Sucesso
    toast.success('Documento movido para a lixeira (modo offline)');
    return true;
  } catch (error) {
    console.error('Erro ao mover documento para lixeira (offline):', error);
    toast.error('Erro ao mover documento para lixeira');
    return false;
  }
};

/**
 * Obter todos os itens da lixeira
 */
export const getAllTrashItems = async (): Promise<TrashItem[]> => {
  try {
    // Status online/offline
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      try {
        // Tentar obter da API primeiro
        const trashItems = await SyncAPI.getTrashItems();
        
        // Atualizar localStorage para uso offline
        localStorage.setItem(DELETED_CUSTOMERS_KEY, JSON.stringify(
          trashItems.filter(item => item.type === 'customer')
        ));
        localStorage.setItem(DELETED_DEVICES_KEY, JSON.stringify(
          trashItems.filter(item => item.type === 'device')
        ));
        localStorage.setItem(DELETED_SERVICES_KEY, JSON.stringify(
          trashItems.filter(item => item.type === 'service')
        ));
        localStorage.setItem(DELETED_DOCUMENTS_KEY, JSON.stringify(
          trashItems.filter(item => item.type === 'document')
        ));
        
        return trashItems;
      } catch (apiError) {
        console.error('Erro ao obter itens da lixeira via API:', apiError);
        
        // Fallback para lixeira local
        return getAllLocalTrashItems();
      }
    } else {
      // Modo offline - usar lixeira local
      return getAllLocalTrashItems();
    }
  } catch (error) {
    console.error('Erro ao obter itens da lixeira:', error);
    return [];
  }
};

/**
 * Obter todos os itens da lixeira local
 */
const getAllLocalTrashItems = (): TrashItem[] => {
  try {
    // Carregar todos os itens da lixeira local
    const customerItems = JSON.parse(localStorage.getItem(DELETED_CUSTOMERS_KEY) || '[]');
    const deviceItems = JSON.parse(localStorage.getItem(DELETED_DEVICES_KEY) || '[]');
    const serviceItems = JSON.parse(localStorage.getItem(DELETED_SERVICES_KEY) || '[]');
    const documentItems = JSON.parse(localStorage.getItem(DELETED_DOCUMENTS_KEY) || '[]');
    
    // Combinar e ordenar por data de exclusão (mais recentes primeiro)
    return [...customerItems, ...deviceItems, ...serviceItems, ...documentItems]
      .sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
  } catch (error) {
    console.error('Erro ao obter itens da lixeira local:', error);
    return [];
  }
};

/**
 * Restaurar um item da lixeira
 */
export const restoreFromTrash = async (item: TrashItem): Promise<boolean> => {
  try {
    // Status online/offline
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      try {
        // Restaurar via API
        switch (item.type) {
          case 'customer':
            await CustomerAPI.restore(item.id);
            break;
          case 'device':
            await DeviceAPI.restore(item.id);
            break;
          case 'service':
            await ServiceAPI.restore(item.id);
            break;
          case 'document':
            await DocumentAPI.restore(item.id);
            break;
          default:
            throw new Error('Tipo de item inválido para restauração');
        }
        
        // Remover da lixeira local também
        removeFromLocalTrash(item);
        
        toast.success('Item restaurado com sucesso');
        return true;
      } catch (apiError) {
        console.error('Erro ao restaurar item via API:', apiError);
        
        // Fallback para restauração local
        return restoreFromLocalTrash(item);
      }
    } else {
      // Modo offline
      return restoreFromLocalTrash(item);
    }
  } catch (error) {
    console.error('Erro ao restaurar item da lixeira:', error);
    toast.error('Erro ao restaurar item');
    return false;
  }
};

/**
 * Restaurar um item da lixeira local
 */
const restoreFromLocalTrash = (item: TrashItem): boolean => {
  try {
    // Implementação para restaurar item localmente
    switch (item.type) {
      case 'customer': {
        const savedCustomers = localStorage.getItem('pauloCell_customers');
        const customers = savedCustomers ? JSON.parse(savedCustomers) : [];
        customers.push(item.data);
        localStorage.setItem('pauloCell_customers', JSON.stringify(customers));
        break;
      }
      case 'device': {
        const savedDevices = localStorage.getItem('pauloCell_devices');
        const devices = savedDevices ? JSON.parse(savedDevices) : [];
        devices.push(item.data);
        localStorage.setItem('pauloCell_devices', JSON.stringify(devices));
        break;
      }
      case 'service': {
        const savedServices = localStorage.getItem('pauloCell_services');
        const services = savedServices ? JSON.parse(savedServices) : [];
        services.push(item.data);
        localStorage.setItem('pauloCell_services', JSON.stringify(services));
        break;
      }
      case 'document': {
        const savedDocuments = localStorage.getItem('pauloCell_documents');
        const documents = savedDocuments ? JSON.parse(savedDocuments) : [];
        documents.push(item.data);
        localStorage.setItem('pauloCell_documents', JSON.stringify(documents));
        break;
      }
      default:
        throw new Error('Tipo de item inválido para restauração');
    }
    
    // Remover da lixeira local
    removeFromLocalTrash(item);
    
    toast.success('Item restaurado com sucesso (modo offline)');
    return true;
  } catch (error) {
    console.error('Erro ao restaurar item da lixeira local:', error);
    toast.error('Erro ao restaurar item');
    return false;
  }
};

/**
 * Remover um item da lixeira local
 */
const removeFromLocalTrash = (item: TrashItem): void => {
  try {
    let trashKey = '';
    switch (item.type) {
      case 'customer':
        trashKey = DELETED_CUSTOMERS_KEY;
        break;
      case 'device':
        trashKey = DELETED_DEVICES_KEY;
        break;
      case 'service':
        trashKey = DELETED_SERVICES_KEY;
        break;
      case 'document':
        trashKey = DELETED_DOCUMENTS_KEY;
        break;
      default:
        throw new Error('Tipo de item inválido para a lixeira');
    }
    
    // Carregar itens já na lixeira
    const savedItems = localStorage.getItem(trashKey);
    if (!savedItems) return;
    
    const trashItems = JSON.parse(savedItems);
    
    // Remover o item
    const updatedItems = trashItems.filter((i: TrashItem) => i.id !== item.id);
    
    // Salvar de volta
    localStorage.setItem(trashKey, JSON.stringify(updatedItems));
  } catch (error) {
    console.error('Erro ao remover item da lixeira local:', error);
  }
};

/**
 * Excluir permanentemente um item da lixeira
 */
export const deletePermanently = async (item: TrashItem): Promise<boolean> => {
  try {
    // Status online/offline
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      try {
        // Excluir permanentemente via API
        switch (item.type) {
          case 'customer':
            await CustomerAPI.deletePermanently(item.id);
            break;
          case 'device':
            await DeviceAPI.deletePermanently(item.id);
            break;
          case 'service':
            await ServiceAPI.deletePermanently(item.id);
            break;
          case 'document':
            await DocumentAPI.deletePermanently(item.id);
            break;
          default:
            throw new Error('Tipo de item inválido para exclusão permanente');
        }
        
        // Remover da lixeira local também
        removeFromLocalTrash(item);
        
        toast.success('Item excluído permanentemente');
        return true;
      } catch (apiError) {
        console.error('Erro ao excluir permanentemente via API:', apiError);
        
        // Em caso de erro na API, apenas remover da lixeira local
        // mas avisar que a sincronização ocorrerá depois
        removeFromLocalTrash(item);
        toast.warning('Item excluído localmente, será sincronizado depois');
        return true;
      }
    } else {
      // Em modo offline, apenas remover da lixeira local
      // e avisar que a sincronização ocorrerá quando online
      removeFromLocalTrash(item);
      toast.warning('Item excluído localmente, será sincronizado quando online');
      return true;
    }
  } catch (error) {
    console.error('Erro ao excluir permanentemente:', error);
    toast.error('Erro ao excluir item permanentemente');
    return false;
  }
};

/**
 * Função para inicializar a limpeza da lixeira
 */
export const initTrashCleanup = async () => {
  try {
    // Tentar executar a limpeza usando a API
    if (navigator.onLine) {
      try {
        console.log('Iniciando limpeza automática da lixeira via API...');
        await SyncAPI.cleanupExpiredTrash();
        console.log('Limpeza da lixeira concluída com sucesso');
      } catch (apiError) {
        console.error('Erro ao limpar lixeira via API:', apiError);
      }
    }
    
    // Limpeza periódica (a cada 24 horas)
    const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
    setInterval(async () => {
      if (navigator.onLine) {
        try {
          console.log('Executando limpeza periódica da lixeira...');
          await SyncAPI.cleanupExpiredTrash();
          console.log('Limpeza periódica da lixeira concluída');
        } catch (error) {
          console.error('Erro na limpeza periódica da lixeira:', error);
        }
      }
    }, CLEANUP_INTERVAL);
    
    return true;
  } catch (error) {
    console.error('Erro ao inicializar limpeza da lixeira:', error);
    return false;
  }
};