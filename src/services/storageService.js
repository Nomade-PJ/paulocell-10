// Serviço para gerenciar armazenamento local com IndexedDB
// Mais robusto que localStorage para grandes volumes de dados

const DB_NAME = 'paulocell';
const DB_VERSION = 1;
const STORES = [
  'customers', 
  'devices', 
  'services', 
  'inventory', 
  'documents',
  'settings'
];

// Inicialização do banco de dados
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Erro ao abrir o banco de dados:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = (event) => {
      console.log('Banco de dados inicializado com sucesso');
      const db = event.target.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Criar object stores para cada entidade
      STORES.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
          console.log(`Store ${storeName} criada`);
        }
      });
    };
  });
};

// Obter conexão com o banco
const getDB = async () => {
  return await initDB();
};

// Adicionar ou atualizar um item
const saveItem = async (storeName, item) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Adicione um timestamp se não existir
    if (!item.updated_at) {
      item.updated_at = Date.now();
    }
    
    const request = store.put(item);
    
    request.onsuccess = () => {
      resolve(item);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

// Obter todos os itens
const getAllItems = async (storeName) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

// Obter um item pelo id
const getItemById = async (storeName, id) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

// Remover um item
const removeItem = async (storeName, id) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = () => {
      resolve({ success: true, id });
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

// Sincronizar com a API quando online
const syncWithAPI = async (storeName, apiEndpoint) => {
  try {
    // Obter itens locais
    const localItems = await getAllItems(storeName);
    
    // Se estiver online, tenta sincronizar
    if (navigator.onLine) {
      // Enviar para a API (simplificado para exemplo)
      const response = await fetch(`/api/${apiEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: localItems })
      });
      
      if (response.ok) {
        console.log(`Sincronização de ${storeName} concluída com sucesso`);
        return { success: true, count: localItems.length };
      }
    }
    
    return { success: false, message: 'Dispositivo offline ou erro de sincronização' };
  } catch (error) {
    console.error(`Erro na sincronização de ${storeName}:`, error);
    return { success: false, error: error.message };
  }
};

export {
  initDB,
  saveItem,
  getAllItems,
  getItemById,
  removeItem,
  syncWithAPI
}; 