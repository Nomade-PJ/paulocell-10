import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ServiceAPI, CustomerAPI, DeviceAPI, InventoryAPI } from '@/lib/api-service';
import { useConnection } from '@/lib/ConnectionContext';

const NewService: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const { isApiConnected } = useConnection();
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    customerReport: '',
    diagnosis: '',
    solution: '',
    status: 'pending',
    priority: 'normal',
    repairType: 'hardware',
    estimatedTime: '1-2 dias',
    warranty: '90',
    price: '',
    depositValue: '',
    partsUsed: [] as string[],
    customerId: '',
    customerName: '',
    deviceId: deviceId || '',
    deviceModel: '',
    startDate: new Date().toISOString().substr(0, 10),
    estimatedEndDate: '',
    completedDate: '',
    createdAt: new Date().toISOString(),
  });
  
  // Carrega dados iniciais quando o componente é montado
  useEffect(() => {
    loadInitialData();
  }, [deviceId]);
  
  const loadInitialData = async () => {
    setDataLoading(true);
    try {
      // Carregar clientes
      const customersData = await CustomerAPI.getAll();
      setCustomers(customersData);
      
      // Carregar dispositivos
      const devicesData = await DeviceAPI.getAll();
      setDevices(devicesData);
      
      // Carregar inventário
      const inventoryData = await InventoryAPI.getAll();
      setInventory(inventoryData);
      
      // Se um dispositivo for especificado na URL, carregar seus dados
      if (deviceId) {
        const device = await DeviceAPI.getById(deviceId);
        if (device) {
          // Se o dispositivo for encontrado, preencher o formulário
          setFormData(prev => ({
            ...prev,
            deviceId: device.id,
            deviceModel: `${device.brand} ${device.model}`,
            customerId: device.ownerId || '',
            customerName: device.ownerName || '',
          }));
          
          // Se o dispositivo tiver um proprietário, verificar se precisamos carregar mais dados
          if (device.ownerId && !customersData.find(c => c.id === device.ownerId)) {
            try {
              const customerData = await CustomerAPI.getById(device.ownerId);
              if (customerData) {
                setCustomers(prev => [...prev, customerData]);
              }
            } catch (error) {
              console.error('Erro ao carregar dados do cliente:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error('Erro ao carregar dados. Por favor, verifique sua conexão e tente novamente.');
      setCustomers([]);
      setDevices([]);
      setInventory([]);
    } finally {
      setDataLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Se for seleção de cliente, atualizar lista de dispositivos do cliente
    if (field === 'customerId') {
      const selectedCustomer = customers.find(c => c.id === value);
      if (selectedCustomer) {
        setFormData(prev => ({
          ...prev,
          customerName: `${selectedCustomer.name} ${selectedCustomer.lastName || ''}`.trim(),
        }));
      }
    }
    
    // Se for seleção de dispositivo, atualizar dados do dispositivo
    if (field === 'deviceId') {
      const selectedDevice = devices.find(d => d.id === value);
      if (selectedDevice) {
        setFormData(prev => ({
          ...prev,
          deviceModel: `${selectedDevice.brand} ${selectedDevice.model}`,
        }));
      }
    }
  };
  
  const handlePartToggle = (partId: string) => {
    setFormData(prev => {
      const parts = [...prev.partsUsed];
      if (parts.includes(partId)) {
        return { ...prev, partsUsed: parts.filter(id => id !== partId) };
      } else {
        return { ...prev, partsUsed: [...parts, partId] };
      }
    });
  };
  
  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Por favor, informe um título para o serviço');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Por favor, descreva o serviço a ser realizado');
      return false;
    }
    if (!formData.customerId) {
      toast.error('Por favor, selecione um cliente');
      return false;
    }
    if (!formData.deviceId) {
      toast.error('Por favor, selecione um dispositivo');
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Preparar dados para salvar
      const serviceData = {
        ...formData,
        id: crypto.randomUUID(),
        partsUsed: formData.partsUsed.map(partId => {
          const part = inventory.find(i => i.id === partId);
          return {
            id: partId,
            name: part?.name || '',
            price: part?.price || 0
          };
        }),
        price: formData.price ? parseFloat(formData.price) : 0,
        depositValue: formData.depositValue ? parseFloat(formData.depositValue) : 0,
        createdAt: new Date().toISOString(),
      };
      
      // Salvar na API
      await ServiceAPI.create(serviceData);
      
      toast.success('Serviço registrado com sucesso!');
      
      // Disparar evento de atualização de dados
      window.dispatchEvent(new CustomEvent('pauloCell_dataUpdated', { 
        detail: { source: 'service', operation: 'create' }
      }));
      
      // Redirecionar para a página de detalhes do serviço
      navigate(`/services/${serviceData.id}`);
    } catch (error) {
      console.error('Erro ao registrar serviço:', error);
      toast.error('Erro ao registrar serviço. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filtra os dispositivos do cliente selecionado
  const getCustomerDevices = () => {
    if (!formData.customerId) return [];
    return devices.filter(device => device.ownerId === formData.customerId || device.owner === formData.customerId);
  };
  
  return (
    <MainLayout>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-2xl font-bold">Novo Serviço</h1>
          <p className="text-muted-foreground">Registre um novo serviço para um dispositivo</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Informações do Cliente e Dispositivo</h2>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerId">Cliente *</Label>
                <Select 
                  value={formData.customerId} 
                  onValueChange={(value) => handleSelectChange('customerId', value)}
                  disabled={dataLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={dataLoading ? "Carregando clientes..." : "Selecione um cliente"} />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} {customer.lastName || ''}
                        {customer.phone ? ` - ${customer.phone}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <p className="text-sm text-muted-foreground mt-2">
                  Não encontrou o cliente? {' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-normal text-sm" 
                    onClick={() => navigate('/customers/new')}
                  >
                    Cadastrar novo cliente
                  </Button>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deviceId">Dispositivo *</Label>
                <Select 
                  value={formData.deviceId} 
                  onValueChange={(value) => handleSelectChange('deviceId', value)}
                  disabled={!formData.customerId || dataLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      dataLoading ? "Carregando dispositivos..." : 
                      !formData.customerId ? "Selecione um cliente primeiro" : 
                      "Selecione um dispositivo"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {getCustomerDevices().map((device) => (
                      <SelectItem key={device.id} value={device.id}>
                        {device.brand} {device.model}
                        {device.color ? ` - ${device.color}` : ''}
                      </SelectItem>
                    ))}
                    {getCustomerDevices().length === 0 && formData.customerId && (
                      <SelectItem value="no-devices" disabled>
                        Nenhum dispositivo cadastrado para este cliente
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                
                <p className="text-sm text-muted-foreground mt-2">
                  Dispositivo não cadastrado? {' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-normal text-sm" 
                    onClick={() => navigate('/devices/new')}
                  >
                    Cadastrar novo dispositivo
                  </Button>
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Detalhes do Serviço</h2>
            
            <div className="space-y-2">
              <Label htmlFor="title">Título do Serviço *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ex: Troca de tela, Reparo de placa"
                required
              />
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="diagnosed">Diagnosticado</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="waiting_parts">Aguardando Peças</SelectItem>
                    <SelectItem value="finished">Finalizado</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleSelectChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="repairType">Tipo de Reparo</Label>
                <Select 
                  value={formData.repairType} 
                  onValueChange={(value) => handleSelectChange('repairType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="both">Hardware e Software</SelectItem>
                    <SelectItem value="inspection">Apenas Inspeção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Tempo Estimado</Label>
                <Select 
                  value={formData.estimatedTime} 
                  onValueChange={(value) => handleSelectChange('estimatedTime', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tempo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2 horas">1-2 horas</SelectItem>
                    <SelectItem value="mesmo dia">Mesmo dia</SelectItem>
                    <SelectItem value="1-2 dias">1-2 dias</SelectItem>
                    <SelectItem value="3-5 dias">3-5 dias</SelectItem>
                    <SelectItem value="1-2 semanas">1-2 semanas</SelectItem>
                    <SelectItem value="a definir">A definir após diagnóstico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição do Serviço *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva detalhadamente o serviço a ser realizado"
                rows={3}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerReport">Relato do Cliente</Label>
              <Textarea
                id="customerReport"
                name="customerReport"
                value={formData.customerReport}
                onChange={handleInputChange}
                placeholder="O que o cliente relatou sobre o problema"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnóstico Inicial</Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                placeholder="Diagnóstico inicial do problema"
                rows={3}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Peças e Valores</h2>
            
            <div className="space-y-2">
              <Label>Peças a Serem Utilizadas</Label>
              
              {inventory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                  {inventory.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-3 rounded-md border cursor-pointer ${
                        formData.partsUsed.includes(item.id) 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border'
                      }`}
                      onClick={() => handlePartToggle(item.id)}
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        <span>Preço: R$ {Number(item.price).toFixed(2)}</span>
                        {item.compatibility && (
                          <span className="ml-2">• {item.compatibility}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border rounded-md bg-muted/50">
                  <p className="text-muted-foreground text-sm">Nenhuma peça cadastrada no inventário</p>
                </div>
              )}
            </div>
            
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Valor Total (R$)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Valor total do serviço"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="depositValue">Valor de Entrada (R$)</Label>
                <Input
                  id="depositValue"
                  name="depositValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.depositValue}
                  onChange={handleInputChange}
                  placeholder="Valor de entrada/sinal"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="warranty">Garantia (dias)</Label>
                <Input
                  id="warranty"
                  name="warranty"
                  type="number"
                  min="0"
                  value={formData.warranty}
                  onChange={handleInputChange}
                  placeholder="Dias de garantia"
                />
              </div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estimatedEndDate">Previsão de Entrega</Label>
                <Input
                  id="estimatedEndDate"
                  name="estimatedEndDate"
                  type="date"
                  value={formData.estimatedEndDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          
          {!isApiConnected && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">
                Você está offline. Por favor, estabeleça uma conexão com o servidor para registrar novos serviços.
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/services')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !isApiConnected}>
              {loading ? 'Salvando...' : 'Registrar Serviço'}
            </Button>
          </div>
        </form>
      </motion.div>
    </MainLayout>
  );
};

export default NewService;
