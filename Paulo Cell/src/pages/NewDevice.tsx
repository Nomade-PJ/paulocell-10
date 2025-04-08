import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { DeviceAPI, CustomerAPI } from '@/lib/api-service';
import { useConnection } from '@/lib/ConnectionContext';

const NewDevice: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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
  
  // Carregar clientes para o dropdown de proprietários
  useEffect(() => {
    loadCustomers();
  }, []);
  
  const loadCustomers = async () => {
    setCustomerLoading(true);
    try {
      const customersData = await CustomerAPI.getAll();
      setCustomers(customersData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Não foi possível carregar a lista de clientes');
      
      // Fallback para localStorage se a API falhar
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
    if (!deviceData.ownerId) {
      toast.error('Por favor, selecione o proprietário do dispositivo');
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
      const newDevice = {
        ...deviceData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      
      // Salvar na API
      await DeviceAPI.create(newDevice);
      
      toast.success('Dispositivo registrado com sucesso!');
      
      // Disparar evento de atualização de dados
      window.dispatchEvent(new CustomEvent('pauloCell_dataUpdated', { 
        detail: { source: 'device', operation: 'create' }
      }));
      
      // Redirecionar para a lista de dispositivos
      navigate('/devices');
    } catch (error) {
      console.error('Erro ao registrar dispositivo:', error);
      
      // Se não conseguir salvar na API, tentar salvar no localStorage
      if (!isApiConnected) {
        try {
          // Preparar dados para salvar localmente
          const newDevice = {
            ...deviceData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
          };
          
          // Carregar lista atual de dispositivos
          const savedDevices = localStorage.getItem('pauloCell_devices');
          const devices = savedDevices ? JSON.parse(savedDevices) : [];
          
          // Adicionar novo dispositivo
          const updatedDevices = [newDevice, ...devices];
          
          // Salvar de volta no localStorage
          localStorage.setItem('pauloCell_devices', JSON.stringify(updatedDevices));
          
          toast.success('Dispositivo registrado localmente. Será sincronizado quando houver conexão.');
          
          // Disparar evento de atualização de dados
          window.dispatchEvent(new CustomEvent('pauloCell_dataUpdated', { 
            detail: { source: 'device', operation: 'create' }
          }));
          
          // Redirecionar para a lista de dispositivos
          navigate('/devices');
        } catch (localError) {
          console.error('Erro ao salvar dispositivo localmente:', localError);
          toast.error('Não foi possível salvar o dispositivo');
        }
      } else {
        toast.error('Erro ao registrar dispositivo. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-bold">Novo Dispositivo</h1>
          <p className="text-muted-foreground">Cadastre um novo dispositivo no sistema</p>
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
              <Label htmlFor="owner">Selecione o Proprietário *</Label>
              <Select 
                value={deviceData.ownerId} 
                onValueChange={handleCustomerSelect}
                disabled={customerLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={customerLoading ? "Carregando clientes..." : "Selecione um cliente"} />
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
          </div>
          
          {!isApiConnected && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-600 text-sm">
                Você está offline. O dispositivo será salvo localmente e sincronizado quando houver conexão.
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/devices')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Dispositivo'}
            </Button>
          </div>
        </form>
      </motion.div>
    </MainLayout>
  );
};

export default NewDevice;
