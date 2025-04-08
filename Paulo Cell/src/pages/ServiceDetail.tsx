import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeftIcon, 
  PenIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  AlertCircleIcon, 
  XCircleIcon,
  ClockIcon,
  RefreshCcwIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ServiceAPI, DeviceAPI, CustomerAPI } from '@/lib/api-service';
import { useConnection } from '@/lib/ConnectionContext';
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

// Função para renderizar o badge de status
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-500/90">
          Concluído
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-500/90">
          Em Andamento
        </Badge>
      );
    case 'waiting':
      return (
        <Badge variant="outline" className="bg-yellow-500 hover:bg-yellow-500/90">
          Aguardando
        </Badge>
      );
    case 'canceled':
      return (
        <Badge variant="destructive">
          Cancelado
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {status}
        </Badge>
      );
  }
};

const formatDate = (dateString: string | number | Date | null | undefined) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? String(dateString)
      : date.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return String(dateString);
  }
};

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const { isApiConnected } = useConnection();

  useEffect(() => {
    // Carregar dados do serviço
    loadServiceData();
    
    // Adicionar listener para eventos de atualização de dados
    const handleDataUpdated = () => {
      loadServiceData();
    };
    
    window.addEventListener('pauloCell_dataUpdated', handleDataUpdated);
    
    return () => {
      window.removeEventListener('pauloCell_dataUpdated', handleDataUpdated);
    };
  }, [id]);
  
  const loadServiceData = async () => {
    setLoading(true);
    try {
      // Carregar serviço da API
      const foundService = await ServiceAPI.getById(id!);
      
      if (foundService) {
        setService(foundService);
        
        // Carregar dados do cliente
        if (foundService.customer_id) {
          try {
            const customerData = await CustomerAPI.getById(foundService.customer_id);
            setCustomer(customerData);
          } catch (error) {
            console.error('Erro ao carregar dados do cliente:', error);
          }
        }
        
        // Carregar dados do dispositivo
        if (foundService.device_id) {
          try {
            const deviceData = await DeviceAPI.getById(foundService.device_id);
            setDevice(deviceData);
          } catch (error) {
            console.error('Erro ao carregar dados do dispositivo:', error);
          }
        }
      } else {
        toast.error("Serviço não encontrado.");
      }
    } catch (error) {
      console.error('Erro ao carregar dados do serviço:', error);
      toast.error("Ocorreu um erro ao carregar os dados do serviço.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    setIsConfirmDeleteOpen(false);
    
    try {
      await ServiceAPI.delete(id!);
      toast.success("Serviço excluído com sucesso.");
      navigate('/services');
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      toast.error("Ocorreu um erro ao excluir o serviço.");
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
  
  if (!service) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <h2 className="text-2xl font-bold mb-4">Serviço não encontrado</h2>
          <Button onClick={() => navigate('/services')}>Voltar para Serviços</Button>
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
            onClick={() => navigate('/services')}
            className="h-8 w-8"
          >
            <ArrowLeftIcon size={16} />
          </Button>
          <h1 className="text-2xl font-bold">Detalhes do Serviço</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{service.description}</h2>
                  {getStatusBadge(service.status)}
                </div>
                <p className="text-muted-foreground">
                  {device ? `${device.brand} ${device.model}` : 'Dispositivo não especificado'}
                  {customer ? ` - ${customer.name}` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigate(`/services/edit/${service.id}`)}
                >
                  <PenIcon size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                >
                  <TrashIcon size={16} />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Cliente</h3>
                {customer ? (
                  <p className="font-medium cursor-pointer hover:text-primary transition-colors" 
                     onClick={() => navigate(`/customers/${customer.id}`)}>
                    {customer.name}
                  </p>
                ) : (
                  <p className="font-medium">
                    {service.customer || 'Não especificado'}
                  </p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Dispositivo</h3>
                {device ? (
                  <p className="font-medium cursor-pointer hover:text-primary transition-colors"
                     onClick={() => navigate(`/devices/${device.id}`)}>
                    {device.brand} {device.model}
                  </p>
                ) : (
                  <p className="font-medium">
                    {service.device || 'Não especificado'}
                  </p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Técnico</h3>
                <p className="font-medium">{service.technician || "Não atribuído"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de Criação</h3>
                <p className="font-medium">{formatDate(service.created_at || service.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Data Agendada</h3>
                <p className="font-medium">{formatDate(service.scheduled_date) || 'Não agendado'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de Conclusão</h3>
                <p className="font-medium">{formatDate(service.finish_date) || "Não concluído"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Custo</h3>
                <p className="font-medium">
                  R$ {service.cost ? parseFloat(service.cost).toFixed(2).replace('.', ',') : '0,00'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Preço</h3>
                <p className="font-medium">
                  R$ {service.price ? parseFloat(service.price).toFixed(2).replace('.', ',') : '0,00'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Garantia</h3>
                <p className="font-medium">
                  {service.warranty_days 
                    ? `${service.warranty_days} ${parseInt(service.warranty_days) === 1 ? 'dia' : 'dias'}` 
                    : "Sem garantia"}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Diagnóstico</h3>
              <p>{service.diagnosis || 'Nenhum diagnóstico registrado'}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Solução</h3>
              <p>{service.solution || 'Nenhuma solução registrada'}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Observações</h3>
              <p>{service.notes || 'Sem observações'}</p>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={() => navigate(`/services/edit/${service.id}`)} className="gap-2">
                <PenIcon size={16} />
                <span>Editar Serviço</span>
              </Button>
            </div>
          </Card>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Peças Utilizadas</h3>
              
              {service.parts_used && service.parts_used.length > 0 ? (
                <div className="space-y-2">
                  {Array.isArray(service.parts_used) 
                    ? service.parts_used.map((part: any, index: number) => (
                        <div key={index} className="flex justify-between p-2 border-b">
                          <span>{part.name}</span>
                          <span>R$ {parseFloat(part.price).toFixed(2).replace('.', ',')}</span>
                        </div>
                      ))
                    : (
                        <p className="text-muted-foreground">Erro ao carregar peças utilizadas</p>
                      )
                  }
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma peça utilizada</p>
              )}
            </Card>
          </div>
        </div>
        
        {!isApiConnected && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">
              Você está offline. Algumas funcionalidades podem estar limitadas.
            </p>
          </div>
        )}
      </motion.div>
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá excluir permanentemente o serviço e não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default ServiceDetail;
