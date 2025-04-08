import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  SearchIcon, 
  PlusIcon, 
  FilterIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  XIcon,
  TrashIcon,
  PencilIcon,
  RefreshCwIcon
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { InventoryAPI } from '@/lib/api-service';
import { useConnection } from '@/lib/ConnectionContext';

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isApiConnected } = useConnection();
  
  // Modal states
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    sku: '',
    category: '',
    compatibility: '',
    price: '',
    currentStock: '',
    minimumStock: '',
    lastPurchase: new Date().toLocaleDateString('pt-BR')
  });
  
  // Carregar itens do inventário da API quando o componente é montado
  useEffect(() => {
    loadInventoryItems();

    // Adicionar listener para eventos de atualização de dados
    const handleDataUpdated = () => {
      loadInventoryItems();
    };
    
    window.addEventListener('pauloCell_dataUpdated', handleDataUpdated);
    
    return () => {
      window.removeEventListener('pauloCell_dataUpdated', handleDataUpdated);
    };
  }, []);

  const loadInventoryItems = async () => {
    setLoading(true);
    try {
      const items = await InventoryAPI.getAll();
      setInventoryItems(items);
    } catch (error) {
      console.error('Erro ao carregar itens do inventário:', error);
      toast.error('Não foi possível carregar os itens do inventário');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterToggle = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };
  
  const clearFilters = () => {
    setActiveFilters([]);
    setStockFilter('all');
    setSearchTerm('');
  };
  
  const handleStockFilterChange = (filter: string) => {
    setStockFilter(filter);
  };
  
  const applyFilters = () => {
    let filtered = [...inventoryItems];
    
    // Apply search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(search) || 
        item.sku.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search) ||
        item.compatibility.toLowerCase().includes(search)
      );
    }
    
    // Apply stock filter
    if (stockFilter !== 'all') {
      filtered = filtered.filter(item => {
        const stock = Number(item.currentStock);
        const minStock = Number(item.minimumStock);
        
        switch (stockFilter) {
          case 'low':
            return stock <= minStock && stock > 0;
          case 'out':
            return stock === 0;
          case 'ok':
            return stock > minStock;
          default:
            return true;
        }
      });
    }
    
    // Apply category filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(item => {
        const category = item.category.toLowerCase();
        return activeFilters.some(filter => category.includes(filter.toLowerCase()));
      });
    }
    
    return filtered;
  };
  
  const filteredItems = applyFilters();
  
  // Handlers for new item dialog
  const handleNewItemSubmit = async () => {
    try {
      // Validar dados
      if (!formData.name || !formData.category) {
        toast.error('Preencha os campos obrigatórios: Nome e Categoria');
        return;
      }
      
      // Preparar dados para API
      const itemData = {
        name: formData.name,
        sku: formData.sku || `SKU-${Date.now()}`,
        category: formData.category,
        compatibility: formData.compatibility,
        price: formData.price ? parseFloat(formData.price) : 0,
        currentStock: formData.currentStock ? parseInt(formData.currentStock) : 0,
        minimumStock: formData.minimumStock ? parseInt(formData.minimumStock) : 0,
        lastPurchase: formData.lastPurchase || new Date().toLocaleDateString('pt-BR'),
        createdAt: new Date().toISOString()
      };
      
      // Salvar na API
      await InventoryAPI.create(itemData);
      
      toast.success('Item adicionado com sucesso!');
      setIsNewItemDialogOpen(false);
      resetForm();
      loadInventoryItems(); // Recarregar lista com novo item
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast.error('Erro ao adicionar item ao inventário');
    }
  };
  
  // Handlers for edit dialog
  const handleEditClick = (item: any) => {
    setSelectedItem(item);
    setFormData({
      id: item.id,
      name: item.name || '',
      sku: item.sku || '',
      category: item.category || '',
      compatibility: item.compatibility || '',
      price: item.price ? String(item.price) : '',
      currentStock: item.currentStock ? String(item.currentStock) : '',
      minimumStock: item.minimumStock ? String(item.minimumStock) : '',
      lastPurchase: item.lastPurchase || new Date().toLocaleDateString('pt-BR')
    });
    setIsEditDialogOpen(true);
  };
  
  const handleEditSubmit = async () => {
    try {
      // Validar dados
      if (!formData.name || !formData.category) {
        toast.error('Preencha os campos obrigatórios: Nome e Categoria');
        return;
      }
      
      // Preparar dados para API
      const updatedItemData = {
        id: formData.id,
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        compatibility: formData.compatibility,
        price: formData.price ? parseFloat(formData.price) : 0,
        currentStock: formData.currentStock ? parseInt(formData.currentStock) : 0,
        minimumStock: formData.minimumStock ? parseInt(formData.minimumStock) : 0,
        lastPurchase: formData.lastPurchase,
        updatedAt: new Date().toISOString()
      };
      
      // Atualizar na API
      await InventoryAPI.update(formData.id, updatedItemData);
      
      toast.success('Item atualizado com sucesso!');
      setIsEditDialogOpen(false);
      resetForm();
      loadInventoryItems(); // Recarregar lista com item atualizado
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast.error('Erro ao atualizar item do inventário');
    }
  };
  
  // Handlers for delete dialog
  const handleDeleteClick = (item: any) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      if (!selectedItem) return;
      
      // Excluir da API
      await InventoryAPI.delete(selectedItem.id);
      
      toast.success('Item excluído com sucesso!');
      setIsDeleteDialogOpen(false);
      loadInventoryItems(); // Recarregar lista sem o item excluído
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir item do inventário');
    }
  };
  
  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      sku: '',
      category: '',
      compatibility: '',
      price: '',
      currentStock: '',
      minimumStock: '',
      lastPurchase: new Date().toLocaleDateString('pt-BR')
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const getStockStatusColor = (item: any) => {
    const stock = Number(item.currentStock || 0);
    const minStock = Number(item.minimumStock || 0);
    
    if (stock === 0) return 'text-red-500';
    if (stock <= minStock) return 'text-amber-500';
    return 'text-green-500';
  };
  
  return (
    <MainLayout>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inventário</h1>
            <p className="text-muted-foreground">Gerencie peças e acessórios</p>
          </div>
          <Dialog open={isNewItemDialogOpen} onOpenChange={setIsNewItemDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusIcon size={16} />
                <span>Adicionar Item</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Item ao Inventário</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do novo item para adicioná-lo ao inventário.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Nome *</label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ex: Tela iPhone 13"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="sku" className="text-sm font-medium">SKU</label>
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="Auto-gerado se vazio"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Categoria *</label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="Ex: Tela, Bateria, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="compatibility" className="text-sm font-medium">Compatibilidade</label>
                    <Input
                      id="compatibility"
                      name="compatibility"
                      value={formData.compatibility}
                      onChange={handleInputChange}
                      placeholder="Ex: iPhone 13, Samsung S22"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="price" className="text-sm font-medium">Preço (R$)</label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="currentStock" className="text-sm font-medium">Estoque Atual</label>
                    <Input
                      id="currentStock"
                      name="currentStock"
                      type="number"
                      value={formData.currentStock}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="minimumStock" className="text-sm font-medium">Estoque Mínimo</label>
                    <Input
                      id="minimumStock"
                      name="minimumStock"
                      type="number"
                      value={formData.minimumStock}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewItemDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleNewItemSubmit}>Adicionar Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-auto">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar itens..."
              className="pl-8 w-full sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={loadInventoryItems}
            >
              <RefreshCwIcon size={14} />
              <span>Atualizar</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <FilterIcon size={14} />
                  <span>Estoque</span>
                  <ChevronDownIcon size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStockFilterChange('all')}>
                  <div className="flex items-center gap-2">
                    <span>Todos</span>
                    {stockFilter === 'all' && <CheckCircleIcon size={14} className="ml-2" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStockFilterChange('ok')}>
                  <div className="flex items-center gap-2">
                    <span>Estoque normal</span>
                    {stockFilter === 'ok' && <CheckCircleIcon size={14} className="ml-2" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStockFilterChange('low')}>
                  <div className="flex items-center gap-2">
                    <span>Estoque baixo</span>
                    {stockFilter === 'low' && <CheckCircleIcon size={14} className="ml-2" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStockFilterChange('out')}>
                  <div className="flex items-center gap-2">
                    <span>Sem estoque</span>
                    {stockFilter === 'out' && <CheckCircleIcon size={14} className="ml-2" />}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <FilterIcon size={14} />
                  <span>Categoria</span>
                  <ChevronDownIcon size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleFilterToggle('tela')}>
                  <div className="flex items-center gap-2">
                    <span>Tela</span>
                    {activeFilters.includes('tela') && <CheckCircleIcon size={14} className="ml-2" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterToggle('bateria')}>
                  <div className="flex items-center gap-2">
                    <span>Bateria</span>
                    {activeFilters.includes('bateria') && <CheckCircleIcon size={14} className="ml-2" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterToggle('conector')}>
                  <div className="flex items-center gap-2">
                    <span>Conector</span>
                    {activeFilters.includes('conector') && <CheckCircleIcon size={14} className="ml-2" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterToggle('placa')}>
                  <div className="flex items-center gap-2">
                    <span>Placa</span>
                    {activeFilters.includes('placa') && <CheckCircleIcon size={14} className="ml-2" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterToggle('acessorio')}>
                  <div className="flex items-center gap-2">
                    <span>Acessório</span>
                    {activeFilters.includes('acessorio') && <CheckCircleIcon size={14} className="ml-2" />}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {(activeFilters.length > 0 || stockFilter !== 'all') && (
          <div className="flex flex-wrap gap-2 mb-2">
            {stockFilter !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1 pl-2">
                {stockFilter === 'low' ? 'Estoque baixo' : 
                 stockFilter === 'out' ? 'Sem estoque' : 'Estoque normal'}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 hover:bg-transparent"
                  onClick={() => setStockFilter('all')}
                >
                  <XIcon size={12} />
                </Button>
              </Badge>
            )}
            
            {activeFilters.map(filter => (
              <Badge key={filter} variant="outline" className="flex items-center gap-1 pl-2">
                Categoria: {filter}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 hover:bg-transparent"
                  onClick={() => handleFilterToggle(filter)}
                >
                  <XIcon size={12} />
                </Button>
              </Badge>
            ))}
            
            {(activeFilters.length > 0 || stockFilter !== 'all') && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2">
                Limpar filtros
              </Button>
            )}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {filteredItems.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Compatibilidade</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead className="text-right">Estoque</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.compatibility}</TableCell>
                        <TableCell className="text-right">R$ {parseFloat(item.price).toFixed(2).replace('.', ',')}</TableCell>
                        <TableCell className="text-right">
                          <span className={getStockStatusColor(item)}>
                            {item.currentStock || 0}
                          </span> / {item.minimumStock || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditClick(item)}
                            >
                              <PencilIcon size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteClick(item)}
                              className="text-destructive"
                            >
                              <TrashIcon size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground mb-4">Nenhum item encontrado no inventário</p>
                <Button onClick={() => setIsNewItemDialogOpen(true)}>Adicionar Item</Button>
              </div>
            )}
          </>
        )}
        
        {!isApiConnected && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">
              Você está offline. Algumas funcionalidades podem estar limitadas.
            </p>
          </div>
        )}
      </motion.div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
            <DialogDescription>
              Atualize as informações do item selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">Nome *</label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-sku" className="text-sm font-medium">SKU</label>
                <Input
                  id="edit-sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-category" className="text-sm font-medium">Categoria *</label>
                <Input
                  id="edit-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-compatibility" className="text-sm font-medium">Compatibilidade</label>
                <Input
                  id="edit-compatibility"
                  name="compatibility"
                  value={formData.compatibility}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-price" className="text-sm font-medium">Preço (R$)</label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-currentStock" className="text-sm font-medium">Estoque Atual</label>
                <Input
                  id="edit-currentStock"
                  name="currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-minimumStock" className="text-sm font-medium">Estoque Mínimo</label>
                <Input
                  id="edit-minimumStock"
                  name="minimumStock"
                  type="number"
                  value={formData.minimumStock}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditSubmit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o item
              "{selectedItem?.name}" do seu inventário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Inventory;
