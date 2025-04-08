import React from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  ActivityIcon, 
  CheckCircleIcon, 
  PackageIcon,
  CalendarIcon,
  UserIcon,
  DollarSignIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ServiceCardProps {
  service: {
    id: string;
    description: string;
    status: string;
    customer?: string;
    device?: string;
    created_at?: string | number | Date;
    scheduled_date?: string | number | Date;
    price?: number;
    technician?: string;
    customer_id?: string;
    device_id?: string;
    type?: string;
    // Compatibilidade com dados antigos
    createDate?: string;
    estimatedCompletion?: string;
    priority?: 'low' | 'normal' | 'high';
  };
  index: number;
  onClick?: (serviceId: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, index }) => {
  // Função para formatar data
  const formatDate = (dateString: string | number | Date | undefined | null) => {
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

  // Função para obter o badge de status
  const getStatusBadge = () => {
    switch (service.status) {
      case 'waiting':
        return (
          <Badge variant="outline" className="bg-yellow-500 hover:bg-yellow-500/90">
            Aguardando
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-500/90">
            Em Andamento
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-500/90">
            Concluído
          </Badge>
        );
      case 'delivered':
      case 'done':
        return (
          <Badge variant="outline" className="bg-purple-500 hover:bg-purple-500/90 text-white">
            Entregue
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {service.status}
          </Badge>
        );
    }
  };

  // Função para obter o ícone de status
  const getStatusIcon = () => {
    switch (service.status) {
      case 'waiting':
        return <ClockIcon size={16} className="text-blue-500" />;
      case 'in_progress':
        return <ActivityIcon size={16} className="text-amber-500" />;
      case 'completed':
        return <CheckCircleIcon size={16} className="text-green-500" />;
      case 'delivered':
      case 'done':
        return <PackageIcon size={16} className="text-purple-500" />;
      default:
        return null;
    }
  };

  // Obter data apropriada
  const createdDate = formatDate(service.created_at || service.createDate);
  const scheduledDate = formatDate(service.scheduled_date || service.estimatedCompletion);

  return (
    <motion.div 
      className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-lg">{service.description || service.type}</h3>
        {getStatusBadge()}
      </div>
      
      <div className="mt-1 text-muted-foreground text-sm">
        {service.customer || 'Cliente não especificado'}
        {service.device && ` • ${service.device}`}
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1">
          <CalendarIcon size={14} className="text-muted-foreground" />
          <span>Criado: {createdDate}</span>
        </div>
        <div className="flex items-center gap-1">
          <ClockIcon size={14} className="text-muted-foreground" />
          <span>Agendado: {scheduledDate || 'N/A'}</span>
        </div>
      </div>
      
      <div className="mt-3 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <UserIcon size={14} className="text-muted-foreground" />
          <span className="text-sm">{service.technician || 'Não atribuído'}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <DollarSignIcon size={14} className="text-muted-foreground" />
          <span className="text-sm font-medium">
            R$ {service.price ? parseFloat(String(service.price)).toFixed(2).replace('.', ',') : '0,00'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
