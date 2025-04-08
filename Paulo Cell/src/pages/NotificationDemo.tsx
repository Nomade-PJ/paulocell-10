import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/NotificationContext';
import MainLayout from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const NotificationDemo: React.FC = () => {
  const { addNotification, notifications, clearAllNotifications } = useNotifications();
  const { toast } = useToast();

  const createInfoNotification = () => {
    addNotification({
      title: 'Informação',
      message: 'Esta é uma notificação informativa',
      type: 'info',
    });
    toast({
      title: 'Notificação criada',
      description: 'Notificação informativa adicionada com sucesso',
    });
  };

  const createSuccessNotification = () => {
    addNotification({
      title: 'Sucesso',
      message: 'Operação realizada com sucesso',
      type: 'success',
    });
    toast({
      title: 'Notificação criada',
      description: 'Notificação de sucesso adicionada com sucesso',
      variant: 'default',
    });
  };

  const createWarningNotification = () => {
    addNotification({
      title: 'Atenção',
      message: 'Você precisa verificar algumas configurações',
      type: 'warning',
    });
    toast({
      title: 'Notificação criada',
      description: 'Notificação de alerta adicionada com sucesso',
    });
  };

  const createErrorNotification = () => {
    addNotification({
      title: 'Erro',
      message: 'Ocorreu um erro ao processar sua solicitação',
      type: 'error',
    });
    toast({
      title: 'Notificação criada',
      description: 'Notificação de erro adicionada com sucesso',
    });
  };

  const createLinkNotification = () => {
    addNotification({
      title: 'Novo serviço',
      message: 'Um novo serviço foi adicionado. Clique para visualizar.',
      type: 'info',
      link: '/services',
    });
    toast({
      title: 'Notificação criada',
      description: 'Notificação com link adicionada com sucesso',
    });
  };

  return (
    <MainLayout>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-2xl font-bold">Demo de Notificações</h1>
          <p className="text-muted-foreground">Teste o sistema de notificações</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Criar Notificações</h2>
            <div className="space-y-2">
              <Button onClick={createInfoNotification} className="w-full">Criar Notificação Informativa</Button>
              <Button onClick={createSuccessNotification} className="w-full">Criar Notificação de Sucesso</Button>
              <Button onClick={createWarningNotification} className="w-full">Criar Notificação de Alerta</Button>
              <Button onClick={createErrorNotification} className="w-full">Criar Notificação de Erro</Button>
              <Button onClick={createLinkNotification} className="w-full">Criar Notificação com Link</Button>
            </div>
          </div>
          
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Notificações Atuais</h2>
              <Button variant="outline" onClick={clearAllNotifications}>Limpar Todas</Button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma notificação</p>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="border rounded-md p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{notification.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        notification.type === 'info' ? 'bg-blue-100 text-blue-800' :
                        notification.type === 'success' ? 'bg-green-100 text-green-800' :
                        notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {notification.type}
                      </span>
                      {notification.read ? (
                        <span className="text-xs text-muted-foreground">Lida</span>
                      ) : (
                        <span className="text-xs text-blue-600 font-medium">Não lida</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default NotificationDemo;