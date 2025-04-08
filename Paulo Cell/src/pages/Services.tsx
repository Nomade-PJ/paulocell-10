import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  SearchIcon, 
  PlusIcon, 
  FilterIcon,
  ChevronDownIcon,
  ClockIcon,
  ActivityIcon,
  CheckCircleIcon,
  PackageIcon,
  XIcon,
  CalendarIcon,
  TagIcon,
  UserIcon,
  RefreshCwIcon
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import ServiceCard from '@/components/ui/ServiceCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { exportToPDF, exportToExcel, exportToCSV } from "@/lib/export-utils";
import { ServiceAPI } from '@/lib/api-service';
import { useConnection } from '@/lib/ConnectionContext';

const Services: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { isApiConnected } = useConnection();

  useEffect(() => {
    fetchServices();

    // Adicionar listener para eventos de atualização de dados
    const handleDataUpdated = () => {
      fetchServices();
    };
    
    window.addEventListener('pauloCell_dataUpdated', handleDataUpdated);
    
    return () => {
      window.removeEventListener('pauloCell_dataUpdated', handleDataUpdated);
    };
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const servicesData = await ServiceAPI.getAll();
      setServices(servicesData);
      applyFilters(servicesData, searchTerm, statusFilter, typeFilter);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      toast.error('Não foi possível carregar os serviços');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters(services, searchTerm, statusFilter, typeFilter);
  }, [searchTerm, statusFilter, typeFilter, services]);

  const applyFilters = (
    servicesList: any[], 
    search: string, 
    status: string | null, 
    type: string | null
  ) => {
    let filtered = [...servicesList];

    // Filtrar por termo de busca
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(service => 
        (service.description && service.description.toLowerCase().includes(searchLower)) ||
        (service.device && service.device.toLowerCase().includes(searchLower)) ||
        (service.customer && service.customer.toLowerCase().includes(searchLower)) ||
        (service.technician && service.technician.toLowerCase().includes(searchLower))
      );
    }

    // Filtrar por status
    if (status) {
      filtered = filtered.filter(service => service.status === status);
    }

    // Filtrar por tipo
    if (type) {
      filtered = filtered.filter(service => service.type === type);
    }

    setFilteredServices(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (status: string | null) => {
    setStatusFilter(status === statusFilter ? null : status);
  };

  const handleTypeFilterChange = (type: string | null) => {
    setTypeFilter(type === typeFilter ? null : type);
  };

  const handleServiceClick = (id: string) => {
    navigate(`/services/${id}`);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'Aguardando';
      case 'in_progress':
        return 'Em Andamento';
      case 'completed':
        return 'Concluído';
      case 'delivered':
        return 'Entregue';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <ActivityIcon className="h-4 w-4 text-amber-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'delivered':
        return <PackageIcon className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // Preparar dados para exportação
    const exportData = filteredServices.map(service => ({
      ID: service.id,
      Descrição: service.description,
      Status: getStatusLabel(service.status),
      Cliente: service.customer || 'Não especificado',
      Dispositivo: service.device || 'Não especificado',
      'Data Criação': service.created_at ? new Date(service.created_at).toLocaleDateString('pt-BR') : 'N/A',
      'Data Agendada': service.scheduled_date ? new Date(service.scheduled_date).toLocaleDateString('pt-BR') : 'N/A',
      Preço: `R$ ${service.price ? parseFloat(service.price).toFixed(2) : '0.00'}`,
      Técnico: service.technician || 'Não atribuído'
    }));

    const filename = `servicos_${new Date().toISOString().slice(0, 10)}`;

    try {
      switch (format) {
        case 'pdf':
          exportToPDF(exportData, filename);
          break;
        case 'excel':
          exportToExcel(exportData, filename);
          break;
        case 'csv':
          exportToCSV(exportData, filename);
          break;
      }
      toast.success(`Exportação para ${format.toUpperCase()} concluída com sucesso`);
    } catch (error) {
      console.error(`Erro ao exportar para ${format}:`, error);
      toast.error(`Erro ao exportar para ${format}`);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Serviços</h1>
            <p className="text-muted-foreground">Gerencie os serviços da sua assistência</p>
          </div>
          <Button className="gap-2" onClick={() => navigate('/services/new')}>
            <PlusIcon size={16} />
            <span>Novo Serviço</span>
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-auto">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar serviços..."
              className="pl-8 w-full sm:w-[300px]"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1"
              onClick={() => fetchServices()}
            >
              <RefreshCwIcon size={14} />
              <span>Atualizar</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <FilterIcon size={14} />
                  <span>Status</span>
                  <ChevronDownIcon size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => handleStatusFilterChange('waiting')}>
                    <div className="flex items-center gap-2">
                      <ClockIcon size={14} className="text-blue-500" />
                      <span>Aguardando</span>
                      {statusFilter === 'waiting' && <CheckCircleIcon size={14} className="ml-2" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilterChange('in_progress')}>
                    <div className="flex items-center gap-2">
                      <ActivityIcon size={14} className="text-amber-500" />
                      <span>Em Andamento</span>
                      {statusFilter === 'in_progress' && <CheckCircleIcon size={14} className="ml-2" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusFilterChange('completed')}>
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon size={14} className="text-green-500" />
                      <span>Concluído</span>
                      {statusFilter === 'completed' && <CheckCircleIcon size={14} className="ml-2" />}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <TagIcon size={14} />
                  <span>Tipo</span>
                  <ChevronDownIcon size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => handleTypeFilterChange('repair')}>
                    <div className="flex items-center gap-2">
                      <span>Reparo</span>
                      {typeFilter === 'repair' && <CheckCircleIcon size={14} className="ml-2" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTypeFilterChange('maintenance')}>
                    <div className="flex items-center gap-2">
                      <span>Manutenção</span>
                      {typeFilter === 'maintenance' && <CheckCircleIcon size={14} className="ml-2" />}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTypeFilterChange('installation')}>
                    <div className="flex items-center gap-2">
                      <span>Instalação</span>
                      {typeFilter === 'installation' && <CheckCircleIcon size={14} className="ml-2" />}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <CalendarIcon size={14} />
                  <span>Exportar</span>
                  <ChevronDownIcon size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    <div className="flex items-center gap-2">
                      <span>Exportar como PDF</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('excel')}>
                    <div className="flex items-center gap-2">
                      <span>Exportar como Excel</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <div className="flex items-center gap-2">
                      <span>Exportar como CSV</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {statusFilter && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtros:</span>
            <Badge variant="outline" className="flex items-center gap-1 pl-2">
              Status: {getStatusLabel(statusFilter)}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => setStatusFilter(null)}
              >
                <XIcon size={12} />
              </Button>
            </Badge>
          </div>
        )}

        {typeFilter && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtros:</span>
            <Badge variant="outline" className="flex items-center gap-1 pl-2">
              Tipo: {typeFilter}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => setTypeFilter(null)}
              >
                <XIcon size={12} />
              </Button>
            </Badge>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.length > 0 ? (
              filteredServices.map((service, idx) => (
                <div key={service.id} onClick={() => handleServiceClick(service.id)} className="cursor-pointer">
                  <ServiceCard service={service} index={idx} />
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center h-60 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground mb-4">Nenhum serviço encontrado com os filtros atuais</p>
                <Button onClick={() => {
                  setSearchTerm('');
                  setStatusFilter(null);
                  setTypeFilter(null);
                }}>Limpar Filtros</Button>
              </div>
            )}
          </div>
        )}
        
        {!isApiConnected && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">
              Você está offline. Algumas funcionalidades podem estar limitadas.
            </p>
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
};

export default Services;
