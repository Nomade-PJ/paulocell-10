import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeftIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { v4 as uuidv4 } from 'uuid';
import PatternLock from '@/components/PatternLock';

const NewDevice: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [customers, setCustomers] = useState<any[]>([]);
  const customerId = location.state?.customerId;
  const [manualOwnerName, setManualOwnerName] = useState<string>('');
  const [passwordValue, setPasswordValue] = useState<string>('');
  const [formData, setFormData] = useState({
    id: uuidv4(),
    owner: customerId || '',
    ownerName: '',
    type: '',
    brand: '',
    model: '',
    serialNumber: '',
    status: '',
    color: '',
    capacity: '',
    passwordType: 'none',
    password: '',
    purchaseDate: '',
    notes: '',
    createdAt: new Date().toISOString(),
    lastService: new Date().toLocaleDateString('pt-BR')
  });
  
  useEffect(() => {
    // Load customers from localStorage
    const savedCustomers = localStorage.getItem('pauloCell_customers');
    if (savedCustomers) {
      const parsedCustomers = JSON.parse(savedCustomers);
      setCustomers(parsedCustomers);
      
      // If customerId is provided, set the owner name
      if (customerId) {
        const selectedCustomer = parsedCustomers.find((c: any) => c.id === customerId);
        if (selectedCustomer) {
          setFormData(prev => ({
            ...prev,
            ownerName: selectedCustomer.name
          }));
        }
      }
    }
  }, [customerId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If the owner field changes, update the owner name
    if (field === 'owner') {
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
      // Get existing devices from localStorage
      const savedDevices = localStorage.getItem('pauloCell_devices');
      let devices = savedDevices ? JSON.parse(savedDevices) : [];
      
      // Set ownerName for devices with no owner selected but with manually entered owner name
      let finalOwnerName = formData.ownerName;
      if (!formData.owner && manualOwnerName.trim()) {
        finalOwnerName = manualOwnerName;
      } else if (!formData.owner && !manualOwnerName.trim()) {
        finalOwnerName = ''; // Empty if no owner is selected and no manual name provided
      }
      
      // Add the new device with correct owner information and password
      const deviceData = {
        ...formData,
        ownerName: finalOwnerName,
        // Make owner undefined if empty string to maintain consistency with optional owner
        owner: formData.owner || undefined,
        // Add password information
        password: formData.passwordType !== 'none' ? passwordValue : '',
      };
      
      // Add the new device
      devices.push(deviceData);
      
      // Save updated devices list to localStorage
      localStorage.setItem('pauloCell_devices', JSON.stringify(devices));
      
      toast.success("Dispositivo cadastrado com sucesso!");
      
      // Navigate back to the previous page
      if (customerId) {
        navigate(`/customers/${customerId}`);
      } else {
        navigate('/devices');
      }
    } catch (error) {
      console.error('Error saving device:', error);
      toast.error("Ocorreu um erro ao salvar o dispositivo.");
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
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeftIcon size={16} />
          </Button>
          <h1 className="text-2xl font-bold">Novo Dispositivo</h1>
        </div>
        
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
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
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cellphone">Celular</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="notebook">Notebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Select 
                  value={formData.brand} 
                  onValueChange={(value) => handleSelectChange('brand', value)}
                >
                  <SelectTrigger id="brand">
                    <SelectValue placeholder="Selecione a marca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="samsung">Samsung</SelectItem>
                    <SelectItem value="xiaomi">Xiaomi</SelectItem>
                    <SelectItem value="motorola">Motorola</SelectItem>
                    <SelectItem value="lg">LG</SelectItem>
                    <SelectItem value="huawei">Huawei</SelectItem>
                    <SelectItem value="other">Outra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model">Modelo *</Label>
                <Input 
                  id="model" 
                  placeholder="Ex: iPhone 13 Pro" 
                  value={formData.model}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Número de Série / IMEI</Label>
                <Input 
                  id="serialNumber" 
                  placeholder="Ex: 123456789012345" 
                  value={formData.serialNumber}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Condição</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione a condição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Bom estado</SelectItem>
                    <SelectItem value="issue">Problemas leves</SelectItem>
                    <SelectItem value="critical">Problemas críticos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <Input 
                  id="color" 
                  placeholder="Ex: Preto" 
                  value={formData.color}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidade</Label>
                <Select 
                  value={formData.capacity} 
                  onValueChange={(value) => handleSelectChange('capacity', value)}
                >
                  <SelectTrigger id="capacity">
                    <SelectValue placeholder="Selecione a capacidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="32GB">32GB</SelectItem>
                    <SelectItem value="64GB">64GB</SelectItem>
                    <SelectItem value="128GB">128GB</SelectItem>
                    <SelectItem value="256GB">256GB</SelectItem>
                    <SelectItem value="512GB">512GB</SelectItem>
                    <SelectItem value="1TB">1TB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
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
              
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Data de Compra</Label>
                <Input 
                  id="purchaseDate" 
                  type="date" 
                  value={formData.purchaseDate}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea 
                id="notes" 
                placeholder="Informações adicionais sobre o dispositivo, condições físicas, etc."
                className="min-h-32"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Dispositivo</Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </MainLayout>
  );
};

export default NewDevice;
