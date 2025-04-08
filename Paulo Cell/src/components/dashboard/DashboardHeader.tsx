import React from 'react';
import { RefreshCwIcon, Loader2Icon, DatabaseIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardHeaderProps {
  lastUpdated: Date;
  isRefreshing: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  onRefresh: () => void;
  onSync: () => void;
  formatLastUpdated: (date: Date) => string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  lastUpdated, 
  isRefreshing, 
  isOnline,
  isSyncing,
  onRefresh,
  onSync,
  formatLastUpdated
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm text-muted-foreground">
          Atualizado {formatLastUpdated(lastUpdated)}
        </p>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Atualizar dados"
        >
          {isRefreshing ? (
            <Loader2Icon size={16} className="animate-spin" />
          ) : (
            <RefreshCwIcon size={16} />
          )}
        </Button>
        
        <Button 
          variant="outline"
          onClick={onSync}
          disabled={!isOnline || isSyncing}
          className="flex items-center gap-2"
          title="Sincronizar com o banco de dados"
        >
          {isSyncing ? (
            <>
              <Loader2Icon size={16} className="animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <DatabaseIcon size={16} />
              Sincronizar BD
            </>
          )}
        </Button>
        
        <Button onClick={() => navigate('/reports')}>Ver relatórios</Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
