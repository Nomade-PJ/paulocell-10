
import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CustomerCard from '@/components/ui/CustomerCard';

interface RecentCustomersProps {
  customers: any[];
}

const RecentCustomers: React.FC<RecentCustomersProps> = ({ customers }) => {
  const navigate = useNavigate();
  const recentCustomers = customers.slice(0, 3);
  
  const handleCustomerClick = (id: string) => {
    navigate(`/customers/${id}`);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Clientes Recentes</h2>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate('/customers')}>
          <span>Ver todos</span>
          <ArrowRightIcon size={16} />
        </Button>
      </div>
      
      <div className="space-y-3">
        {recentCustomers.length > 0 ? (
          recentCustomers.map((customer, idx) => (
            <div key={customer.id} onClick={() => handleCustomerClick(customer.id)} className="cursor-pointer">
              <CustomerCard customer={customer} index={idx} />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-32 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground mb-2">Nenhum cliente cadastrado</p>
            <Button size="sm" onClick={() => navigate('/customers/new')}>Cadastrar Cliente</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentCustomers;
