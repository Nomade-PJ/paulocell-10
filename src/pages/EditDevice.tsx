import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PatternLock from '@/components/PatternLock';

const EditDevice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [device, setDevice] = useState<any>(null);
  const [manualOwnerName, setManualOwnerName] = useState<string>('');
  const [passwordValue, setPasswordValue] = useState<string>('');
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    serialNumber: '',
    type: '',
    status: '',
    purchaseDate: '',
    owner: '',
    ownerName: '',
    passwordType: 'none',
    notes: ''
  });
  
  useEffect(() => {
    // Load device data from localStorage based on ID
    const loadDeviceData = () => {
      try {
        const savedDevices = localStorage.getItem('pauloCell_devices');
        if (savedDevices) {
          const devices = JSON.parse(savedDevices);
          const foundDevice = devices.find((d: any) => d.id === id);
          
          if (foundDevice) {
            setDevice(foundDevice);
            setFormData({
              brand: foundDevice.brand || '',
              model: foundDevice.model || '',
              serialNumber: foundDevice.serialNumber || '',
              type: foundDevice.type || '',
              status: foundDevice.status || '',
              purchaseDate: foundDevice.purchaseDate || '',
              owner: foundDevice.owner || '',
              ownerName: foundDevice.ownerName || '',
              passwordType: foundDevice.passwordType || 'none',
              notes: foundDevice.notes || ''
            });
            
            // Se temos ownerName mas não owner, foi um nome manual
            if (foundDevice.ownerName && !foundDevice.owner) {
              setManualOwnerName(foundDevice.ownerName);
            }
            
            // Carregar a senha existente
            if (foundDevice.password) {
              setPasswordValue(foundDevice.password);
            }
          } else {
            toast.error('Dispositivo não encontrado');
            navigate('/devices');
          }
        } else {
          toast.error('Nenhum dispositivo cadastrado');
          navigate('/devices');
        }
        
        // Load customers for owner selection
        const savedCustomers = localStorage.getItem('pauloCell_customers');
        if (savedCustomers) {
          setCustomers(JSON.parse(savedCustomers));
        }
      } catch (error) {
        console.error('Error loading device data:', error);
        toast.error('Erro ao carregar dados do dispositivo');
      } finally {
        setLoading(false);
      }
    };
    
    loadDeviceData();
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    
    if (name === 'owner') {
      const selectedCustomer = customers.find((c: any) => c.id === value);
      if (selectedCustomer) {
        setFormData(prev => ({
          ...prev,
          ownerName: selectedCustomer.name
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields (owner is now optional)
    if (!formData.type || !formData.model) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    // Validate password based on type
    if (formData.passwordType !== 'none' && !passwordValue) {
      toast.error(`Por favor, preencha a ${formData.passwordType === 'pin' ? 'PIN' : 
                                           formData.passwordType === 'pattern' ? 'Padrão' : 'Senha'}.`);
      return;
    }
    
    if (formData.passwordType === 'pin' && !/^\d{4,6}$/.test(passwordValue)) {
      toast.error("O PIN deve conter entre 4 e 6 dígitos numéricos.");
      return;
    }
    
    try {
      // Get existing devices
      const savedDevices = localStorage.getItem('pauloCell_devices');
      if (!savedDevices) {
        toast.error('Não foi possível encontrar os dispositivos cadastrados.');
        return;
      }
      
      const devices = JSON.parse(savedDevices);
      
      // Find the device to update
      const deviceIndex = devices.findIndex((d: any) => d.id === id);
      if (deviceIndex === -1) {
        toast.error('Dispositivo não encontrado.');
        return;
      }
      
      // Set ownerName for devices with no owner selected but with manually entered owner name
      let finalOwnerName = formData.ownerName;
      if (!formData.owner && manualOwnerName.trim()) {
        finalOwnerName = manualOwnerName;
      } else if (!formData.owner && !manualOwnerName.trim()) {
        finalOwnerName = ''; // Empty if no owner is selected and no manual name provided
      }
      
      // Create updated device data
      const updatedDevice = {
        ...devices[deviceIndex],
        ...formData,
        ownerName: finalOwnerName,
        // Make owner undefined if empty string to maintain consistency with optional owner
        owner: formData.owner || undefined,
        // Add password information
        passwordType: formData.passwordType,
        password: formData.passwordType !== 'none' ? passwordValue : '',
        updatedAt: new Date().toISOString()
      };
      
      // Update the device in the array
      devices[deviceIndex] = updatedDevice;
      
      // Save to localStorage
      localStorage.setItem('pauloCell_devices', JSON.stringify(devices));
      
      toast.success('Dispositivo atualizado com sucesso.');
      navigate(`/devices/${id}`);
    } catch (error) {
      console.error('Error updating device:', error);
      toast.error('Erro ao atualizar dispositivo.');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
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
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(`/devices/${id}`)}
            className="h-8 w-8"
          >
            <ArrowLeftIcon size={16} />
          </Button>
          <h1 className="text-2xl font-bold">Editar Dispositivo</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="brand">Marca</Label>
                <Select 
                  value={formData.brand} 
                  onValueChange={(value) => handleSelectChange('brand', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a marca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="samsung">Samsung</SelectItem>
                    <SelectItem value="xiaomi">Xiaomi</SelectItem>
                    <SelectItem value="motorola">Motorola</SelectItem>
                    <SelectItem value="lg">LG</SelectItem>
                    <SelectItem value="other">Outra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="model">Modelo</Label>
                <Input 
                  id="model" 
                  name="model" 
                  value={formData.model} 
                  onChange={handleInputChange} 
                  placeholder="Ex: iPhone 13 Pro" 
                />
              </div>
              
              <div>
                <Label htmlFor="serialNumber">Número de Série</Label>
                <Input 
                  id="serialNumber" 
                  name="serialNumber" 
                  value={formData.serialNumber} 
                  onChange={handleInputChange} 
                  placeholder="Ex: IMEI ou S/N" 
                />
              </div>
              
              <div>
                <Label htmlFor="type">Tipo de Dispositivo</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cellphone">Celular</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="notebook">Notebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Estado do Dispositivo</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Bom estado</SelectItem>
                    <SelectItem value="issue">Problemas leves</SelectItem>
                    <SelectItem value="critical">Problemas críticos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="passwordType">Cadastrar Senha</Label>
                <Select 
                  value={formData.passwordType} 
                  onValueChange={(value) => handleSelectChange('passwordType', value)}
                >
                  <SelectTrigger id="passwordType">
                    <SelectValue placeholder="Tipo de senha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    <SelectItem value="pin">PIN</SelectItem>
                    <SelectItem value="pattern">Padrão</SelectItem>
                    <SelectItem value="password">Senha</SelectItem>
                  </SelectContent>
                </Select>
                
                {formData.passwordType === 'pin' && (
                  <div className="pt-2">
                    <Label htmlFor="password">PIN</Label>
                    <Input
                      id="password"
                      type="number"
                      value={passwordValue}
                      onChange={(e) => setPasswordValue(e.target.value)}
                      placeholder="Digite o PIN (4-6 dígitos)"
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground mt-1">PIN deve conter entre 4 e 6 dígitos numéricos.</p>
                  </div>
                )}
                
                {formData.passwordType === 'pattern' && (
                  <div className="pt-2">
                    <Label htmlFor="password">Padrão</Label>
                    <div className="flex justify-center items-center mt-2">
                      <PatternLock
                        value={passwordValue}
                        onChange={(value) => setPasswordValue(value)}
                        size={200}
                      />
                    </div>
                  </div>
                )}
                
                {formData.passwordType === 'password' && (
                  <div className="pt-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      value={passwordValue}
                      onChange={(e) => setPasswordValue(e.target.value)}
                      placeholder="Digite a senha alfanumérica"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="purchaseDate">Data de Compra</Label>
                <Input 
                  id="purchaseDate" 
                  name="purchaseDate" 
                  type="date" 
                  value={formData.purchaseDate} 
                  onChange={handleInputChange} 
                />
              </div>
              
              <div>
                <Label htmlFor="owner">Proprietário (opcional)</Label>
                <div className="space-y-2">
                  <Select 
                    value={formData.owner} 
                    onValueChange={(value) => handleSelectChange('owner', value)}
                  >
                    <SelectTrigger id="owner">
                      <SelectValue placeholder="Selecione o proprietário" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.length > 0 ? (
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
                  
                  {!formData.owner && (
                    <div className="pt-2">
                      <Label htmlFor="manualOwnerName">Nome do proprietário</Label>
                      <Input
                        id="manualOwnerName"
                        value={manualOwnerName}
                        onChange={(e) => setManualOwnerName(e.target.value)}
                        placeholder="Digite o nome do proprietário"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Observações</Label>
            <textarea 
              id="notes" 
              name="notes" 
              value={formData.notes} 
              onChange={handleInputChange} 
              className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/50 focus:outline-none"
              placeholder="Informações adicionais sobre o dispositivo..."
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/devices/${id}`)}
            >
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </motion.div>
    </MainLayout>
  );
};

export default EditDevice;