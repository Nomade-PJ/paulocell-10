import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  SearchIcon, 
  PlusIcon, 
  FilterIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XCircleIcon,
  XIcon,
  SmartphoneIcon,
  TagIcon,
  UserIcon,
  RefreshCcwIcon
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import DeviceCard from '@/components/ui/DeviceCard';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DeviceAPI } from '@/lib/api-service';
import { useConnection } from '@/lib/ConnectionContext';
import { Input } from '@/components/ui/input';

const Devices: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const { isApiConnected } = useConnection();
  
  useEffect(() => {
    loadDevices();
    
    // Adicionar listener para eventos de atualização de dados
    const handleDataUpdated = () => {
      loadDevices();
    };
    
    window.addEventListener('pauloCell_dataUpdated', handleDataUpdated);
    
    return () => {
      window.removeEventListener('pauloCell_dataUpdated', handleDataUpdated);
    };
  }, []);
  
  const loadDevices = async () => {
    setIsLoading(true);
    try {
      const devicesData = await DeviceAPI.getAll();
      setDevices(devicesData);
      setFilteredDevices(devicesData);
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error);
      toast.error('Erro ao carregar dispositivos do servidor. Por favor, verifique sua conexão.');
      setDevices([]);
      setFilteredDevices([]);
    } finally {
      setIsLoading(false);
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
    setStatusFilter('all');
    setSearchTerm('');
  };
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDevices(devices);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = devices.filter(
        device => 
          device.brand?.toLowerCase().includes(term) || 
          device.model?.toLowerCase().includes(term) ||
          device.serialNumber?.toLowerCase().includes(term) ||
          device.imei?.toLowerCase().includes(term)
      );
      setFilteredDevices(filtered);
    }
  }, [searchTerm, devices]);
  
  const handleDeviceClick = (deviceId: string) => {
    navigate(`/devices/${deviceId}`);
  };
  
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };
  
  const handleRefresh = async () => {
    await loadDevices();
    toast.success('Lista de dispositivos atualizada');
  };
  
  const handleAddDevice = () => {
    navigate('/devices/new');
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
            <h1 className="text-2xl font-bold">Dispositivos</h1>
            <p className="text-muted-foreground">Gerencie dispositivos de seus clientes</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={handleRefresh}
              disabled={isLoading || !isApiConnected}
            >
              <RefreshCcwIcon size={16} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{isLoading ? 'Carregando...' : 'Atualizar'}</span>
            </Button>
            <Button className="gap-2" onClick={handleAddDevice} disabled={!isApiConnected}>
              <PlusIcon size={16} />
              <span>Novo Dispositivo</span>
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar dispositivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {!isApiConnected && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-md">
            <p className="text-amber-800 text-sm">
              Você está offline. As operações que exigem conexão com o servidor estão desabilitadas.
            </p>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {filteredDevices.length === 0 ? (
              <div className="text-center py-12 bg-muted/40 rounded-lg">
                <p className="text-muted-foreground">Nenhum dispositivo encontrado.</p>
                <Button className="mt-4" onClick={handleAddDevice} disabled={!isApiConnected}>
                  Adicionar Dispositivo
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDevices.map((device, index) => (
                  <div key={device.id} onClick={() => handleDeviceClick(device.id)} className="cursor-pointer">
                    <DeviceCard 
                      device={device} 
                      index={index}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
    </MainLayout>
  );
};

export default Devices;
