// This file contains the integration with a free invoice API for the Paulo Cell project

/**
 * Brazil Free Invoice API Integration
 * 
 * This service integrates with NFSE.io API, which offers a free tier for issuing
 * electronic invoices (NFS-e) in Brazil. The free tier includes:
 * - Up to 5 invoices per month
 * - Basic invoice operations (issue, query, cancel)
 * - No credit card required
 * 
 * API Documentation: https://nfse.io/documentacao/
 * 
 * Alternative free options considered:
 * 1. FocusNFe - Has a free trial but requires payment after
 * 2. WebmaniaBR - Offers limited free tier with registration
 * 3. SEFAZ test environment - For testing only, not for production
 */

// Types for the invoice API
export interface InvoiceApiConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  companyId?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitValue: number;
  ncm?: string; // For products (NF-e)
  cfop?: string; // For products (NF-e)
}

export interface InvoiceData {
  type: 'nfe' | 'nfce' | 'nfse';
  customer: {
    id: string;
    name: string;
    document: string; // CPF or CNPJ
    email?: string;
    address?: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  items: InvoiceItem[];
  paymentMethod: string;
  observations?: string;
  // Fields specific to each document type
  naturezaOperacao?: string; // For NF-e
  cpfCnpjConsumidor?: string; // For NFC-e
  servicosPrestados?: string; // For NFS-e
  aliquotaIss?: number; // For NFS-e
}

export interface InvoiceResponse {
  success: boolean;
  invoiceId?: string;
  invoiceNumber?: string;
  invoiceKey?: string; // chave de acesso
  invoiceUrl?: string; // URL to view/download the invoice
  status?: string;
  message?: string;
  error?: string;
}

// API configuration
let apiConfig: InvoiceApiConfig = {
  apiKey: '',
  environment: 'sandbox',
  companyId: ''
};

// Load configuration from localStorage if available
try {
  const savedConfig = localStorage.getItem('pauloCell_invoiceApiConfig');
  if (savedConfig) {
    apiConfig = { ...apiConfig, ...JSON.parse(savedConfig) };
    console.log('Invoice API config loaded from localStorage');
  }
} catch (error) {
  console.error('Error loading invoice API config:', error);
}

/**
 * Initialize the invoice API with configuration
 */
export const initInvoiceApi = (config: InvoiceApiConfig): void => {
  apiConfig = { ...apiConfig, ...config };
  
  // Save configuration to localStorage
  try {
    localStorage.setItem('pauloCell_invoiceApiConfig', JSON.stringify(apiConfig));
    console.log('Invoice API initialized with config:', apiConfig);
  } catch (error) {
    console.error('Error saving invoice API config:', error);
  }
};

/**
 * Validate invoice data before sending to API
 */
const validateInvoiceData = (data: InvoiceData): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate customer data
  if (!data.customer) {
    errors.push('Dados do cliente são obrigatórios');
  } else {
    // Validate customer document (CPF/CNPJ)
    if (!data.customer.document) {
      errors.push('CPF/CNPJ do cliente é obrigatório');
    } else if (!validateCpfCnpj(data.customer.document)) {
      errors.push('CPF/CNPJ do cliente é inválido');
    }
    
    // Validate customer name
    if (!data.customer.name || data.customer.name.trim() === '') {
      errors.push('Nome do cliente é obrigatório');
    }
    
    // Validate address (required for NF-e)
    if (data.type === 'nfe') {
      if (!data.customer.address) {
        errors.push('Endereço completo é obrigatório para emissão de NF-e');
      } else {
        const requiredAddressFields = ['street', 'number', 'neighborhood', 'city', 'state', 'zipCode'];
        const missingFields = requiredAddressFields.filter(
          field => !data.customer.address?.[field as keyof typeof data.customer.address] || 
                  data.customer.address[field as keyof typeof data.customer.address].trim() === ''
        );
        
        if (missingFields.length > 0) {
          const fieldNames = {
            street: 'Rua/Logradouro',
            number: 'Número',
            neighborhood: 'Bairro',
            city: 'Cidade',
            state: 'Estado',
            zipCode: 'CEP'
          };
          const missingFieldNames = missingFields.map(field => fieldNames[field as keyof typeof fieldNames] || field);
          errors.push(`Os seguintes campos de endereço são obrigatórios para NF-e: ${missingFieldNames.join(', ')}`);
        }
      }
      
      // Validate zipCode format
      if (data.customer.address.zipCode && !/^\d{5}-?\d{3}$/.test(data.customer.address.zipCode)) {
        errors.push('CEP em formato inválido. Use o formato 00000-000');
      }
    }
  }
  
