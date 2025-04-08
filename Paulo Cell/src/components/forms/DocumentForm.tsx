import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import { TrashIcon, AlertCircleIcon, CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

// Função para validar CPF
const validateCpf = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCpf.length !== 11) return false;
  
  // Verifica CPFs inválidos conhecidos
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
  
  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let firstDigit = remainder === 10 || remainder === 11 ? 0 : remainder;
  
  if (firstDigit !== parseInt(cleanCpf.charAt(9))) return false;
  
  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let secondDigit = remainder === 10 || remainder === 11 ? 0 : remainder;
  
  return secondDigit === parseInt(cleanCpf.charAt(10));
};

// Função para validar CNPJ
const validateCnpj = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCnpj = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCnpj.length !== 14) return false;
  
  // Verifica CNPJs inválidos conhecidos
  if (/^(\d)\1{13}$/.test(cleanCnpj)) return false;
  
  // Calcula o primeiro dígito verificador
  let size = cleanCnpj.length - 2;
  let numbers = cleanCnpj.substring(0, size);
  const digits = cleanCnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  // Calcula o segundo dígito verificador
  size += 1;
  numbers = cleanCnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return result === parseInt(digits.charAt(1));
};

// Função principal para validar CPF ou CNPJ
const validateCpfCnpj = (value: string): boolean => {
  if (!value) return true; // Campo opcional
  
  // Remove caracteres não numéricos
  const cleanValue = value.replace(/[^\d]/g, '');
  
  // Verifica o tamanho para determinar se é CPF ou CNPJ
  if (cleanValue.length === 11) {
    return validateCpf(cleanValue);
  } else if (cleanValue.length === 14) {
    return validateCnpj(cleanValue);
  }
  
  return false;
};

