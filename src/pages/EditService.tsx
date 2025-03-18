import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface SelectedPart {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const EditService: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
  const [laborCost, setLaborCost] = useState<number>(100);
  const [manualPartsTotal, setManualPartsTotal] = useState<number | null>(null);
  const [manualCustomerName, setManualCustomerName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    customerId: '',
    deviceId: '',
    serviceType: '',
    customServiceType: '',
    technicianId: '',
    estimatedCompletion: '',
    status: 'waiting',
    priority: 'normal',
    warranty: '',
    notes: '',
  });
  
  // Load data from localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load service data
        const savedServices = localStorage.getItem('pauloCell_services');
        if (savedServices) {
          const services = JSON.parse(savedServices);
          let foundService = services.find((s: any) => s.id === id);
          
          if (foundService) {
            // Verificar se o serviço deve ser marcado como concluído automaticamente
            if (
              foundService.estimatedCompletion && 
              foundService.status !== 'completed' && 
              foundService.status !== 'delivered'
            ) {
              const currentDate = new Date();
              const [day, month, year] = foundService.estimatedCompletion.split('/').map(Number);
              const estimatedDate = new Date(year, month - 1, day); // Mês em JS é 0-indexed
              
              // Se a data atual for posterior à data estimada, atualizar para concluído
              if (currentDate > estimatedDate) {
                foundService = { ...foundService, status: 'completed' };
                
                // Atualiza a lista completa de serviços no localStorage
                const updatedServices = services.map((s: any) => 
                  s.id === id ? foundService : s
                );
                localStorage.setItem('pauloCell_services', JSON.stringify(updatedServices));
                
                toast.info("O serviço foi marcado como concluído pois a data estimada foi ultrapassada.");
              }
            }
            
            // Set form data from found service
            const serviceType = foundService.type || foundService.serviceType || '';
            const isCustomService = !['Troca de Tela', 'Substituição de Bateria', 'Reparo de Placa', 'Troca de Conector de Carga', 'Atualização de Software', 'Limpeza Interna'].includes(serviceType);
            
            setFormData({
              customerId: foundService.customerId || '',
              deviceId: foundService.deviceId || '',
              serviceType: isCustomService ? 'outros' : serviceType,
              customServiceType: isCustomService ? serviceType : '',
              technicianId: foundService.technicianId || '',
              estimatedCompletion: foundService.estimatedCompletion || '',
              status: foundService.status || 'waiting',
              priority: foundService.priority || 'normal',
              warranty: foundService.warranty || '',
              notes: foundService.notes || '',
            });
            
            // Set labor cost
            setLaborCost(foundService.laborCost || 100);
            
            // Set selected parts
            if (foundService.parts && Array.isArray(foundService.parts)) {
              setSelectedParts(foundService.parts);
            }
            
            // Set manual parts total if available
            if (foundService.manualPartsTotal !== undefined && foundService.manualPartsTotal !== null) {
              setManualPartsTotal(foundService.manualPartsTotal);
            }
            
            // Set manual customer name if no customerId is present
            if (!foundService.customerId && foundService.customer) {
              setManualCustomerName(foundService.customer);
            }
          } else {
            toast.error("Serviço não encontrado.");
            navigate('/services');
            return;
          }
        } else {
          toast.error("Não há serviços cadastrados.");
          navigate('/services');
          return;
        }
        
        // Load customers
        const savedCustomers = localStorage.getItem('pauloCell_customers');
        if (savedCustomers) {
          setCustomers(JSON.parse(savedCustomers));
        }
        
        // Load devices
        const savedDevices = localStorage.getItem('pauloCell_devices');
        if (savedDevices) {
          setDevices(JSON.parse(savedDevices));
        }
        
        // Load inventory
        const savedInventory = localStorage.getItem('pauloCell_inventory');
        if (savedInventory) {
          setInventoryItems(JSON.parse(savedInventory));
        } else {
          // Fallback to mock data if no inventory is found
          setInventoryItems([
            { id: '1', name: 'Tela iPhone 13 Pro', price: 350, stock: 5 },
            { id: '2', name: 'Bateria Samsung Galaxy S22', price: 120, stock: 3 },
            { id: '3', name: 'Conector de Carga iPhone 12', price: 80, stock: 8 },
            { id: '4', name: 'Tela Xiaomi Redmi Note 11', price: 180, stock: 4 },
            { id: '5', name: 'Alto Falante iPhone 13', price: 60, stock: 12 },
            { id: '6', name: 'Cabo Flex Motorola Moto G32', price: 45, stock: 6 },
          ]);
        }
      } catch (error) {
        console.error('Error loading service data:', error);
        toast.error("Ocorreu um erro ao carregar os dados do serviço.");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'serviceType' && value === 'outros') {
      setFormData({ ...formData, [name]: value, customServiceType: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleLaborCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setLaborCost(value);
  };
  
  const handleManualPartsTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setManualPartsTotal(isNaN(value) ? null : value);
  };
  
  const addPart = (partId: string) => {
    const part = inventoryItems.find(p => p.id === partId);
    if (part) {
      const existingPart = selectedParts.find(p => p.id === partId);
      if (existingPart) {
        setSelectedParts(prev => 
          prev.map(p => p.id === partId ? { ...p, quantity: p.quantity + 1 } : p)
        );
      } else {
        setSelectedParts(prev => [...prev, { ...part, quantity: 1 }]);
      }
    }
  };
  
  const removePart = (partId: string) => {
    setSelectedParts(prev => prev.filter(p => p.id !== partId));
  };
  
  const updatePartQuantity = (partId: string, quantity: number) => {
    if (quantity <= 0) {
      removePart(partId);
      return;
    }
    
    setSelectedParts(prev => 
      prev.map(p => p.id === partId ? { ...p, quantity } : p)
    );
  };
  
  const calculateTotalParts = () => {
    if (manualPartsTotal !== null) {
      return manualPartsTotal;
    }
    return selectedParts.reduce((total, part) => total + (part.price * part.quantity), 0);
  };
  
  const calculateTotal = () => {
    return calculateTotalParts() + laborCost;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get customer and device names
    const customer = customers.find(c => c.id === formData.customerId);
    const device = devices.find(d => d.id === formData.deviceId);
    
    // Get existing services
    const savedServices = localStorage.getItem('pauloCell_services');
    if (!savedServices) {
      toast.error("Não foi possível encontrar os serviços cadastrados.");
      return;
    }
    
    const services = JSON.parse(savedServices);
    
    // Find the service to update
    const serviceIndex = services.findIndex((s: any) => s.id === id);
    if (serviceIndex === -1) {
      toast.error("Serviço não encontrado.");
      return;
    }
    
    // Validar se o campo de serviço personalizado está preenchido quando 'Outros Serviços' for selecionado
    if (formData.serviceType === 'outros' && !formData.customServiceType.trim()) {
      toast.error("Por favor, digite o nome do serviço.");
      return;
    }
    
    // Verifica se o serviço deve ser marcado como concluído automaticamente
    let updatedStatus = formData.status;
    if (
      formData.estimatedCompletion && 
      formData.status !== 'completed' && 
      formData.status !== 'delivered'
    ) {
      const currentDate = new Date();
      const [day, month, year] = formData.estimatedCompletion.split('/').map(Number);
      const estimatedDate = new Date(year, month - 1, day); // Mês em JS é 0-indexed
      
      // Se a data atual for posterior à data estimada, atualizar para concluído
      if (currentDate > estimatedDate) {
        updatedStatus = 'completed';
        toast.info("O serviço foi marcado como concluído pois a data estimada foi ultrapassada.");
      }
    }
    
    let customerName = 'Cliente não identificado';
    
    // Se um cliente foi selecionado, use o nome dele
    if (formData.customerId && customer) {
      customerName = customer.name;
    } 
    // Se nenhum cliente foi selecionado mas foi digitado um nome, use o nome digitado
    else if (manualCustomerName.trim()) {
      customerName = manualCustomerName;
    }
    
    // Create updated service data
    const updatedService = {
      ...services[serviceIndex],
      ...formData,
      status: updatedStatus, // Usar o status atualizado
      type: formData.serviceType === 'outros' ? formData.customServiceType : formData.serviceType,
      parts: selectedParts,
      laborCost,
      manualPartsTotal,
      totalCost: calculateTotal(),
      price: calculateTotal(), // Added for ServiceCard compatibility
      customer: customerName,
      customerId: formData.customerId || undefined,
      device: device?.name || 'Dispositivo não especificado',
      deviceId: formData.deviceId || undefined, // Mantém undefined quando não há dispositivo selecionado
      technician: formData.technicianId || 'Não atribuído',
      estimatedCompletion: formData.estimatedCompletion || undefined,
      warranty: formData.warranty || undefined,
      updatedAt: new Date().toISOString(),
    };
    
    // Update the service in the array
    services[serviceIndex] = updatedService;
    
    // Save to localStorage
    localStorage.setItem('pauloCell_services', JSON.stringify(services));
    
    toast.success("Serviço atualizado com sucesso.");
    
    navigate(`/services/${id}`);
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
            onClick={() => navigate(`/services/${id}`)}
            className="h-8 w-8"
          >
            <ArrowLeftIcon size={16} />
          </Button>
          <h1 className="text-2xl font-bold">Editar Serviço</h1>
        </div>
        
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="customer">Cliente (opcional)</Label>
                <div className="space-y-2">
                  <Select 
                    value={formData.customerId} 
                    onValueChange={(value) => handleSelectChange('customerId', value)}
                  >
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {!formData.customerId && (
                    <div className="pt-2">
                      <Label htmlFor="manualCustomerName">Nome do cliente</Label>
                      <Input
                        id="manualCustomerName"
                        value={manualCustomerName}
                        onChange={(e) => setManualCustomerName(e.target.value)}
                        placeholder="Digite o nome do cliente"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="device">Dispositivo (opcional)</Label>
                <Select 
                  value={formData.deviceId}
                  onValueChange={(value) => handleSelectChange('deviceId', value)}
                >
                  <SelectTrigger id="device">
                    <SelectValue placeholder="Selecione o dispositivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.brand} {d.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serviceType">Tipo de Serviço</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value) => handleSelectChange('serviceType', value)}
                >
                  <SelectTrigger id="serviceType">
                    <SelectValue placeholder="Selecione o tipo de serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Troca de Tela">Troca de Tela</SelectItem>
                    <SelectItem value="Substituição de Bateria">Substituição de Bateria</SelectItem>
                    <SelectItem value="Reparo de Placa">Reparo de Placa</SelectItem>
                    <SelectItem value="Troca de Conector de Carga">Troca de Conector de Carga</SelectItem>
                    <SelectItem value="Atualização de Software">Atualização de Software</SelectItem>
                    <SelectItem value="Limpeza Interna">Limpeza Interna</SelectItem>
                    <SelectItem value="outros">Outros Serviços</SelectItem>
                  </SelectContent>
                </Select>
                {formData.serviceType === 'outros' && (
                  <div className="mt-2">
                    <Input
                      id="customServiceType"
                      name="customServiceType"
                      value={formData.customServiceType}
                      onChange={handleInputChange}
                      placeholder="Digite o nome do serviço"
                      required
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="technician">Técnico Responsável</Label>
                <Input
                  id="technician"
                  name="technicianId"
                  value={formData.technicianId}
                  onChange={handleInputChange}
                  placeholder="Nome do técnico responsável"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estimatedCompletion">Data Estimada de Conclusão</Label>
                <Input
                  id="estimatedCompletion"
                  name="estimatedCompletion"
                  type="date"
                  value={formData.estimatedCompletion}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="waiting">Aguardando</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="warranty">Garantia do Consumidor</Label>
                <select 
                  id="warranty"
                  name="warranty"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.warranty}
                  onChange={(e) => handleSelectChange('warranty', e.target.value)}
                >
                  <option value="">Sem garantia</option>
                  <option value="1">1 Mês</option>
                  <option value="3">3 Meses</option>
                  <option value="6">6 Meses</option>
                  <option value="12">12 Meses</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select 
                  value={formData.priority}
                  onValueChange={(value) => handleSelectChange('priority', value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Detalhes adicionais sobre o serviço..."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Peças Utilizadas</h3>
                <div className="flex items-center gap-2">
                  <Select onValueChange={addPart}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Adicionar peça" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryItems.map(item => (
                        <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedParts.length > 0 ? (
                <div className="space-y-2">
                  {selectedParts.map(part => (
                    <div key={part.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{part.name}</p>
                        <p className="text-sm text-muted-foreground">R$ {part.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => updatePartQuantity(part.id, part.quantity - 1)}
                          >
                            -
                          </Button>
                          <div className="h-8 px-3 flex items-center justify-center border-y">
                            {part.quantity}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => updatePartQuantity(part.id, part.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removePart(part.id)}
                        >
                          <TrashIcon size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-2 flex items-center justify-between">
                    <Label htmlFor="manualPartsTotal">Total Peças (R$):</Label>
                    <Input
                      id="manualPartsTotal"
                      type="number"
                      value={manualPartsTotal !== null ? manualPartsTotal : calculateTotalParts()}
                      onChange={handleManualPartsTotalChange}
                      min="0"
                      step="10"
                      className="w-24 text-right"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-4 border border-dashed rounded-md">
                  <p className="text-sm text-muted-foreground">Nenhuma peça adicionada</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="laborCost">Mão de Obra (R$)</Label>
              <Input
                id="laborCost"
                type="number"
                value={laborCost}
                onChange={handleLaborCostChange}
                min="0"
                step="10"
              />
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <p className="text-lg font-medium">Total: R$ {calculateTotal().toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Peças + Mão de Obra</p>
              </div>
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </MainLayout>
  );
};

export default EditService;