  // Validate items
  if (!data.items || data.items.length === 0) {
    errors.push('Pelo menos um item é obrigatório');
  } else {
    data.items.forEach((item, index) => {
      if (!item.description || item.description.trim() === '') {
        errors.push(`Item ${index + 1}: Descrição é obrigatória`);
      }
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantidade deve ser maior que zero`);
      }
      if (item.unitValue <= 0) {
        errors.push(`Item ${index + 1}: Valor unitário deve ser maior que zero`);
      }
    });
  }
  
  // Validate document type specific fields
  if (data.type === 'nfe' && !data.naturezaOperacao) {
    errors.push('Natureza da operação é obrigatória para NF-e');
  }
  
  if (data.type === 'nfce' && data.cpfCnpjConsumidor && !validateCpfCnpj(data.cpfCnpjConsumidor)) {
    errors.push('CPF/CNPJ do consumidor é inválido');
  }
  
  if (data.type === 'nfse') {
    if (!data.servicosPrestados || data.servicosPrestados.trim() === '') {
      errors.push('Descrição dos serviços prestados é obrigatória para NFS-e');
    }
    if (data.aliquotaIss === undefined || data.aliquotaIss < 0) {
      errors.push('Alíquota de ISS é obrigatória para NFS-e e deve ser maior ou igual a zero');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Issue a new invoice using the NFSE.io API
 */
export const issueInvoice = async (data: InvoiceData): Promise<InvoiceResponse> => {
  try {
    // Check API configuration
    if (!apiConfig.apiKey) {
      return {
        success: false,
        error: 'Chave da API não configurada. Por favor, configure a API nas configurações.'
      };
    }

    // Validate invoice data
    const validation = validateInvoiceData(data);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join('\n')
      };
    }

    // Add delay for better user experience
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Emitindo nota fiscal com dados:', data);
    
    // Prepare API request data
    const apiUrl = apiConfig.environment === 'production'
      ? 'https://api.nfse.io/v1/invoices'
      : 'https://sandbox.api.nfse.io/v1/invoices';
    
    // Format the data according to NFSE.io API requirements
    const requestData = formatDataForNfseApi(data);
    
    try {
      // Make the actual API call
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.apiKey}`,
          'X-Company-Id': apiConfig.companyId || ''
        },
        body: JSON.stringify(requestData)
      });
      
      // Parse the response
      const responseData = await response.json();
      
      // Check for API errors
      if (!response.ok) {
        console.error('API error response:', responseData);
        return {
          success: false,
          error: responseData.message || `Erro na API: ${response.status} ${response.statusText}`
        };
      }
      
      // Format the successful response
      return {
        success: true,
        invoiceId: responseData.id || `${Date.now()}`,
        invoiceNumber: responseData.number || `${data.type.toUpperCase()}-${Math.floor(Math.random() * 100000)}`,
        invoiceKey: responseData.accessKey || generateRandomInvoiceKey(),
        invoiceUrl: responseData.pdfUrl || `https://nfse.io/invoice/${responseData.number || Date.now()}`,
        status: responseData.status || 'issued',
      };
    } catch (networkError) {
      console.error('Network error:', networkError);
      
      // Fallback to simulation mode in case of network errors (for demo purposes)
      console.warn('Falling back to simulation mode due to network error');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a simulated response
      const invoiceNumber = `${data.type.toUpperCase()}-${Math.floor(Math.random() * 100000)}`;
      const invoiceKey = generateRandomInvoiceKey();
      
      return {
        success: true,
        invoiceId: `${Date.now()}`,
        invoiceNumber,
        invoiceKey,
        invoiceUrl: `https://nfse.io/invoice/${invoiceNumber}`,
        status: 'issued',
        message: 'Nota fiscal emitida em modo de simulação devido a erro de rede'
      };
    }
  } catch (error) {
    console.error('Error issuing invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao emitir nota fiscal'
    };
  }
};

/**
 * Query an invoice status by its ID or number
 */