// Função para formatar CPF (XXX.XXX.XXX-XX)
const formatCpf = (value: string): string => {
  const cleanValue = value.replace(/[^\d]/g, '');
  if (cleanValue.length <= 3) return cleanValue;
  if (cleanValue.length <= 6) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`;
  if (cleanValue.length <= 9) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6)}`;
  return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6, 9)}-${cleanValue.slice(9, 11)}`;
};

// Função para formatar CNPJ (XX.XXX.XXX/XXXX-XX)
const formatCnpj = (value: string): string => {
  const cleanValue = value.replace(/[^\d]/g, '');
  if (cleanValue.length <= 2) return cleanValue;
  if (cleanValue.length <= 5) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2)}`;
  if (cleanValue.length <= 8) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5)}`;
  if (cleanValue.length <= 12) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8)}`;
  return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8, 12)}-${cleanValue.slice(12, 14)}`;
};

// Função para formatar CPF ou CNPJ automaticamente
const formatCpfCnpj = (value: string): string => {
  const cleanValue = value.replace(/[^\d]/g, '');
  
  // Se tiver mais de 11 dígitos, trata como CNPJ
  if (cleanValue.length > 11) {
    return formatCnpj(cleanValue);
  }
  
  // Senão, trata como CPF
  return formatCpf(cleanValue);
};

const documentFormSchema = z.object({
  type: z.enum(['nfe', 'nfce', 'nfse']),
  customer: z.string().min(1, 'Cliente é obrigatório'),
  // Para NFC e NFS, vamos adicionar um campo para o cliente manual
  manualCustomerName: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'Descrição é obrigatória'),
    quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
    unitValue: z.number().min(0.01, 'Valor unitário deve ser maior que 0'),
    ncm: z.string().optional(),
    cfop: z.string().optional(),
  })).min(1, 'Adicione pelo menos um item'),
  paymentMethod: z.string().min(1, 'Método de pagamento é obrigatório'),
  observations: z.string().optional(),
  // Campos específicos para NF-e
  naturezaOperacao: z.string().optional(),
  // Campos específicos para NFC-e
  cpfCnpjConsumidor: z.string()
    .optional()
    .refine(val => !val || validateCpfCnpj(val), {
      message: "CPF ou CNPJ inválido"
    }),
  // Campos específicos para NFS-e
  servicosPrestados: z.string().optional(),
  aliquotaIss: z.number().optional(),
});

type DocumentFormData = z.infer<typeof documentFormSchema>;

interface DocumentFormProps {
  type: 'nfe' | 'nfce' | 'nfse';
  onSubmit: (data: DocumentFormData) => void;
  onCancel: () => void;
  customerId?: string;
  requiresApiConfig?: boolean;
  customer?: any;
}

// Interface para os campos de endereço requeridos
interface AddressField {
  field: string;
  label: string;
}

const DocumentForm: React.FC<DocumentFormProps> = ({ 
  type, 
  onSubmit, 
  onCancel, 
  customerId,
  requiresApiConfig = false,
  customer: customerProp
}) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showValidationWarning, setShowValidationWarning] = useState(false);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [useManualCustomer, setUseManualCustomer] = useState(type === 'nfce' || type === 'nfse');

  // Carregar clientes do localStorage
  useEffect(() => {
    try {
      const savedCustomers = localStorage.getItem('pauloCell_customers');
      if (savedCustomers) {
        const parsedCustomers = JSON.parse(savedCustomers);
        setCustomers(parsedCustomers);
        
        // Priorizar o cliente recebido via props, se disponível
        if (customerProp) {
          console.log('Cliente recebido via props:', customerProp);
          setSelectedCustomer(customerProp);
          validateCustomerForDocumentType(customerProp, type);
          return;
        }
        
        // Se temos um customerId, encontre o cliente e verifique seus dados
        if (customerId) {
          const customer = parsedCustomers.find((c: any) => c.id === customerId);
          if (customer) {
            console.log('Cliente encontrado pelo ID:', customer);
            setSelectedCustomer(customer);
            validateCustomerForDocumentType(customer, type);
          } else {
            console.warn('Cliente não encontrado com o ID:', customerId);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar informações do cliente');
    }
  }, [customerId, type, customerProp]);

  // Efeito para revalidar cliente quando o tipo de documento mudar
  useEffect(() => {
    if (selectedCustomer) {
      validateCustomerForDocumentType(selectedCustomer, type);
    }
  }, [type, selectedCustomer]);

  // Validar cliente para o tipo de documento
  const validateCustomerForDocumentType = (customer: any, documentType: 'nfe' | 'nfce' | 'nfse') => {
    try {
      // Verificar se o cliente existe
      if (!customer) {
        setValidationMessages(['Cliente não selecionado ou inválido']);
        setShowValidationWarning(true);
        return;
      }
      
      const messages = [];
      
      // Verificar CPF/CNPJ com verificação segura
      const hasCpfCnpj = !!(customer.document || customer.cpfCnpj);
      if (!hasCpfCnpj) {
        messages.push('CPF/CNPJ do cliente é obrigatório para emissão de documento fiscal');
      }
      
      // Validações específicas para NF-e
      if (documentType === 'nfe') {
        // Verificar se o objeto address existe
        const hasAddress = !!customer.address;
        
        if (!hasAddress) {
          messages.push('Endereço completo é obrigatório para emissão de NF-e');
        } else {
          const requiredAddressFields: AddressField[] = [
            { field: 'street', label: 'Rua/Logradouro' },
            { field: 'number', label: 'Número' },
            { field: 'neighborhood', label: 'Bairro' }
          ];
          
          // Verificação mais segura de campos de endereço
          let missingFields: string[] = [];
          
          // Verificar campos dentro do objeto address
          if (customer.address) {
            missingFields = requiredAddressFields
              .filter(item => {
                const value = customer.address[item.field];
                return !value || (typeof value === 'string' && value.trim() === '');
              })
              .map(item => item.label);
          }
            
          // Verificar campos diretamente no objeto do cliente
          if (!customer.city || (typeof customer.city === 'string' && customer.city.trim() === '')) {
            missingFields.push('Cidade');
          }
          
          if (!customer.state || (typeof customer.state === 'string' && customer.state.trim() === '')) {
            missingFields.push('Estado');
          }
          
          if (!customer.postalCode || (typeof customer.postalCode === 'string' && customer.postalCode.trim() === '')) {
            missingFields.push('CEP');
          }
          
          if (missingFields.length > 0) {
            messages.push(`Os seguintes campos de endereço são obrigatórios para NF-e: ${missingFields.join(', ')}`);
          }
        }
      }
      
      // Atualizar mensagens de validação no estado
      if (messages.length > 0) {
        setValidationMessages(messages);
        setShowValidationWarning(true);
      } else {
        setValidationMessages([]);
        setShowValidationWarning(false);
      }
    } catch (error) {
      console.error('Erro na validação do cliente:', error);
      // Em caso de erro, não bloqueia o fluxo, apenas mostra uma mensagem genérica
      toast.error('Ocorreu um erro na validação do cliente corrija');
      setValidationMessages([]);
      setShowValidationWarning(false);
    }
  };

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      type,
      customer: customerId || '',
      manualCustomerName: '',
      items: [{ description: '', quantity: 1, unitValue: 0 }],
      observations: '',
      paymentMethod: '',
      naturezaOperacao: type === 'nfe' ? 'Venda de Mercadoria' : undefined,
      cpfCnpjConsumidor: type === 'nfce' ? '' : undefined,
      servicosPrestados: type === 'nfse' ? '' : undefined,
      aliquotaIss: type === 'nfse' ? 5 : undefined,
    },
  });

  // Atualizar o cliente selecionado quando o usuário mudar o select
  const handleCustomerChange = (customerId: string) => {
    try {
      // Quando o valor do select muda, atualize o formulário
      form.setValue('customer', customerId);
      
      // Encontre o cliente pelo ID
      const customer = customers.find(c => c.id === customerId);
      setSelectedCustomer(customer || null);
      
      // Se encontrou o cliente, valide os dados
      if (customer) {
        console.log("Cliente selecionado:", customer);
        validateCustomerForDocumentType(customer, type);
      } else {
        console.log("Cliente não encontrado para o ID:", customerId);
        setValidationMessages([]);
        setShowValidationWarning(false);
      }
    } catch (error) {
      console.error("Erro ao mudar o cliente:", error);
      // Em caso de erro, não bloqueia o fluxo, apenas mostra uma mensagem
      toast.error('Ocorreu um erro ao selecionar o cliente');
      setValidationMessages([]);
      setShowValidationWarning(false);
    }
  };

  const handleSubmit = async (data: DocumentFormData) => {
    setIsLoading(true);
    try {
      // Verificar se é para usar cliente digitado manualmente
      let customerName = '';
      let customerData = null;

      if (type === 'nfce' || type === 'nfse') {
        // Para NFC-e e NFS-e, usar o nome do cliente digitado manualmente
        customerName = data.manualCustomerName || 'Cliente não identificado';
      } else {
        // Para NF-e, usar o cliente selecionado
        const customer = customers.find(c => c.id === data.customer);
        if (!customer && type === 'nfe') {
          throw new Error('Cliente não encontrado. Selecione um cliente válido.');
        }
        customerName = customer?.name || 'Cliente não identificado';
        customerData = customer;
      }

      // Resto do código para criar o documento
      const items = data.items.map(item => ({
        ...item,
        total: item.quantity * item.unitValue
      }));

      const totalValue = items.reduce((acc, item) => acc + item.total, 0);

      const newDocument = {
        id: uuidv4(),
        type: data.type,
        number: `${type.toUpperCase()}-${Math.floor(Math.random() * 100000)}`,
        customer: customerName,
        customerId: (type === 'nfce' || type === 'nfse') ? undefined : data.customer,
        date: new Date().toISOString(),
        value: totalValue,
        status: 'Emitida' as const,
        items,
        paymentMethod: data.paymentMethod,
        observations: data.observations,
        naturezaOperacao: data.type === 'nfe' ? data.naturezaOperacao : undefined,
        cpfCnpjConsumidor: data.type === 'nfce' ? data.cpfCnpjConsumidor : undefined,
        servicosPrestados: data.type === 'nfse' ? data.servicosPrestados : undefined,
        aliquotaIss: data.type === 'nfse' ? data.aliquotaIss : undefined,
      };

      // Import the invoice API service
      const { issueInvoice, convertDocumentToApiFormat } = await import('../../lib/invoice-api');
      
      // Convert document to API format and issue invoice
      const apiData = convertDocumentToApiFormat(newDocument, customerData);
      
      // Show processing message
      toast.info('Processando emissão do documento fiscal...');
      
      const invoiceResponse = await issueInvoice(apiData);
      
      if (!invoiceResponse.success) {
        throw new Error(invoiceResponse.error || 'Erro ao emitir documento fiscal');
      }
      
      // Add API response data to the document
      const documentWithApiData = {
        ...newDocument,
        invoiceId: invoiceResponse.invoiceId,
        invoiceNumber: invoiceResponse.invoiceNumber,
        invoiceKey: invoiceResponse.invoiceKey,
        invoiceUrl: invoiceResponse.invoiceUrl,
      };

      // Salvar no localStorage
      const savedDocs = localStorage.getItem('pauloCell_documents') || '[]';
      const documents = JSON.parse(savedDocs);
      documents.push(documentWithApiData);
      localStorage.setItem('pauloCell_documents', JSON.stringify(documents));

      toast.success('Documento fiscal emitido com sucesso!');
      if (invoiceResponse.message) {
        toast.info(invoiceResponse.message);
      }
      onSubmit(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao emitir documento fiscal';
      toast.error(errorMessage);
      console.error('Error issuing invoice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = (index: number) => {
    const items = form.watch('items');
    if (items.length > 1) {
      form.setValue('items', items.filter((_, i) => i !== index));
    }
  };

  // Função para gerar um número de documento aleatório
  const generateDocumentNumber = () => {
    const prefix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${prefix}-${number}`;
  };

  // Função para converter o documento para o formato da API
  const convertDocumentToApiFormat = (document: any, customerData: any | null): any => {
    // Base da estrutura de dados
    const apiData: any = {
      type: document.type,
      items: document.items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitValue,
        ncm: item.ncm || undefined,
        cfop: item.cfop || undefined
      })),
      paymentMethod: document.paymentMethod,
      observations: document.observations
    };

    // Adicionar dados do cliente
    if (customerData) {
      // Cliente selecionado da lista (para NF-e principalmente)
      apiData.customer = {
        name: customerData.name,
        document: customerData.document || customerData.cpfCnpj || undefined,
        email: customerData.email || undefined
      };

      // Adicionar endereço se disponível
      if (customerData.address) {
        apiData.customer.address = {
          street: customerData.address.street || undefined,
          number: customerData.address.number || undefined,
          complement: customerData.address.complement || undefined,
          neighborhood: customerData.address.neighborhood || undefined,
          city: customerData.address.city || undefined,
          state: customerData.address.state || undefined,
          zipCode: customerData.address.zipCode ? customerData.address.zipCode.replace(/[^\d]/g, '') : undefined
        };
      }
    } else {
      // Cliente manual para NFC-e e NFS-e
      apiData.customer = {
        name: document.customer
      };

      // Para NFC-e, adicionar CPF/CNPJ do consumidor se disponível
      if (document.type === 'nfce' && document.cpfCnpjConsumidor) {
        apiData.customer.document = document.cpfCnpjConsumidor.replace(/[^\d]/g, '');
      }
    }

    // Adicionar campos específicos para cada tipo de documento
    if (document.type === 'nfe' && document.naturezaOperacao) {
      apiData.naturezaOperacao = document.naturezaOperacao;
    } else if (document.type === 'nfce' && document.cpfCnpjConsumidor) {
      apiData.cpfCnpjConsumidor = document.cpfCnpjConsumidor.replace(/[^\d]/g, '');
    } else if (document.type === 'nfse') {
      if (document.servicosPrestados) {
        apiData.servicosPrestados = document.servicosPrestados;
      }
      if (document.aliquotaIss !== undefined) {
        apiData.aliquotaIss = document.aliquotaIss;
      }
    }

    return apiData;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6">
              {showValidationWarning && (
                <Alert variant="destructive" className="mb-2">
                  <AlertCircleIcon className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc pl-5">
                      {validationMessages.map((message, index) => (
                        <li key={index}>{message}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {requiresApiConfig && (type === 'nfce' || type === 'nfse') && (
                <Alert variant="destructive" className="mb-2">
                  <AlertCircleIcon className="h-4 w-4" />
                  <AlertDescription>
                    A API de notas fiscais não está configurada. Configure a API nas configurações antes de emitir este tipo de documento.
                  </AlertDescription>
                </Alert>
              )}

              {/* Campo de Cliente - Selecionar da lista para NF-e ou digitar manualmente para NFC-e e NFS-e */}
              {type === 'nfe' ? (
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          try {
                            field.onChange(value);
                            handleCustomerChange(value);
                          } catch (error) {
                            console.error("Erro ao selecionar cliente:", error);
                            toast.error("Erro ao selecionar cliente. Tente novamente.");
                          }
                        }} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers && customers.length > 0 ? (
                            customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-customers" disabled>
                              Nenhum cliente cadastrado
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="manualCustomerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Cliente</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Digite o nome do cliente" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Digite o nome do cliente manualmente para este documento.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {type === 'nfe' && (
                <FormField
                  control={form.control}
                  name="naturezaOperacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Natureza da Operação</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {type === 'nfce' && (
                <FormField
                  control={form.control}
                  name="cpfCnpjConsumidor"
                  render={({ field }) => {
                    const [isValid, setIsValid] = useState<boolean | null>(null);
                    
                    const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                      const inputValue = e.target.value;
                      const formattedValue = formatCpfCnpj(inputValue);
                      
                      // Atualiza o valor no formulário com a formatação
                      field.onChange(formattedValue);
                      
                      // Verifica a validade se tiver um valor
                      if (formattedValue) {
                        const cleanValue = formattedValue.replace(/[^\d]/g, '');
                        if (cleanValue.length === 11 || cleanValue.length === 14) {
                          setIsValid(validateCpfCnpj(formattedValue));
                        } else {
                          setIsValid(null); // Ainda não tem comprimento suficiente para validar
                        }
                      } else {
                        setIsValid(null); // Campo vazio
                      }
                    };
                    
                    return (
                      <FormItem>
                        <FormLabel>CPF/CNPJ do Consumidor</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              {...field} 
                              onChange={handleCpfCnpjChange}
                              placeholder="Digite CPF ou CNPJ"
                              className={isValid === true ? "pr-10 border-green-500" : 
                                        isValid === false ? "pr-10 border-red-500" : "pr-10"}
                            />
                          </FormControl>
                          {isValid !== null && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {isValid ? 
                                <CheckCircle2Icon className="h-5 w-5 text-green-500" /> : 
                                <XCircleIcon className="h-5 w-5 text-red-500" />
                              }
                            </div>
                          )}
                        </div>
                        {isValid === false && (
                          <p className="text-sm text-red-500 mt-1">
                            CPF ou CNPJ inválido. Verifique os números digitados.
                          </p>
                        )}
                        <FormDescription>
                          Opcional. Se informado, será impresso na NFC-e.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              )}

              {type === 'nfse' && (
                <>
                  <FormField
                    control={form.control}
                    name="servicosPrestados"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serviços Prestados</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="aliquotaIss"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alíquota ISS (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="space-y-4">
                {form.watch('items').map((_, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Item {index + 1}</h3>
                        {form.watch('items').length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantidade</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.unitValue`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Valor Unitário</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {type === 'nfe' && (
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`items.${index}.ncm`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>NCM</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`items.${index}.cfop`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CFOP</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => form.setValue('items', [
                  ...form.watch('items'),
                  { description: '', quantity: 1, unitValue: 0 }
                ])}
              >
                Adicionar Item
              </Button>

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o método de pagamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                        <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || (requiresApiConfig && (type === 'nfce' || type === 'nfse'))}
            className={showValidationWarning ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            {isLoading ? 'Emitindo...' : showValidationWarning ? 'Emitir Mesmo Assim' : 'Emitir Documento'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DocumentForm;
