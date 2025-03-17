import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { emitDataCreated } from './DataUpdateEmitter';
import { AppEvents, eventBus } from './events';
import { toast } from 'sonner';

/**
 * Componente de teste para adicionar dados de exemplo ao sistema
 * e verificar se os relatórios são atualizados em tempo real
 */
const DataUpdateTester: React.FC = () => {
  const addTestCustomer = () => {
    try {
      // Obter dados existentes ou criar um array vazio
      const existingCustomers = JSON.parse(localStorage.getItem('pauloCell_customers') || '[]');
      
      // Criar cliente de teste com dados que os relatórios irão detectar
      const newCustomer = {
        id: `customer-${Date.now()}`,
        name: 'Cliente Teste',
        email: 'teste@exemplo.com',
        phone: '(11) 98765-4321',
        type: 'person', // pessoa física
        cpf: '123.456.789-00',
        createdAt: new Date().toISOString(),
        address: {
          street: 'Rua de Teste',
          number: '123',
          city: 'São Paulo',
          state: 'SP'
        }
      };
      
      // Adicionar o novo cliente
      const updatedCustomers = [...existingCustomers, newCustomer];
      
      // Salvar no localStorage
      localStorage.setItem('pauloCell_customers', JSON.stringify(updatedCustomers));
      
      // Emitir evento para atualizar relatórios
      emitDataCreated('customer', newCustomer);
      
      toast.success('Cliente de teste adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar cliente de teste:', error);
      toast.error('Erro ao adicionar cliente de teste');
    }
  };
  
  const addTestCompany = () => {
    try {
      // Obter dados existentes ou criar um array vazio
      const existingCustomers = JSON.parse(localStorage.getItem('pauloCell_customers') || '[]');
      
      // Criar empresa de teste com dados que os relatórios irão detectar
      const newCompany = {
        id: `company-${Date.now()}`,
        name: 'Empresa Teste LTDA',
        email: 'contato@empresateste.com',
        phone: '(11) 3456-7890',
        isCompany: true,
        cnpj: '12.345.678/0001-90',
        razaoSocial: 'Empresa Teste Sociedade Empresária Limitada',
        createdAt: new Date().toISOString(),
        address: {
          street: 'Avenida Comercial',
          number: '789',
          city: 'São Paulo',
          state: 'SP'
        }
      };
      
      // Adicionar a nova empresa
      const updatedCustomers = [...existingCustomers, newCompany];
      
      // Salvar no localStorage
      localStorage.setItem('pauloCell_customers', JSON.stringify(updatedCustomers));
      
      // Emitir evento para atualizar relatórios
      emitDataCreated('customer', newCompany);
      
      toast.success('Empresa de teste adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar empresa de teste:', error);
      toast.error('Erro ao adicionar empresa de teste');
    }
  };
  
  const addTestDevice = () => {
    try {
      // Obter dados existentes ou criar um array vazio
      const existingDevices = JSON.parse(localStorage.getItem('pauloCell_devices') || '[]');
      
      // Criar dispositivo de teste com dados que os relatórios irão detectar
      const newDevice = {
        id: `device-${Date.now()}`,
        name: 'iPhone 13',
        type: 'cellphone',
        brand: 'apple',
        model: 'iPhone 13',
        serialNumber: `SN${Math.floor(Math.random() * 1000000)}`,
        status: 'good',
        customerId: null, // Sem cliente associado para simplificar
        createdAt: new Date().toISOString(),
        description: 'Dispositivo de teste em bom estado'
      };
      
      // Adicionar o novo dispositivo
      const updatedDevices = [...existingDevices, newDevice];
      
      // Salvar no localStorage
      localStorage.setItem('pauloCell_devices', JSON.stringify(updatedDevices));
      
      // Emitir evento para atualizar relatórios
      emitDataCreated('device', newDevice);
      
      toast.success('Dispositivo de teste adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar dispositivo de teste:', error);
      toast.error('Erro ao adicionar dispositivo de teste');
    }
  };
  
  const addTestService = () => {
    try {
      // Obter dados existentes ou criar um array vazio
      const existingServices = JSON.parse(localStorage.getItem('pauloCell_services') || '[]');
      
      // Criar serviço de teste com dados que os relatórios irão detectar
      const newService = {
        id: `service-${Date.now()}`,
        title: 'Troca de Tela',
        description: 'Troca de tela de smartphone',
        status: 'in-progress',
        price: 300.0,
        customerId: null, // Sem cliente associado para simplificar
        deviceId: null, // Sem dispositivo associado para simplificar
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        technician: 'Técnico Teste'
      };
      
      // Adicionar o novo serviço
      const updatedServices = [...existingServices, newService];
      
      // Salvar no localStorage
      localStorage.setItem('pauloCell_services', JSON.stringify(updatedServices));
      
      // Emitir evento para atualizar relatórios
      emitDataCreated('service', newService);
      
      toast.success('Serviço de teste adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar serviço de teste:', error);
      toast.error('Erro ao adicionar serviço de teste');
    }
  };
  
  const clearAllData = () => {
    try {
      // Lista de chaves para limpar
      const keysToRemove = [
        'pauloCell_customers',
        'pauloCell_devices',
        'pauloCell_services',
        'pauloCell_inventory'
      ];
      
      // Remover todas as chaves
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Solicitar atualização dos relatórios
      eventBus.emit(AppEvents.REPORTS_REFRESH_REQUESTED);
      
      toast.success('Todos os dados de teste foram removidos.');
    } catch (error) {
      console.error('Erro ao limpar dados de teste:', error);
      toast.error('Erro ao limpar dados de teste');
    }
  };
  
  const refreshReports = () => {
    eventBus.emit(AppEvents.REPORTS_REFRESH_REQUESTED);
    toast.info('Solicitação de atualização de relatórios enviada.');
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Testador de Atualização de Relatórios</CardTitle>
        <CardDescription>
          Use este painel para adicionar dados de teste e verificar se os relatórios são atualizados em tempo real.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={addTestCustomer} variant="outline" className="w-full">
            Adicionar Cliente Teste
          </Button>
          <Button onClick={addTestCompany} variant="outline" className="w-full">
            Adicionar Empresa Teste
          </Button>
          <Button onClick={addTestDevice} variant="outline" className="w-full">
            Adicionar Dispositivo Teste
          </Button>
          <Button onClick={addTestService} variant="outline" className="w-full">
            Adicionar Serviço Teste
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={refreshReports} variant="default">
          Atualizar Relatórios
        </Button>
        <Button onClick={clearAllData} variant="destructive">
          Limpar Todos os Dados
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DataUpdateTester; 