import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeftIcon, RefreshCcwIcon, HistoryIcon, DatabaseIcon, BarChart4Icon, AlertTriangleIcon, RotateCcwIcon, BarChart2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

// Importando API
import { SyncAPI } from '../lib/api-service';

const ResetStatistics: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Monitorar estado online/offline
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

  const handleResetAllStats = async () => {
    try {
      setIsLoading(true);
      // Mostrar um toast de que o processo está em andamento
      toast.info('Reinicializando todas as estatísticas...');
      
      if (isOnline) {
        try {
          // Tentar resetar via API
          await SyncAPI.resetAllStatistics();
          
          toast.success('Todas as estatísticas reinicializadas com sucesso!');
          
          // Recarregar a página após um breve delay para atualizar os dados
          setTimeout(() => {
            navigate('/reports');
          }, 1500);
          return;
        } catch (apiError) {
          console.error('Erro ao resetar estatísticas via API:', apiError);
          toast.error('Erro ao comunicar com o servidor, tentando método local');
          // Fallback para método local
        }
      }
      
      // Método local (fallback)
      // Lista completa de chaves estatísticas para serem resetadas
      const keysToReset = [
        'pauloCell_statistics',
        'pauloCell_chartData',
        'pauloCell_reportData',
        'pauloCell_dashboard_stats',
        'pauloCell_visuals',
        'pauloCell_report_cache',
        'pauloCell_chart_config',
        'pauloCell_period_data'
      ];
      
      // Remover todas as chaves
      keysToReset.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Definir estatísticas vazias
      const emptyStats = {
        serviceCount: 0,
        totalRevenue: 0,
        totalCost: 0,
        profit: 0,
        customerCount: 0,
        deviceCount: 0,
        repairsByBrand: {},
        repairsByType: {},
        revenueByMonth: {},
        servicesByStatus: {},
        lastReset: new Date().toISOString()
      };
      
      // Salvar estatísticas vazias
      localStorage.setItem('pauloCell_statistics', JSON.stringify(emptyStats));
      
      // Definir flag de dados resetados
      localStorage.setItem('pauloCell_data_reset_flag', 'true');
      
      // Limpar cache
      localStorage.removeItem('pauloCell_cache');
      
      toast.success('Todas as estatísticas reinicializadas com sucesso!');
      
      // Recarregar a página após um breve delay para atualizar os dados
      setTimeout(() => {
        navigate('/reports');
      }, 1500);
    } catch (error) {
      console.error('Erro ao reinicializar estatísticas:', error);
      toast.error('Erro ao reinicializar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetVisualStats = async () => {
    try {
      setIsLoading(true);
      // Mostrar um toast de que o processo está em andamento
      toast.info('Reinicializando estatísticas visuais...');
      
      if (isOnline) {
        try {
          // Tentar resetar via API
          await SyncAPI.resetVisualStatistics();
          
          toast.success('Estatísticas visuais reinicializadas com sucesso!');
          
          // Recarregar a página após um breve delay para atualizar os dados
          setTimeout(() => {
            navigate('/reports');
          }, 1500);
          return;
        } catch (apiError) {
          console.error('Erro ao resetar estatísticas visuais via API:', apiError);
          toast.error('Erro ao comunicar com o servidor, tentando método local');
          // Fallback para método local
        }
      }
      
      // Lista completa de chaves para garantir limpeza total
      const keysToReset = [
        'pauloCell_chartData',
        'pauloCell_reportData',
        'pauloCell_dashboard_stats',
        'pauloCell_visuals',
        'pauloCell_report_cache',
        'pauloCell_chart_config',
        'pauloCell_period_data'
      ];
      
      // Remover todas as chaves
      keysToReset.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Definir flag de dados resetados para ser lida pela página de relatórios
      localStorage.setItem('pauloCell_data_reset_flag', 'true');
      
      toast.success('Estatísticas visuais reinicializadas com sucesso!');
      
      // Recarregar a página após um breve delay para atualizar os dados
      setTimeout(() => {
        navigate('/reports');
      }, 1500);
    } catch (error) {
      console.error('Erro ao reinicializar estatísticas visuais:', error);
      toast.error('Erro ao reinicializar estatísticas visuais');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Reinicialização de Estatísticas</h1>
        </div>

        <Alert className="mb-6">
          <DatabaseIcon className="h-4 w-4" />
          <AlertTitle>Informação Importante</AlertTitle>
          <AlertDescription>
            Esta página permite reinicializar as estatísticas do sistema. Os dados reais (clientes, 
            dispositivos, serviços) não serão afetados, apenas os dados estatísticos e gráficos.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart4Icon className="h-5 w-5" />
                Reinicializar Estatísticas Visuais
              </CardTitle>
              <CardDescription>
                Reinicializa apenas os dados visuais e gráficos, mantendo os dados estatísticos calculados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Esta ação irá zerar apenas os gráficos e visualizações, sem afetar os cálculos estatísticos
                internos. Útil quando você quer apenas limpar os gráficos.
              </p>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleResetVisualStats}
              >
                <RefreshCcwIcon className="mr-2 h-4 w-4" />
                Reinicializar Estatísticas Visuais
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <HistoryIcon className="h-5 w-5" />
                Reinicializar Todas as Estatísticas
              </CardTitle>
              <CardDescription>
                Reinicializa completamente todos os dados estatísticos e gráficos do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Esta ação irá zerar completamente todas as estatísticas, incluindo contadores, 
                gráficos e dados numéricos. Use quando quiser começar do zero.
              </p>
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={handleResetAllStats}
              >
                <RefreshCcwIcon className="mr-2 h-4 w-4" />
                Reinicializar Todas as Estatísticas
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default ResetStatistics; 