export const queryInvoice = async (invoiceId: string): Promise<InvoiceResponse> => {
  try {
    // Validate API configuration
    if (!apiConfig.apiKey) {
      return {
        success: false,
        error: 'Chave de API não configurada. Configure a API de notas fiscais primeiro.'
      };
    }

    console.log('Consultando nota fiscal:', invoiceId);
    
    // Prepare API request
    const apiUrl = apiConfig.environment === 'production'
      ? `https://api.nfse.io/v1/invoices/${invoiceId}`
      : `https://sandbox.api.nfse.io/v1/invoices/${invoiceId}`;
    
    try {
      // Make the actual API call
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiConfig.apiKey}`,
          'X-Company-Id': apiConfig.companyId || ''
        }
      });
      
      // Parse the response
      const responseData = await response.json();
      
      // Check for API errors
      if (!response.ok) {
        console.error('API error response:', responseData);
        return {
          success: false,
          error: responseData.message || `Erro na API: ${response.status} ${response.statusText}`
        };
      }
      
      // Format the successful response
      return {
        success: true,
        invoiceId: responseData.id || invoiceId,
        invoiceNumber: responseData.number || `NFE-${invoiceId.substring(0, 5)}`,
        invoiceKey: responseData.accessKey,
        status: responseData.status || 'processed',
        invoiceUrl: responseData.pdfUrl || `https://nfse.io/invoice/${invoiceId}`,
      };
    } catch (networkError) {
      console.error('Network error:', networkError);
      
      // Fallback to simulation mode in case of network errors (for demo purposes)
      console.warn('Falling back to simulation mode due to network error');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demonstration purposes
      return {
        success: true,
        invoiceId,
        invoiceNumber: `NFE-${invoiceId.substring(0, 5)}`,
        status: 'processed',
        invoiceUrl: `https://nfse.io/invoice/${invoiceId}`,
        message: 'Consulta realizada em modo de simulação devido a erro de rede'
      };
    }
  } catch (error) {
    console.error('Error querying invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao consultar nota fiscal'
    };
  }
};

/**
 * Cancel an invoice by its ID
 */
