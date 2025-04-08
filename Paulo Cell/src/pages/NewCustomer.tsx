
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import CustomerForm from '@/components/forms/CustomerForm';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NewCustomer: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (customerData: any) => {
    console.log('Customer data submitted:', customerData);
    // In a real app, you would send this data to your backend
  };

  return (
    <MainLayout>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/customers')}
            className="h-8 w-8"
          >
            <ArrowLeftIcon size={16} />
          </Button>
          <h1 className="text-2xl font-bold">Novo Cliente</h1>
        </div>
        
        <CustomerForm onSubmit={handleSubmit} />
      </motion.div>
    </MainLayout>
  );
};

export default NewCustomer;
