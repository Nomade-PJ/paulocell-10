import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  SearchIcon, 
  RefreshCcwIcon,
  TrashIcon,
  RotateCcwIcon,
  ArrowLeftIcon,
  WifiOffIcon
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { 
  getAllTrashItems,
  restoreFromTrash,
  deletePermanently
} from "@/lib/trash-utils";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Interface para os itens da lixeira
interface TrashItem {
  id: string;
  name: string;
  type: string;
  deletedAt: string;
  data: any;
}

const TrashBin: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [itemToDelete, setItemToDelete] = useState<TrashItem | null>(null);
  const [currentTab, setCurrentTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();
  
  // Monitorar o status online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Carregar itens da lixeira ao montar o componente
  useEffect(() => {
    loadTrashItems();
  }, []);

  const loadTrashItems = async () => {
    try {
      setLoading(true);
      const items = await getAllTrashItems();
      setTrashItems(items);
    } catch (error) {
      console.error('Erro ao carregar itens da lixeira:', error);
      toast.error('Erro ao carregar itens da lixeira');
      setTrashItems([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRestore = async (item: TrashItem) => {
    try {
      const success = await restoreFromTrash(item);
      if (success) {
        await loadTrashItems(); // Atualizar a lista
        toast.success(`${getItemTypeLabel(item.type)} restaurado com sucesso`);
      } else {
        toast.error(`Erro ao restaurar ${getItemTypeLabel(item.type).toLowerCase()}`);
      }
    } catch (error) {
      console.error('Erro ao restaurar item:', error);
      toast.error(`Erro ao restaurar ${getItemTypeLabel(item.type).toLowerCase()}`);
    }
  };
  
  const handlePermanentDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const success = await deletePermanently(itemToDelete);
      if (success) {
        await loadTrashItems(); // Atualizar a lista
        toast.success(`${getItemTypeLabel(itemToDelete.type)} excluído permanentemente`);
      } else {
        toast.error(`Erro ao excluir ${getItemTypeLabel(itemToDelete.type).toLowerCase()} permanentemente`);
      }
    } catch (error) {
      console.error('Erro ao excluir permanentemente:', error);
      toast.error(`Erro ao excluir ${getItemTypeLabel(itemToDelete.type).toLowerCase()} permanentemente`);
    } finally {
      setItemToDelete(null); // Fechar o diálogo
    }
  };

  const handleRefresh = () => {
    loadTrashItems();
    toast.success('Lista de itens da lixeira atualizada!');
  };
  
  // Formatar data para exibição
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return 'N/A';
    }
  };
  
  // Calcular e formatar data de expiração (60 dias após a exclusão)
  const formatExpirationDate = (deletedAtString?: string) => {
    if (!deletedAtString) return 'N/A';
    try {
      const deletedAt = new Date(deletedAtString);
      const expirationDate = new Date(deletedAt.getTime() + (60 * 24 * 60 * 60 * 1000)); // 60 dias em milissegundos
      return expirationDate.toLocaleDateString('pt-BR');
    } catch (e) {
      return 'N/A';
    }
  };
  
  // Obter label do tipo de item
  const getItemTypeLabel = (type: string): string => {
    switch (type) {
      case 'customer': return 'Cliente';
      case 'device': return 'Dispositivo';
      case 'service': return 'Serviço';
      case 'document': return 'Documento';
      default: return 'Item';
    }
  };
  
  // Obter cor do badge para o tipo de item
  const getItemTypeBadgeColor = (type: string): string => {
    switch (type) {
      case 'customer': return 'bg-blue-100 text-blue-800';
      case 'device': return 'bg-green-100 text-green-800';
      case 'service': return 'bg-purple-100 text-purple-800';
      case 'document': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Filtrar itens com base no termo de pesquisa e na aba atual
  const filteredItems = trashItems.filter(item => {
    // Filtrar por termo de pesquisa
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.data.email && item.data.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.data.phone && item.data.phone.includes(searchTerm));
    
    // Filtrar por tipo (aba)
    const matchesType = currentTab === 'all' || item.type === currentTab;
    
    return matchesSearch && matchesType;
  });
  
  // Contagem de itens por tipo
  const getItemCountByType = (type: string): number => {
    return trashItems.filter(item => type === 'all' || item.type === type).length;
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Lixeira</h1>
            <p className="text-muted-foreground">Itens excluídos temporariamente (serão removidos após 60 dias)</p>
          </div>
          {!isOnline && (
            <Badge variant="outline" className="gap-1 ml-auto">
              <WifiOffIcon size={12} />
              <span>Offline</span>
            </Badge>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-[280px]">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar Item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          
          <Button variant="outline" className="gap-2" onClick={handleRefresh}>
            <RefreshCcwIcon size={16} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
        
        <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="relative">
              Todos
              <Badge variant="secondary" className="ml-1 text-xs">{getItemCountByType('all')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="customer" className="relative">
              Clientes
              <Badge variant="secondary" className="ml-1 text-xs">{getItemCountByType('customer')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="device" className="relative">
              Dispositivos
              <Badge variant="secondary" className="ml-1 text-xs">{getItemCountByType('device')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="service" className="relative">
              Serviços
              <Badge variant="secondary" className="ml-1 text-xs">{getItemCountByType('service')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="document" className="relative">
              Documentos
              <Badge variant="secondary" className="ml-1 text-xs">{getItemCountByType('document')}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={currentTab} className="mt-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Skeleton className="h-5 w-32 rounded-full" />
                      <Skeleton className="h-5 w-32 rounded-full" />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item, idx) => (
                  <motion.div 
                    key={`${item.type}-${item.id}`}
                    className="bg-card rounded-xl border border-border p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                          {item.data.avatar ? (
                            <img src={item.data.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            item.name?.slice(0, 2).toUpperCase() || '??'
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-medium">{item.name || 'Item sem nome'}</h3>
                          <div className="flex flex-col gap-1 mt-1">
                            {item.data.phone && (
                              <div className="text-sm text-muted-foreground">
                                {item.data.phone}
                              </div>
                            )}
                            {item.data.email && (
                              <div className="text-sm text-muted-foreground">
                                {item.data.email}
                              </div>
                            )}
                            <Badge variant="outline" className={getItemTypeBadgeColor(item.type)}>
                              {getItemTypeLabel(item.type)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-3 text-xs">
                      <div className="px-2.5 py-1 rounded-full bg-muted">
                        Excluído em: <span className="font-medium">{formatDate(item.deletedAt)}</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-full bg-red-100 text-red-800">
                        Exclusão automática em: <span className="font-medium">{formatExpirationDate(item.deletedAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1 flex-1"
                        onClick={() => handleRestore(item)}
                      >
                        <RotateCcwIcon size={14} />
                        <span>Restaurar</span>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="gap-1 flex-1"
                        onClick={() => setItemToDelete(item)}
                      >
                        <TrashIcon size={14} />
                        <span>Excluir</span>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center h-60 bg-muted/50 rounded-lg">
                <TrashIcon size={24} className="text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-4">Nenhum item na lixeira</p>
                <Button onClick={() => navigate(-1)}>Voltar</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
      
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. {itemToDelete ? getItemTypeLabel(itemToDelete.type) : 'O item'} será excluído permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handlePermanentDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default TrashBin;