
import { Notification } from '@/contexts/NotificationContext';

// Check if an item has low stock
export const checkLowStock = (inventory: any[]) => {
  return inventory.filter(item => Number(item.currentStock) < Number(item.minimumStock));
};

// Check if a service is overdue
export const checkOverdueServices = (services: any[]) => {
  const currentDate = new Date();
  
  return services.filter(service => {
    if (!service.expectedCompletionDate || 
        service.status === 'completed' || 
        service.status === 'cancelled') {
      return false;
    }
    
    const completionDate = new Date(service.expectedCompletionDate);
    return completionDate < currentDate;
  });
};

// Check for pending documents
export const checkPendingDocuments = (documents: any[]) => {
  return documents.filter(doc => doc.status === 'Pendente');
};

// Format notification time in a human-readable way
export const formatNotificationTime = (timestamp: number): string => {
  const now = new Date();
  const notificationDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `há ${diffInSeconds} segundo${diffInSeconds === 1 ? '' : 's'}`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `há ${diffInMinutes} minuto${diffInMinutes === 1 ? '' : 's'}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `há ${diffInHours} hora${diffInHours === 1 ? '' : 's'}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `há ${diffInDays} dia${diffInDays === 1 ? '' : 's'}`;
};

// Get appropriate icon for notification type
export const getNotificationTypeClass = (type: string): string => {
  switch(type) {
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    case 'success':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

export default {
  checkLowStock,
  checkOverdueServices,
  checkPendingDocuments,
  formatNotificationTime,
  getNotificationTypeClass
};
