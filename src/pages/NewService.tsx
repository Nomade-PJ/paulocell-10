import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeftIcon, PlusIcon, TrashIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface SelectedPart {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const NewService: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customerId, deviceId } = location.state || {};
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
  const [laborCost, setLaborCost] = useState<number>(100);
  const [manualPartsTotal, setManualPartsTotal] = useState<number | null>(null);
  const [manualCustomerName, setManualCustomerName] = useState<string>('');
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [newInventoryItem, setNewInventoryItem] = useState({
    name: '',
    sku: '',
    category: '',
    compatibility: '',
    price: 0,
    stock: 0,
    minStock: 0
  });
  
  const [formData, setFormData] = useState({
    customerId: customerId || '',
    deviceId: deviceId || '',
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
    const savedCustomers = localStorage.getItem('pauloCell_customers');
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }
    
    const savedDevices = localStorage.getItem('pauloCell_devices');
    if (savedDevices) {
      setDevices(JSON.parse(savedDevices));
    }
    
    const savedInventory = localStorage.getItem('pauloCell_inventory');
    if (savedInventory) {
      setInventoryItems(JSON.parse(savedInventory));
    } else {
      // Inicializar com array vazio quando não houver itens no inventário
      setInventoryItems([]);
    }
  }, []);
  
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
  
  const handleNewItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setNewInventoryItem(prev => ({
      ...prev,
      [id]: id === 'price' || id === 'stock' || id === 'minStock' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleAddNewInventoryItem = () => {
    // Validar campos obrigatórios
    if (!newInventoryItem.name.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }
    
    if (!newInventoryItem.category) {
      toast.error("Selecione uma categoria");
      return;
    }
    
    if (newInventoryItem.stock < 0) {
      toast.error("Estoque não pode ser negativo");
      return;
    }
    
    try {
      // Gerar ID único para o novo item
      const newItemId = uuidv4();
      
      // Formatar o novo item
      const itemToAdd = {
        id: newItemId,
        name: newInventoryItem.name,
        sku: newInventoryItem.sku,
        category: newInventoryItem.category,
        compatibility: newInventoryItem.compatibility,
        price: newInventoryItem.price,
        stock: newInventoryItem.stock,
        minStock: newInventoryItem.minStock,
        createdAt: new Date().toISOString()
      };
      
      // Obter o inventário atual
      const currentInventory = [...inventoryItems];
      
      // Adicionar o novo item
      currentInventory.push(itemToAdd);
      
      // Atualizar o estado e o localStorage
      setInventoryItems(currentInventory);
      localStorage.setItem('pauloCell_inventory', JSON.stringify(currentInventory));
      
      // Limpar o formulário e fechar o modal
      setNewInventoryItem({
        name: '',
        sku: '',
        category: '',
        compatibility: '',
        price: 0,
        stock: 0,
        minStock: 0
      });
      
      setIsNewItemModalOpen(false);
      toast.success("Item adicionado ao estoque com sucesso!");
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast.error("Ocorreu um erro ao adicionar o item");
    }
  };
  
  // Função para gerar SKU automaticamente
  const generateSKU = () => {
    // Gera um número aleatório de 4 dígitos
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `SKU-${randomNumber}`;
  };

  // Função para abrir o modal com SKU gerado automaticamente
  const openNewItemModal = () => {
    setNewInventoryItem(prev => ({
      ...prev,
      sku: generateSKU()
    }));
    setIsNewItemModalOpen(true);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get customer and device names
    const customer = customers.find(c => c.id === formData.customerId);
    const device = devices.find(d => d.id === formData.deviceId);
    
    // Validar se o campo de serviço personalizado está preenchido quando 'Outros Serviços' for selecionado
    if (formData.serviceType === 'outros' && !formData.customServiceType.trim()) {
      toast.error("Por favor, digite o nome do serviço.");
      return;
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
    
    const serviceData = {
      id: uuidv4(),
      ...formData,
      type: formData.serviceType === 'outros' ? formData.customServiceType : formData.serviceType,
      parts: selectedParts,
      laborCost,
      manualPartsTotal,
      totalCost: calculateTotal(),
      price: calculateTotal(), // Added for ServiceCard compatibility
      createdAt: new Date().toISOString(),
      createDate: new Date().toLocaleDateString(), // Added for ServiceCard compatibility
      customer: customerName,
      customerId: formData.customerId || undefined, // Mantém undefined quando não há cliente selecionado
      device: device?.name || 'Dispositivo não especificado',
      deviceId: formData.deviceId || undefined, // Mantém undefined quando não há dispositivo selecionado
      technician: formData.technicianId || 'Não atribuído',
      estimatedCompletion: formData.estimatedCompletion || undefined,
      warranty: formData.warranty || undefined, // Adiciona a garantia
    };
    
    // Get existing services or initialize empty array
    const savedServices = localStorage.getItem('pauloCell_services');
    const services = savedServices ? JSON.parse(savedServices) : [];
    
    // Add new service
    services.push(serviceData);
    
    // Save to localStorage
    localStorage.setItem('pauloCell_services', JSON.stringify(services));
    
    toast.success("Serviço adicionado com sucesso.");
    
    navigate('/services');
  };
  
  return (
    <MainLayout>
      {/* Novo Item Modal */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md relative overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Novo Item de Estoque</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsNewItemModalOpen(false)}
                className="h-8 w-8"
              >
                <X size={18} />
              </Button>
            </div>
            
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Preencha as informações do novo item para adicionar ao estoque
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={newInventoryItem.name}
                    onChange={handleNewItemInputChange}
                    placeholder="Ex: Tela iPhone 11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={newInventoryItem.sku}
                    onChange={handleNewItemInputChange}
                    placeholder="SKU-5236"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select 
                    value={newInventoryItem.category} 
                    onValueChange={(value) => setNewInventoryItem(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="screens">Telas</SelectItem>
                      <SelectItem value="batteries">Baterias</SelectItem>
                      <SelectItem value="connectors">Conectores</SelectItem>
                      <SelectItem value="cables">Cabos</SelectItem>
                      <SelectItem value="accessories">Acessórios</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="compatibility">Compatibilidade</Label>
                  <Input
                    id="compatibility"
                    value={newInventoryItem.compatibility}
                    onChange={handleNewItemInputChange}
                    placeholder="Ex: iPhone 11, 12"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newInventoryItem.price || ''}
                    onChange={handleNewItemInputChange}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stock">Estoque Atual *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={newInventoryItem.stock || ''}
                    onChange={handleNewItemInputChange}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minStock">Estoque Mínimo</Label>
                  <Input
                    id="minStock"
                    type="number"
                    min="0"
                    value={newInventoryItem.minStock || ''}
                    onChange={handleNewItemInputChange}
                    placeholder="5"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsNewItemModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddNewInventoryItem}>Salvar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
          <h1 className="text-2xl font-bold">Novo Serviço</h1>
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
                <Label htmlFor="technician">Técnico</Label>
                <Input
                  id="technician"
                  name="technicianId"
                  value={formData.technicianId}
                  onChange={handleInputChange}
                  placeholder="Nome do técnico responsável"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estimatedCompletion">Previsão de Conclusão</Label>
                <Input 
                  id="estimatedCompletion" 
                  name="estimatedCompletion"
                  value={formData.estimatedCompletion}
                  onChange={handleInputChange}
                  type="date" 
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
                    <SelectItem value="waiting">Em espera</SelectItem>
                    <SelectItem value="in_progress">Em andamento</SelectItem>
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
              <div className="flex justify-between items-center">
                <Label className="text-base">Peças Utilizadas</Label>
                <div className="flex items-center gap-2">
                  <Select onValueChange={addPart}>
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Adicionar peça" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryItems.map(part => (
                        <SelectItem key={part.id} value={part.id}>
                          {part.name} - R$ {part.price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    size="icon" 
                    onClick={() => openNewItemModal()}
                  >
                    <PlusIcon size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase py-3 px-4">Peça</th>
                      <th className="text-center text-xs font-medium text-muted-foreground uppercase py-3 px-4">Quantidade</th>
                      <th className="text-right text-xs font-medium text-muted-foreground uppercase py-3 px-4">Preço</th>
                      <th className="text-right text-xs font-medium text-muted-foreground uppercase py-3 px-4">Total</th>
                      <th className="text-right text-xs font-medium text-muted-foreground uppercase py-3 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedParts.length > 0 ? (
                      selectedParts.map((part, idx) => (
                        <tr key={part.id} className={idx < selectedParts.length - 1 ? "border-b" : ""}>
                          <td className="py-3 px-4">{part.name}</td>
                          <td className="py-3 px-4 text-center">
                            <Input 
                              type="number" 
                              value={part.quantity}
                              min={1}
                              className="w-16 text-center mx-auto"
                              onChange={e => updatePartQuantity(part.id, parseInt(e.target.value))}
                            />
                          </td>
                          <td className="py-3 px-4 text-right">R$ {part.price.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">R$ {(part.price * part.quantity).toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removePart(part.id)}
                            >
                              <TrashIcon size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 px-4 text-center text-muted-foreground">
                          Nenhuma peça adicionada
                        </td>
                      </tr>
                    )}
                    
                    <tr className="border-t">
                      <td colSpan={3} className="py-3 px-4 font-medium text-right">Total de Peças:</td>
                      <td className="py-3 px-4 text-right">
                        <Input 
                          type="number" 
                          value={manualPartsTotal !== null ? manualPartsTotal : calculateTotalParts()}
                          className="w-24 text-right"
                          onChange={e => {
                            const value = parseFloat(e.target.value);
                            setManualPartsTotal(isNaN(value) ? null : value);
                          }}
                        />
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="py-3 px-4 font-medium text-right">Mão de Obra:</td>
                      <td className="py-3 px-4 text-right">
                        <Input 
                          type="number" 
                          value={laborCost}
                          className="w-24 text-right"
                          onChange={e => setLaborCost(parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td></td>
                    </tr>
                    <tr className="bg-muted/60">
                      <td colSpan={3} className="py-3 px-4 font-bold text-right">Valor Total:</td>
                      <td className="py-3 px-4 text-right font-bold text-primary">R$ {calculateTotal().toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea 
                id="notes" 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Informações adicionais sobre o serviço, condições do dispositivo, solicitações do cliente, etc."
                className="min-h-32"
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Serviço</Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </MainLayout>
  );
};

export default NewService;
