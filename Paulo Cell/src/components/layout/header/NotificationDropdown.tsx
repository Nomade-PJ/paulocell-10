import React from 'react';
import { BellIcon, CheckIcon, Trash2Icon, XIcon, BellOffIcon, AlertTriangleIcon, InfoIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    notifications, 
    unreadCount, 
    notificationsEnabled,
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAllNotifications,
    toggleNotifications
  } = useNotifications();

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleClearAll = () => {
    clearAllNotifications();
    toast({
      title: "Notificações limpas",
      description: "Todas as notificações foram removidas"
    });
  };

  const handleToggleNotifications = () => {
    toggleNotifications();
    toast({
      title: notificationsEnabled ? "Notificações desativadas" : "Notificações ativadas",
      description: notificationsEnabled ? 
        "Você não receberá novas notificações" : 
        "Você receberá notificações de estoque baixo, serviços atrasados e documentos pendentes"
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast({
      title: "Notificações marcadas como lidas",
      description: "Todas as notificações foram marcadas como lidas"
    });
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
      .format(
        -Math.round((Date.now() - timestamp) / (1000 * 60)),
        'minute'
      );
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'warning':
        return <div className="p-1 rounded-full bg-yellow-100 text-yellow-600">
          <AlertTriangleIcon size={14} />
        </div>;
      case 'error':
        return <div className="p-1 rounded-full bg-red-100 text-red-600">
          <XIcon size={14} />
        </div>;
      case 'success':
        return <div className="p-1 rounded-full bg-green-100 text-green-600">
          <CheckIcon size={14} />
        </div>;
      default:
        return <div className="p-1 rounded-full bg-blue-100 text-blue-600">
          <InfoIcon size={14} />
        </div>;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 rounded-full hover:bg-muted relative">
          {notificationsEnabled ? (
            <BellIcon size={20} />
          ) : (
            <BellOffIcon size={20} className="text-muted-foreground" />
          )}
          {unreadCount > 0 && notificationsEnabled && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-muted-foreground hover:text-foreground"
                title="Marcar todas como lidas"
              >
                <CheckIcon size={14} />
              </button>
              <button
                onClick={handleClearAll}
                className="text-xs text-muted-foreground hover:text-foreground"
                title="Limpar todas"
              >
                <Trash2Icon size={14} />
              </button>
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="text-sm">Notificações ativadas</div>
          <Switch 
            checked={notificationsEnabled}
            onCheckedChange={handleToggleNotifications}
          />
        </div>
        
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="py-4 px-2 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {getNotificationIcon(notification.type)}
                    <span className="font-medium">{notification.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <XIcon size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
                {!notification.read && (
                  <Badge variant="default" className="mt-1">
                    Nova
                  </Badge>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
