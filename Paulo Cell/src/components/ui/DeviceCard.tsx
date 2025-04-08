
import React from 'react';
import { motion } from 'framer-motion';
import { SmartphoneIcon, CircleIcon, MoreVerticalIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';

interface DeviceCardProps {
  device: {
    id: string;
    brand: string;
    model: string;
    serialNumber: string;
    type: 'android' | 'ios';
    status: 'good' | 'issue' | 'critical';
    lastService: string;
    owner: string;
  };
  index: number;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, index }) => {
  const getStatusIcon = () => {
    switch(device.status) {
      case 'good':
        return <CheckCircleIcon size={14} className="text-green-600" />;
      case 'issue':
        return <AlertCircleIcon size={14} className="text-amber-500" />;
      case 'critical':
        return <AlertCircleIcon size={14} className="text-red-600" />;
      default:
        return <CircleIcon size={14} className="text-muted-foreground" />;
    }
  };
  
  const getStatusText = () => {
    switch(device.status) {
      case 'good':
        return 'Bom estado';
      case 'issue':
        return 'Problemas leves';
      case 'critical':
        return 'Problemas críticos';
      default:
        return 'Desconhecido';
    }
  };
  
  return (
    <motion.div 
      className="bg-card rounded-xl border border-border p-4 card-hover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <SmartphoneIcon size={20} />
          </div>
          
          <div>
            <h3 className="font-medium">{device.brand} {device.model}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{device.type === 'ios' ? 'iOS' : 'Android'}</p>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              {getStatusIcon()}
              <span className="ml-1">{getStatusText()}</span>
            </div>
          </div>
        </div>
        
        <button className="p-1 rounded-full hover:bg-muted transition-colors">
          <MoreVerticalIcon size={18} />
        </button>
      </div>
      
      <div className="border-t border-border mt-3 pt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">Proprietário:</span>
          <p className="font-medium">{device.owner}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Último serviço:</span>
          <p className="font-medium">{device.lastService}</p>
        </div>
        <div className="col-span-2">
          <span className="text-muted-foreground">Nº de série:</span>
          <p className="font-medium">{device.serialNumber}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default DeviceCard;
