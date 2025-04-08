
import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ServiceCard from '@/components/ui/ServiceCard';

interface RecentServicesProps {
  services: any[];
}

const RecentServices: React.FC<RecentServicesProps> = ({ services }) => {
  const navigate = useNavigate();
  const recentServices = services.slice(0, 5);
  
  const handleServiceClick = (id: string) => {
    navigate(`/services/${id}`);
  };
  
  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Serviços Recentes</h2>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate('/services')}>
          <span>Ver todos</span>
          <ArrowRightIcon size={16} />
        </Button>
      </div>
      
      <div className="space-y-3">
        {recentServices.length > 0 ? (
          recentServices.map((service, idx) => (
            <div key={service.id} onClick={() => handleServiceClick(service.id)} className="cursor-pointer">
              <ServiceCard service={service} index={idx} />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-32 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground mb-2">Nenhum serviço cadastrado</p>
            <Button size="sm" onClick={() => navigate('/services/new')}>Cadastrar Serviço</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentServices;
