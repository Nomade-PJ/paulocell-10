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
  CalendarIcon,
  UserIcon,
  DollarSignIcon,
  PencilIcon,
  RefreshCcwIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import PatternLock from '@/components/PatternLock';
import PatternLockDisplay from '@/components/PatternLockDisplay';
import { DeviceAPI, CustomerAPI, ServiceAPI } from '@/lib/api-service';
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

const DeviceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const { isApiConnected } = useConnection();
  
  useEffect(() => {
    // Carregar dados do dispositivo e informações relacionadas
    loadDeviceData();
    
    // Adicionar listener para eventos de atualização de dados
    const handleDataUpdated = () => {
      loadDeviceData();
    };
    
    window.addEventListener('pauloCell_dataUpdated', handleDataUpdated);
    
    return () => {
      window.removeEventListener('pauloCell_dataUpdated', handleDataUpdated);
    };
  }, [id]);
  
  const loadDeviceData = async () => {
    setLoading(true);
    try {
      // Carregar dispositivo da API
      let foundDevice = null;
      
      try {
        foundDevice = await DeviceAPI.getById(id!);
        setDevice(foundDevice);
        
        // Carregar cliente proprietário se existir
        if (foundDevice.owner) {
          try {
            const foundCustomer = await CustomerAPI.getById(foundDevice.owner);
            setCustomer(foundCustomer);
          } catch (customerError) {
            console.error('Erro ao carregar dados do cliente:', customerError);
          }
        }
        
        // Carregar histórico de serviços para este dispositivo
        try {
          const deviceServices = await ServiceAPI.getByDevice(id!);
          setServiceHistory(deviceServices);
        } catch (servicesError) {
          console.error('Erro ao carregar histórico de serviços:', servicesError);
          setServiceHistory([]);
        }
      } catch (deviceError) {
        console.error('Erro ao carregar dados do dispositivo:', deviceError);
        toast.error('Erro ao carregar dados do dispositivo');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do dispositivo');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    setIsConfirmDeleteOpen(false);
    
    try {
      // Excluir dispositivo usando a API
      await DeviceAPI.delete(id!);
      toast.success('Dispositivo excluído com sucesso');
      navigate('/devices');
    } catch (error) {
      console.error('Erro ao excluir dispositivo:', error);
      toast.error('Erro ao excluir dispositivo');
    }
  };
  
  const handleNewService = () => {
    navigate('/services/new', { state: { deviceId: device.id, customerId: device.owner } });
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
  
  if (!device) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <h2 className="text-2xl font-bold mb-4">Dispositivo não encontrado</h2>
          <Button onClick={() => navigate('/devices')}>Voltar para Dispositivos</Button>
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
            onClick={() => navigate('/devices')}
            className="h-8 w-8"
          >
            <ArrowLeftIcon size={16} />
          </Button>
          <h1 className="text-2xl font-bold">Detalhes do Dispositivo</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {device.brand === 'other' ? 'Outra Marca' : device.brand} {device.model}
                </h2>
                <p className="text-muted-foreground">{device.serialNumber}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => setIsConfirmDeleteOpen(true)}
                >
                  Excluir dispositivo
                </Button>
                {device && device.owner && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/customers/${device.owner}`)}
                  >
                    Ver proprietário
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigate(`/devices/edit/${device.id}`)}
                >
                  <PencilIcon size={16} />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Proprietário</h3>
                <p className="font-medium">{customer ? customer.name : 'Não especificado'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                <div className="flex items-center">
                  {device.status === 'good' ? (
                    <>
                      <CheckCircleIcon size={16} className="text-green-600 mr-1" />
                      <span>Bom estado</span>
                    </>
                  ) : device.status === 'issue' ? (
                    <>
                      <AlertCircleIcon size={16} className="text-amber-500 mr-1" />
                      <span>Problemas leves</span>
                    </>
                  ) : device.status === 'critical' ? (
                    <>
                      <XCircleIcon size={16} className="text-red-600 mr-1" />
                      <span>Problemas críticos</span>
                    </>
                  ) : (
                    <span>Não especificado</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Tipo</h3>
                <p className="font-medium">
                  {device.type === 'cellphone' ? 'Celular' : 
                   device.type === 'tablet' ? 'Tablet' : 
                   device.type === 'notebook' ? 'Notebook' : 'Não especificado'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Último Serviço</h3>
                <p className="font-medium">{device.lastService || 'Nenhum serviço registrado'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de Compra</h3>
                <p className="font-medium">{device.purchaseDate ? new Date(device.purchaseDate).toLocaleDateString('pt-BR') : 'Não especificada'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Cor</h3>
                <p className="font-medium">{device.color || 'Não especificada'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Capacidade</h3>
                <p className="font-medium">{device.capacity || 'Não especificada'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Senha</h3>
                {device.passwordType === 'none' ? (
                  <p className="font-medium">Nenhuma</p>
                ) : device.passwordType === 'pin' ? (
                  <p className="font-medium">PIN: {device.password}</p>
                ) : device.passwordType === 'pattern' ? (
                  <div>
                    <p className="font-medium mb-2">Padrão:</p>
                    <PatternLockDisplay pattern={device.password} size={160} />
                  </div>
                ) : device.passwordType === 'password' ? (
                  <p className="font-medium">Senha: {device.password}</p>
                ) : (
                  <p className="font-medium">Não especificada</p>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Observações</h3>
              <p>{device.notes || 'Nenhuma observação'}</p>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleNewService} className="gap-2">
                <CalendarIcon size={16} />
                <span>Agendar Serviço</span>
              </Button>
            </div>
          </Card>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Histórico de Serviços</h3>
              
              {serviceHistory.length > 0 ? (
                <div className="space-y-4">
                  {serviceHistory.map((service, index) => (
                    <motion.div 
                      key={service.id}
                      className="border rounded-md p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/services/${service.id}`)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{service.description}</h4>
                        <Badge 
                          variant={
                            service.status === 'completed' ? 'default' : 
                            service.status === 'in_progress' ? 'secondary' : 
                            service.status === 'waiting' ? 'outline' : 
                            'outline'
                          }
                          className={
                            service.status === 'completed' ? 'bg-green-500 hover:bg-green-500/90' : 
                            service.status === 'in_progress' ? 'bg-amber-500 hover:bg-amber-500/90' : 
                            service.status === 'waiting' ? 'bg-yellow-500 hover:bg-yellow-500/90' : 
                            ''
                          }
                        >
                          {service.status === 'completed' ? 'Concluído' : 
                           service.status === 'in_progress' ? 'Em Andamento' : 
                           service.status === 'waiting' ? 'Aguardando' : 
                           service.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex justify-between">
                        <span>
                          Data: {service.scheduledDate ? new Date(service.scheduledDate).toLocaleDateString('pt-BR') : 'Não agendado'}
                        </span>
                        <span className="font-medium">
                          R$ {service.price ? service.price.toFixed(2).replace('.', ',') : '0,00'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-3">Nenhum serviço registrado</p>
                  <Button variant="outline" onClick={handleNewService}>
                    Agendar Serviço
                  </Button>
                </div>
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
              Esta ação irá excluir permanentemente o dispositivo "{device?.brand} {device?.model}" e não pode ser desfeita.
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

export default DeviceDetail;
