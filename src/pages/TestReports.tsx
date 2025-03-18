import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import DataUpdateTester from '@/lib/DataUpdateTester';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Reports from './Reports';

const TestReports: React.FC = () => {
  return (
    <MainLayout>
      <motion.div 
        className="space-y-6 container mx-auto py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Teste de Relatórios em Tempo Real</h1>
        <p className="text-muted-foreground">
          Esta página permite testar se os relatórios estão funcionando corretamente com dados reais.
          Adicione dados de teste e verifique se os gráficos são atualizados automaticamente.
        </p>
        
        <Tabs defaultValue="tester" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tester">Painel de Teste</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tester" className="mt-4">
            <DataUpdateTester />
          </TabsContent>
          
          <TabsContent value="reports" className="mt-4">
            <Reports />
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
};

export default TestReports; 