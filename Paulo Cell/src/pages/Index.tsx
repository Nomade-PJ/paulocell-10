
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SmartphoneIcon, WrenchIcon, UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the modal para melhorar o tempo de carregamento inicial
const DeveloperContactModal = lazy(() => import('@/components/layout/header/DeveloperContactModal'));

const Index = () => {
  const navigate = useNavigate();
  const [developerModalOpen, setDeveloperModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular um pequeno delay para garantir que o carregamento dos recursos básicos seja concluído
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleDeveloperContact = () => {
    setDeveloperModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100 p-4">
        <div className="text-center max-w-3xl">
          <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" />
          <Skeleton className="h-10 w-48 mx-auto mb-4" />
          <Skeleton className="h-6 w-80 mx-auto mb-6" />
          <Skeleton className="h-4 w-96 mx-auto mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          
          <Skeleton className="h-12 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100">
      <motion.div 
        className="text-center max-w-3xl px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-6">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <SmartphoneIcon size={40} />
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-4 text-primary">PauloCell</h1>
        <p className="text-2xl text-gray-700 mb-6">Sistema de Gerenciamento para Assistência Técnica</p>
        <p className="text-lg text-muted-foreground mb-8">
          Gerencie clientes, dispositivos e serviços de reparo com facilidade e eficiência.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div 
            className="bg-card rounded-xl border border-border p-4 text-center"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-center mb-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <SmartphoneIcon size={24} />
              </div>
            </div>
            <h3 className="font-medium mb-1">Dispositivos</h3>
            <p className="text-sm text-muted-foreground">Cadastre e acompanhe o histórico de dispositivos</p>
          </motion.div>

          <motion.div 
            className="bg-card rounded-xl border border-border p-4 text-center"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-center mb-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                <WrenchIcon size={24} />
              </div>
            </div>
            <h3 className="font-medium mb-1">Serviços</h3>
            <p className="text-sm text-muted-foreground">Gerencie ordens de serviço e reparos</p>
          </motion.div>

          <motion.div 
            className="bg-card rounded-xl border border-border p-4 text-center"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-center mb-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <UsersIcon size={24} />
              </div>
            </div>
            <h3 className="font-medium mb-1">Clientes</h3>
            <p className="text-sm text-muted-foreground">Mantenha um cadastro completo de clientes</p>
          </motion.div>
        </div>

        <div className="flex justify-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/login')}
            className="px-10 py-6 text-lg font-medium shadow-md hover:shadow-lg transition-all"
          >
            Entrar no Sistema
          </Button>
        </div>
      </motion.div>

      <div className="mt-16 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} PauloCell - Todos os direitos reservados</p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDeveloperContact}
          className="mt-2 text-xs text-muted-foreground hover:text-primary"
        >
          Desenvolvido por
        </Button>
      </div>

      <Suspense fallback={null}>
        {developerModalOpen && (
          <DeveloperContactModal 
            open={developerModalOpen} 
            onOpenChange={setDeveloperModalOpen} 
          />
        )}
      </Suspense>
    </div>
  );
};

export default Index;
