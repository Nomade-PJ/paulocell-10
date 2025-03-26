import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Definição do schema de usuário
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    default: 'user',
    enum: ['user', 'admin', 'manager'] 
  }
}, {
  timestamps: true
});

// Definição do schema de palavra-chave
const keywordSchema = new mongoose.Schema({
  hash: { 
    type: String, 
    required: true,
    unique: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }
}, {
  timestamps: true
});

// Adicionando um método para criar hash de uma palavra-chave
keywordSchema.statics.createHash = async function(keyword) {
  return await bcrypt.hash(keyword, 10);
};

// Definição do schema de token
const tokenSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  tokenType: { 
    type: String, 
    required: true 
  },
  tokenValue: { 
    type: String, 
    required: true,
    unique: true 
  },
  expiresAt: { 
    type: Date, 
    required: true 
  },
  refreshToken: { 
    type: String,
    unique: true,
    sparse: true 
  },
  sessionId: { 
    type: String 
  }
}, {
  timestamps: true
});

// Definição do schema de serviço
const serviceSchema = new mongoose.Schema({
  description: { 
    type: String, 
    required: true 
  },
  clientName: { 
    type: String, 
    required: true 
  },
  clientPhone: { 
    type: String 
  },
  status: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'in_progress', 'completed', 'cancelled'] 
  },
  totalPrice: { 
    type: Number 
  },
  completedAt: { 
    type: Date 
  }
}, {
  timestamps: true
});

// Definição do schema de item de serviço
const serviceItemSchema = new mongoose.Schema({
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service',
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  quantity: { 
    type: Number, 
    default: 1 
  },
  price: { 
    type: Number, 
    required: true 
  }
}, {
  timestamps: true
});

// Definição do schema de item de inventário
const inventoryItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  quantity: { 
    type: Number, 
    default: 0 
  },
  minQuantity: { 
    type: Number, 
    default: 5 
  },
  price: { 
    type: Number 
  },
  category: { 
    type: String 
  }
}, {
  timestamps: true
});

// Criar os modelos apenas se mongoose estiver pronto para evitar erros em ambiente serverless
const getModels = () => {
  if (mongoose.connection.readyState) {
    return {
      User: mongoose.models.User || mongoose.model('User', userSchema),
      Keyword: mongoose.models.Keyword || mongoose.model('Keyword', keywordSchema),
      Token: mongoose.models.Token || mongoose.model('Token', tokenSchema),
      Service: mongoose.models.Service || mongoose.model('Service', serviceSchema),
      ServiceItem: mongoose.models.ServiceItem || mongoose.model('ServiceItem', serviceItemSchema),
      InventoryItem: mongoose.models.InventoryItem || mongoose.model('InventoryItem', inventoryItemSchema)
    };
  }
  return null;
};

export default getModels; 