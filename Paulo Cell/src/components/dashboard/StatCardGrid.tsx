
import React from 'react';
import { motion } from 'framer-motion';
import { 
  WrenchIcon, 
  UsersIcon, 
  SmartphoneIcon, 
  TrendingUpIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '@/components/ui/StatCard';

interface StatCardGridProps {
  services: any[];
  customers: any[];
  devices: any[];
  totalRevenue: number;
}

const StatCardGrid: React.FC<StatCardGridProps> = ({ 
  services, 
  customers, 
  devices, 
  totalRevenue 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/services')}
        className="cursor-pointer"
      >
        <StatCard 
          title="Serviços Ativos"
          value={String(services.filter(s => s.status === 'in_progress' || s.status === 'waiting').length)}
          description="serviços em andamento"
          trend={{ value: 0, positive: true }}
          icon={<WrenchIcon size={20} />}
        />
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/customers')}
        className="cursor-pointer"
      >
        <StatCard 
          title="Clientes"
          value={String(customers.length)}
          description="clientes cadastrados"
          trend={{ value: 0, positive: true }}
          icon={<UsersIcon size={20} />}
        />
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/devices')}
        className="cursor-pointer"
      >
        <StatCard 
          title="Dispositivos"
          value={String(devices.length)}
          description="dispositivos cadastrados"
          trend={{ value: 0, positive: true }}
          icon={<SmartphoneIcon size={20} />}
        />
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/reports')}
        className="cursor-pointer"
      >
        <StatCard 
          title="Faturamento"
          value={`R$ ${totalRevenue.toFixed(2)}`}
          description="em serviços"
          trend={{ value: 0, positive: true }}
          icon={<TrendingUpIcon size={20} />}
        />
      </motion.div>
    </div>
  );
};

export default StatCardGrid;
