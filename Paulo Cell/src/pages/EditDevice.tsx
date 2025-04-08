import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { DeviceAPI, CustomerAPI } from '@/lib/api-service';
import { useConnection } from '@/lib/ConnectionContext';
import { Skeleton } from '@/components/ui/skeleton';

const EditDevice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deviceLoading, setDeviceLoading] = useState(true);
  const [customerLoading, setCustomerLoading] = useState(true);
  const { isApiConnected } = useConnection();
  
  // Estado do formulário do dispositivo
  const [deviceData, setDeviceData] = useState({
    id: '',
    type: 'smartphone',
    brand: '',
    model: '',
    serialNumber: '',
    color: '',
    condition: 'good',
    password: '',
    accessories: '',
    notes: '',
    ownerId: '',
    ownerName: '',
    status: 'registered',
    createdAt: new Date().toISOString(),
  });
  
  // Carregar o dispositivo e clientes
  useEffect(() => {
    if (id) {
      loadDevice(id);
      loadCustomers();
    }
  }, [id]);
  
  const loadDevice = async (deviceId: string) => {
    setDeviceLoading(true);
    try {
      const device = await DeviceAPI.getById(deviceId);
      if (device) {
        setDeviceData({
          id: device.id,
          type: device.type || 'smartphone',
          brand: device.brand || '',
          model: device.model || '',
          serialNumber: device.serialNumber || '',
          color: device.color || '',
          condition: device.condition || 'good',
          password: device.password || '',
          accessories: device.accessories || '',
          notes: device.notes || '',
          ownerId: device.ownerId || '',
          ownerName: device.ownerName || '',
          status: device.status || 'registered',
          createdAt: device.createdAt || new Date().toISOString(),
        });
      } else {
        toast.error('Dispositivo não encontrado');
        navigate('/devices');
      }
    } catch (error) {
      console.error('Erro ao carregar dispositivo:', error);
      
      // Tentar carregar do localStorage
      try {
        const savedDevices = localStorage.getItem('pauloCell_devices');
        if (savedDevices) {
          const devices = JSON.parse(savedDevices);
          const device = devices.find((d: any) => d.id === deviceId);
          
          if (device) {
            setDeviceData({
              id: device.id,
              type: device.type || 'smartphone',
              brand: device.brand || '',
              model: device.model || '',
              serialNumber: device.serialNumber || '',
              color: device.color || '',
              condition: device.condition || 'good',
              password: device.password || '',
              accessories: device.accessories || '',
              notes: device.notes || '',
              ownerId: device.ownerId || device.owner || '',
              ownerName: device.ownerName || '',
              status: device.status || 'registered',
              createdAt: device.createdAt || new Date().toISOString(),
            });
          } else {
            toast.error('Dispositivo não encontrado');
            navigate('/devices');
          }
        } else {
          toast.error('Dispositivo não encontrado');
          navigate('/devices');
        }
      } catch (localError) {
        console.error('Erro ao carregar dispositivo do localStorage:', localError);
        toast.error('Erro ao carregar o dispositivo');
        navigate('/devices');
      }
    } finally {
      setDeviceLoading(false);
    }
  };
  
  const loadCustomers = async () => {
    setCustomerLoading(true);
    try {
      const customersData = await CustomerAPI.getAll();
      setCustomers(customersData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      
      // Fallback para localStorage
      const savedCustomers = localStorage.getItem('pauloCell_customers');
      if (savedCustomers) {
        setCustomers(JSON.parse(savedCustomers));
      }
    } finally {
      setCustomerLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeviceData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (field: string, value: string) => {
    setDeviceData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCustomerSelect = (customerId: string) => {
    const selectedCustomer = customers.find(c => c.id === customerId);
    if (selectedCustomer) {
      setDeviceData(prev => ({
        ...prev,
        ownerId: customerId,
        ownerName: `${selectedCustomer.name} ${selectedCustomer.lastName || ''}`.trim()
      }));
    }
  };
  
  const validateForm = () => {
    if (!deviceData.brand.trim()) {
      toast.error('Por favor, informe a marca do dispositivo');
      return false;
    }
    if (!deviceData.model.trim()) {
      toast.error('Por favor, informe o modelo do dispositivo');
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Preparar dados atualizados
      const updatedDevice = {
        ...deviceData,
        updatedAt: new Date().toISOString()
      };
      
      // Salvar na API
      await DeviceAPI.update(deviceData.id, updatedDevice);
      
      toast.success('Dispositivo atualizado com sucesso!');
      
      // Disparar evento de atualização de dados
      window.dispatchEvent(new CustomEvent('pauloCell_dataUpdated', { 
        detail: { source: 'device', operation: 'update' }
      }));
      
      // Redirecionar para a página de detalhes do dispositivo
      navigate(`/devices/${deviceData.id}`);
    } catch (error) {
      console.error('Erro ao atualizar dispositivo:', error);
      
      // Se não conseguir salvar na API, tentar salvar no localStorage
      if (!isApiConnected) {
        try {
          // Preparar dados atualizados
          const updatedDevice = {
            ...deviceData,
            updatedAt: new Date().toISOString()
          };
          
          // Carregar lista atual de dispositivos
          const savedDevices = localStorage.getItem('pauloCell_devices');
          
          if (savedDevices) {
            const devices = JSON.parse(savedDevices);
            const updatedDevices = devices.map((d: any) => 
              d.id === deviceData.id ? updatedDevice : d
            );
            
            // Salvar de volta no localStorage
            localStorage.setItem('pauloCell_devices', JSON.stringify(updatedDevices));
            
            toast.success('Dispositivo atualizado localmente. Será sincronizado quando houver conexão.');
            
            // Disparar evento de atualização de dados
            window.dispatchEvent(new CustomEvent('pauloCell_dataUpdated', { 
              detail: { source: 'device', operation: 'update' }
            }));
            
            // Redirecionar para a página de detalhes do dispositivo
            navigate(`/devices/${deviceData.id}`);
          } else {
            toast.error('Não foi possível atualizar o dispositivo');
          }
        } catch (localError) {
          console.error('Erro ao salvar dispositivo localmente:', localError);
          toast.error('Não foi possível atualizar o dispositivo');
        }
      } else {
        toast.error('Erro ao atualizar dispositivo. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Renderizar skeleton loader durante o carregamento
  if (deviceLoading) {
    return (
      <MainLayout>
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </motion.div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-2xl font-bold">Editar Dispositivo</h1>
          <p className="text-muted-foreground">Atualize as informações do dispositivo</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Informações Básicas</h2>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Dispositivo *</Label>
                <Select 
                  value={deviceData.type} 
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smartphone">Smartphone</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="laptop">Notebook</SelectItem>
                    <SelectItem value="desktop">Computador Desktop</SelectItem>
                    <SelectItem value="smartwatch">Smartwatch</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={deviceData.status} 
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="registered">Registrado</SelectItem>
                    <SelectItem value="waiting_diagnosis">Aguardando Diagnóstico</SelectItem>
                    <SelectItem value="in_repair">Em Reparo</SelectItem>
                    <SelectItem value="waiting_parts">Aguardando Peças</SelectItem>
                    <SelectItem value="ready">Pronto para Retirada</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={deviceData.brand}
                  onChange={handleInputChange}
                  placeholder="Apple, Samsung, Xiaomi..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model">Modelo *</Label>
                <Input
                  id="model"
                  name="model"
                  value={deviceData.model}
                  onChange={handleInputChange}
                  placeholder="iPhone 13, Galaxy S22..."
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <Input
                  id="color"
                  name="color"
                  value={deviceData.color}
                  onChange={handleInputChange}
                  placeholder="Preto, Branco, Azul..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Número de Série/IMEI</Label>
                <Input
                  id="serialNumber"
                  name="serialNumber"
                  value={deviceData.serialNumber}
                  onChange={handleInputChange}
                  placeholder="123456789012345"
                />
              </div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="condition">Estado do Dispositivo</Label>
                <Select 
                  value={deviceData.condition} 
                  onValueChange={(value) => handleSelectChange('condition', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Novo</SelectItem>
                    <SelectItem value="excellent">Excelente</SelectItem>
                    <SelectItem value="good">Bom</SelectItem>
                    <SelectItem value="fair">Regular</SelectItem>
                    <SelectItem value="poor">Ruim</SelectItem>
                    <SelectItem value="broken">Quebrado/Danificado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha/Padrão de Desbloqueio</Label>
                <Input
                  id="password"
                  name="password"
                  value={deviceData.password}
                  onChange={handleInputChange}
                  placeholder="Senha fornecida pelo cliente"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accessories">Acessórios</Label>
              <Textarea
                id="accessories"
                name="accessories"
                value={deviceData.accessories}
                onChange={handleInputChange}
                placeholder="Carregador, capa, fone de ouvido, etc."
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                name="notes"
                value={deviceData.notes}
                onChange={handleInputChange}
                placeholder="Informações adicionais sobre o dispositivo"
                rows={3}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Proprietário</h2>
            
            <div className="space-y-2">
              <Label htmlFor="owner">Proprietário</Label>
              <Select 
                value={deviceData.ownerId} 
                onValueChange={handleCustomerSelect}
                disabled={customerLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={customerLoading ? "Carregando clientes..." : "Selecione um cliente"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem proprietário</SelectItem>
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
          </div>
          
          {!isApiConnected && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-600 text-sm">
                Você está offline. As alterações serão salvas localmente e sincronizadas quando houver conexão.
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/devices/${deviceData.id}`)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </motion.div>
    </MainLayout>
  );
};

export default EditDevice;