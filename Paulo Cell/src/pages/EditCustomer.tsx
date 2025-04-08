
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import CustomerForm from '@/components/forms/CustomerForm';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const EditCustomer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load customer data from localStorage based on ID
    const loadCustomerData = () => {
      try {
        const savedCustomers = localStorage.getItem('pauloCell_customers');
        if (savedCustomers) {
          const customers = JSON.parse(savedCustomers);
          const foundCustomer = customers.find((c: any) => c.id === id);
          
          if (foundCustomer) {
            setCustomerData(foundCustomer);
          } else {
            toast.error('Cliente não encontrado');
            navigate('/customers');
          }
        } else {
          toast.error('Nenhum cliente cadastrado');
          navigate('/customers');
        }
      } catch (error) {
        console.error('Error loading customer data:', error);
        toast.error('Erro ao carregar dados do cliente');
      } finally {
        setLoading(false);
      }
    };
    
    loadCustomerData();
  }, [id, navigate]);

  const handleSubmit = (updatedCustomerData: any) => {
    try {
      // Get all customers from localStorage
      const savedCustomers = localStorage.getItem('pauloCell_customers');
      if (!savedCustomers) {
        throw new Error('Nenhum cliente encontrado');
      }
      
      const customers = JSON.parse(savedCustomers);
      
      // Find the index of the customer to update
      const customerIndex = customers.findIndex((c: any) => c.id === id);
      if (customerIndex === -1) {
        throw new Error('Cliente não encontrado');
      }
      
      // Update the customer data
      const updatedCustomers = [...customers];
      updatedCustomers[customerIndex] = {
        ...updatedCustomerData,
        id, // Ensure we keep the same ID
        updatedAt: new Date().toISOString()
      };
      
      // Save updated customers back to localStorage
      localStorage.setItem('pauloCell_customers', JSON.stringify(updatedCustomers));
      
      toast.success('Cliente atualizado com sucesso');
      navigate(`/customers/${id}`);
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Erro ao atualizar cliente');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!customerData) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <h2 className="text-2xl font-bold mb-4">Cliente não encontrado</h2>
          <Button onClick={() => navigate('/customers')}>Voltar para Clientes</Button>
        </div>
      </MainLayout>
    );
  }

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
            onClick={() => navigate(`/customers/${id}`)}
            className="h-8 w-8"
          >
            <ArrowLeftIcon size={16} />
          </Button>
          <h1 className="text-2xl font-bold">Editar Cliente</h1>
        </div>
        
        <CustomerForm 
          onSubmit={handleSubmit} 
          initialData={customerData}
          isEdit={true}
        />
      </motion.div>
    </MainLayout>
  );
};

export default EditCustomer;