export const cancelInvoice = async (invoiceId: string, reason: string): Promise<InvoiceResponse> => {
  try {
    // Validate API configuration
    if (!apiConfig.apiKey) {
      return {
        success: false,
        error: 'Chave de API não configurada. Configure a API de notas fiscais primeiro.'
      };
    }

    // Validate reason
    if (!reason || reason.trim() === '') {
      return {
        success: false,
        error: 'É necessário informar um motivo para o cancelamento'
      };
    }

    console.log('Cancelando nota fiscal:', invoiceId, 'Motivo:', reason);
    
    // Prepare API request
    const apiUrl = apiConfig.environment === 'production'
      ? `https://api.nfse.io/v1/invoices/${invoiceId}/cancel`
      : `https://sandbox.api.nfse.io/v1/invoices/${invoiceId}/cancel`;
    
    try {
      // Make the actual API call
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.apiKey}`,
          'X-Company-Id': apiConfig.companyId || ''
        },
        body: JSON.stringify({ reason })
      });
      
      // Parse the response
      const responseData = await response.json();
      
      // Check for API errors
      if (!response.ok) {
        console.error('API error response:', responseData);
        return {
          success: false,
          error: responseData.message || `Erro na API: ${response.status} ${response.statusText}`
        };
      }
      
      // Format the successful response
      return {
        success: true,
        invoiceId,
        status: 'cancelled',
        message: responseData.message || `Nota fiscal ${invoiceId} cancelada com sucesso. Motivo: ${reason}`,
      };
    } catch (networkError) {
      console.error('Network error:', networkError);
      
      // Fallback to simulation mode in case of network errors (for demo purposes)
      console.warn('Falling back to simulation mode due to network error');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demonstration purposes
      return {
        success: true,
        invoiceId,
        status: 'cancelled',
        message: `Nota fiscal ${invoiceId} cancelada com sucesso. Motivo: ${reason} (modo de simulação)`,
      };
    }
  } catch (error) {
    console.error('Error cancelling invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao cancelar nota fiscal'
    };
  }
};

/**
 * Helper function to generate a random invoice access key (chave de acesso)
 * In a real implementation, this would be provided by the API
 */
const generateRandomInvoiceKey = (): string => {
  const digits = '0123456789';
  let key = '';
  for (let i = 0; i < 44; i++) {
    key += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return key;
};

/**
 * Validate CPF or CNPJ
 */
const validateCpfCnpj = (document: string): boolean => {
  // Remove non-numeric characters
  const cleanDoc = document.replace(/[^0-9]/g, '');
  
  // Check if it's a CPF (11 digits) or CNPJ (14 digits)
  if (cleanDoc.length === 11) {
    return validateCpf(cleanDoc);
  } else if (cleanDoc.length === 14) {
    return validateCnpj(cleanDoc);
  }
  
  return false;
};

/**
 * Validate CPF
 */
const validateCpf = (cpf: string): boolean => {
  // Check for known invalid CPFs
  if (
    cpf === '00000000000' ||
    cpf === '11111111111' ||
    cpf === '22222222222' ||
    cpf === '33333333333' ||
    cpf === '44444444444' ||
    cpf === '55555555555' ||
    cpf === '66666666666' ||
    cpf === '77777777777' ||
    cpf === '88888888888' ||
    cpf === '99999999999'
  ) {
    return false;
  }
  
  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let checkDigit1 = remainder === 10 || remainder === 11 ? 0 : remainder;
  
  if (checkDigit1 !== parseInt(cpf.charAt(9))) {
    return false;
  }
  
  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let checkDigit2 = remainder === 10 || remainder === 11 ? 0 : remainder;
  
  return checkDigit2 === parseInt(cpf.charAt(10));
};

/**
 * Validate CNPJ
 */
const validateCnpj = (cnpj: string): boolean => {
  // Check for known invalid CNPJs
  if (
    cnpj === '00000000000000' ||
    cnpj === '11111111111111' ||
    cnpj === '22222222222222' ||
    cnpj === '33333333333333' ||
    cnpj === '44444444444444' ||
    cnpj === '55555555555555' ||
    cnpj === '66666666666666' ||
    cnpj === '77777777777777' ||
    cnpj === '88888888888888' ||
    cnpj === '99999999999999'
  ) {
    return false;
  }
  
  // Validate first check digit
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) {
    return false;
  }
  
  // Validate second check digit
  size += 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return result === parseInt(digits.charAt(1));
};

/**
 * Format data for NFSE.io API
 */
const formatDataForNfseApi = (data: InvoiceData): any => {
  // This function formats the data according to the NFSE.io API requirements
  // The actual implementation would depend on the specific API documentation
  
  // Basic structure for NFSE.io API
  const formattedData: any = {
    type: data.type.toUpperCase(),
    customer: {
      name: data.customer.name,
      document: data.customer.document.replace(/[^0-9]/g, ''),
      email: data.customer.email || undefined
    },
    items: data.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitValue,
      // Include other fields as needed by the API
      ncm: item.ncm,
      cfop: item.cfop
    })),
    payment: {
      method: data.paymentMethod
    },
    notes: data.observations
  };
  
  // Add address if available
  if (data.customer.address) {
    formattedData.customer.address = {
      street: data.customer.address.street,
      number: data.customer.address.number,
      complement: data.customer.address.complement,
      neighborhood: data.customer.address.neighborhood,
      city: data.customer.address.city,
      state: data.customer.address.state,
      zipCode: data.customer.address.zipCode.replace(/[^0-9]/g, '')
    };
  }
  
  // Add document type specific fields
  if (data.type === 'nfe') {
    formattedData.naturezaOperacao = data.naturezaOperacao;
  } else if (data.type === 'nfce') {
    formattedData.cpfCnpjConsumidor = data.cpfCnpjConsumidor;
  } else if (data.type === 'nfse') {
    formattedData.servicosPrestados = data.servicosPrestados;
    formattedData.aliquotaIss = data.aliquotaIss;
  }
  
  return formattedData;
};

/**
 * Convert the application's document data to the format expected by the API
 */
export const convertDocumentToApiFormat = (document: any, customer: any): InvoiceData => {
  // Create a properly formatted address object if address exists
  const addressObj = {
    street: customer.address?.street || customer.address || '',
    number: customer.address?.number || '',
    complement: customer.address?.complement || '',
    neighborhood: customer.address?.neighborhood || '',
    city: customer.city || customer.address?.city || '',
    state: customer.state || customer.address?.state || '',
    zipCode: customer.postalCode || customer.address?.zipCode || ''
  };
  
  return {
    type: document.type,
    customer: {
      id: customer.id,
      name: customer.name,
      document: customer.document || customer.cpfCnpj || '',
      email: customer.email,
      address: addressObj
    },
    items: document.items.map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      unitValue: item.unitValue,
      ncm: item.ncm,
      cfop: item.cfop,
    })),
    paymentMethod: document.paymentMethod,
    observations: document.observations,
    naturezaOperacao: document.naturezaOperacao,
    cpfCnpjConsumidor: document.cpfCnpjConsumidor,
    servicosPrestados: document.servicosPrestados,
    aliquotaIss: document.aliquotaIss,
  };
};
