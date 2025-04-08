import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useLocation } from 'react-router-dom';
import { 
  UserIcon, 
  StoreIcon, 
  BellIcon, 
  SaveIcon,
  DatabaseIcon,
  TrashIcon,
  RefreshCwIcon,
  FileTextIcon,
  KeyIcon,
  CheckIcon,
  AlertCircleIcon,
  ServerIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { initInvoiceApi, InvoiceApiConfig } from '@/lib/invoice-api';
import { resetAllStatistics, resetVisualStatistics } from '../lib/reset-stats';
import { useConnection } from '@/lib/ConnectionContext';
import { SettingsAPI } from '@/lib/api-service';

const Settings: React.FC = () => {
  const location = useLocation();
  const stateTab = location.state?.openTab || null;
  const [activeTab, setActiveTab] = useState(stateTab || 'company');
  const [isResettingDatabase, setIsResettingDatabase] = useState(false);
  const [isPasswordConfirmOpen, setIsPasswordConfirmOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Company information state
  const [companyData, setCompanyData] = useState({
    name: 'Paulo Cell',
    phone: '98 984031640',
    email: 'Paullo.celullar2020@gmail.com',
    address: 'Rua Dr. Paulo Ramos, S/n, Bairro: Centro',
    city: 'Coelho Neto',
    state: 'MA',
    postalCode: '65620-000',
    logo: '',
    cpfCnpj: '42.054.453/0001-40',
    notes: 'Assistência técnica especializada em celulares android e Iphone',
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    newService: true,
    serviceCompleted: true,
    lowInventory: true,
    customerBirthday: false,
    emailNotifications: true,
    smsNotifications: false,
  });
  
  // API settings state
  const [apiSettings, setApiSettings] = useState<InvoiceApiConfig>({
    apiKey: '',
    environment: 'sandbox',
    companyId: ''
  });
  
  // Adicionar o use do contexto de conexão
  const { isApiConnected, isSyncing, lastSyncTime, syncData } = useConnection();
  
  // Load saved settings on component mount
  useEffect(() => {
    loadSettings();
    
    // Definir a aba ativa com base no parâmetro de estado da navegação
    if (stateTab) {
      setActiveTab(stateTab);
    }
  }, [stateTab]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Carregar dados da empresa
      const companySettings = await SettingsAPI.getCompanySettings();
      if (companySettings) {
        setCompanyData(companySettings);
      }

      // Carregar configurações de notificações
      const notificationConfig = await SettingsAPI.getNotificationSettings();
      if (notificationConfig) {
        setNotificationSettings(notificationConfig);
      }
      
      // Carregar configurações de API
      const apiConfig = await SettingsAPI.getInvoiceApiSettings();
      if (apiConfig) {
        setApiSettings(apiConfig);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      
      // Se não conseguir carregar da API, tentar carregar do localStorage
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar dados do localStorage como fallback
  const loadFromLocalStorage = () => {
    try {
      const savedCompanyData = localStorage.getItem('pauloCell_companyData');
      const savedNotificationSettings = localStorage.getItem('pauloCell_notificationSettings');
      const savedApiSettings = localStorage.getItem('pauloCell_invoiceApiConfig');

      if (savedCompanyData) {
        setCompanyData(JSON.parse(savedCompanyData));
      }

      if (savedNotificationSettings) {
        setNotificationSettings(JSON.parse(savedNotificationSettings));
      }
      
      if (savedApiSettings) {
        setApiSettings(JSON.parse(savedApiSettings));
      }
      
      toast.warning('Carregando configurações do armazenamento local.');
    } catch (error) {
      console.error('Erro ao carregar configurações do localStorage:', error);
    }
  };

  const handleCompanyDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleApiSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleApiEnvironmentChange = (environment: 'sandbox' | 'production') => {
    setApiSettings(prev => ({ ...prev, environment }));
  };
  
  const handleSwitchChange = (setting: string, checked: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: checked }));
  };
  
  const handleSaveCompanyData = async () => {
    try {
      // Salvar na API
      await SettingsAPI.updateCompanySettings(companyData);
      
      // Salvar também no localStorage como fallback
      localStorage.setItem('pauloCell_companyData', JSON.stringify(companyData));
      
      toast.success('Informações da empresa salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar informações da empresa:', error);
      
      // Se falhar na API, salvar apenas no localStorage
      localStorage.setItem('pauloCell_companyData', JSON.stringify(companyData));
      
      toast.warning('Informações salvas apenas localmente. Serão sincronizadas quando houver conexão.');
    }
  };
  
  const handleSaveNotificationSettings = async () => {
    try {
      // Salvar na API
      await SettingsAPI.updateNotificationSettings(notificationSettings);
      
      // Salvar também no localStorage como fallback
      localStorage.setItem('pauloCell_notificationSettings', JSON.stringify(notificationSettings));
      
      toast.success('Configurações de notificações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações de notificações:', error);
      
      // Se falhar na API, salvar apenas no localStorage
      localStorage.setItem('pauloCell_notificationSettings', JSON.stringify(notificationSettings));
      
      toast.warning('Configurações salvas apenas localmente. Serão sincronizadas quando houver conexão.');
    }
  };
  
  const handleSaveApiSettings = async () => {
    try {
      // Salvar na API
      await SettingsAPI.updateInvoiceApiSettings(apiSettings);
      
      // Salvar também no localStorage como fallback
      localStorage.setItem('pauloCell_invoiceApiConfig', JSON.stringify(apiSettings));
      
      toast.success('Configurações de API salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações de API:', error);
      
      // Se falhar na API, salvar apenas no localStorage
      localStorage.setItem('pauloCell_invoiceApiConfig', JSON.stringify(apiSettings));
      
      toast.warning('Configurações salvas apenas localmente. Serão sincronizadas quando houver conexão.');
    }
  };
  
  const handlePasswordConfirm = () => {
    if (passwordInput === 'MilenaeNicolas') {
      // Senha correta, proceder com o reset
      handleResetDatabase();
      setIsPasswordConfirmOpen(false);
      setPasswordInput('');
      setPasswordError('');
    } else {
      // Senha incorreta
      setPasswordError('A senha digitada não corresponde à dica. Por favor, copie exatamente como mostrado.');
    }
  };
  
  const handleContinueToPasswordConfirm = () => {
    // Fechar o diálogo de confirmação inicial
    setIsResettingDatabase(false);
    // Abrir o diálogo de confirmação de senha
    setIsPasswordConfirmOpen(true);
  };
  
  const handleResetDatabase = () => {
    try {
      // Clear all app data from localStorage
      localStorage.removeItem('pauloCell_customers');
      localStorage.removeItem('pauloCell_devices');
      localStorage.removeItem('pauloCell_services');
      localStorage.removeItem('pauloCell_inventory');
      localStorage.removeItem('pauloCell_documents');
      
      // Keep the settings
      toast.success('Todos os dados foram apagados com sucesso!');
    } catch (error) {
      console.error('Error resetting database:', error);
      toast.error('Ocorreu um erro ao resetar os dados.');
    }
  };
  
  const handleResetStatistics = () => {
    try {
      const success = resetAllStatistics();
      if (success) {
        toast.success('Estatísticas reinicializadas com sucesso!');
        // Recarregar a página após um breve delay para atualizar os dados
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error('Erro ao reinicializar estatísticas');
      }
    } catch (error) {
      console.error('Erro ao reinicializar estatísticas:', error);
      toast.error('Erro ao reinicializar estatísticas');
    }
  };

  const handleResetVisualStats = () => {
    try {
      const success = resetVisualStatistics();
      if (success) {
        toast.success('Estatísticas visuais reinicializadas!');
        // Recarregar a página após um breve delay para atualizar os dados
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error('Erro ao reinicializar estatísticas visuais');
      }
    } catch (error) {
      console.error('Erro ao reinicializar estatísticas visuais:', error);
      toast.error('Erro ao reinicializar estatísticas visuais');
    }
  };

  const handleSyncData = () => {
    syncData();
  };
  
  const getLastSyncText = () => {
    if (!lastSyncTime) return 'Nunca';
    
    const date = new Date(lastSyncTime);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadSettings} className="gap-1">
            <RefreshCwIcon size={14} />
            <span>Atualizar</span>
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="company">Dados da Empresa</TabsTrigger>
              <TabsTrigger value="fiscalApi">API Fiscal</TabsTrigger>
              <TabsTrigger value="system">Sistema</TabsTrigger>
            </TabsList>
            
            <TabsContent value="company" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Empresa</CardTitle>
                  <CardDescription>
                    Estes dados serão utilizados em relatórios, notas fiscais e outros documentos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da Empresa</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={companyData.name} 
                        onChange={handleCompanyDataChange} 
                        placeholder="Paulo Cell Assistência Técnica"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpfCnpj">CNPJ</Label>
                      <Input 
                        id="cpfCnpj" 
                        name="cpfCnpj" 
                        value={companyData.cpfCnpj} 
                        onChange={handleCompanyDataChange} 
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        value={companyData.phone} 
                        onChange={handleCompanyDataChange} 
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        value={companyData.email} 
                        onChange={handleCompanyDataChange} 
                        placeholder="contato@paulocell.com.br"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input 
                      id="address" 
                      name="address" 
                      value={companyData.address} 
                      onChange={handleCompanyDataChange} 
                      placeholder="Rua Exemplo, 123 - Centro - Cidade/UF"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea 
                      id="notes" 
                      name="notes" 
                      value={companyData.notes} 
                      onChange={handleCompanyDataChange} 
                      placeholder="Adicione qualquer observação relevante sobre a empresa"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveCompanyData}>Salvar Alterações</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="fiscalApi" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de API para Notas Fiscais</CardTitle>
                  <CardDescription>
                    Configure a integração com serviços de emissão de documentos fiscais.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Credenciais de API</h3>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="apiKey">Chave de API (API Key)</Label>
                        <Input 
                          id="apiKey" 
                          name="apiKey" 
                          type="password" 
                          value={apiSettings.apiKey} 
                          onChange={handleApiSettingsChange} 
                          placeholder="Sua chave de API"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="companyId">ID da Empresa</Label>
                        <Input 
                          id="companyId" 
                          name="companyId" 
                          value={apiSettings.companyId} 
                          onChange={handleApiSettingsChange} 
                          placeholder="Digite o ID da sua empresa (se necessário)"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Ambiente</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="sandbox"
                          name="environment"
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                          checked={apiSettings.environment === 'sandbox'}
                          onChange={() => handleApiEnvironmentChange('sandbox')}
                        />
                        <Label htmlFor="sandbox">Sandbox (Testes)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="production"
                          name="environment"
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                          checked={apiSettings.environment === 'production'}
                          onChange={() => handleApiEnvironmentChange('production')}
                        />
                        <Label htmlFor="production">Produção</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveApiSettings}>Salvar Configurações</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dados do Sistema</CardTitle>
                  <CardDescription>
                    Gerencie o backup e restauração dos dados do sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-6">
                    <div className="flex flex-col space-y-4">
                      <h3 className="text-md font-medium">Backup e Restauração</h3>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <Card className="p-4 border-dashed">
                          <div className="flex flex-col h-full justify-between">
                            <div>
                              <h4 className="font-medium">Resetar Banco de Dados</h4>
                              <p className="text-sm text-muted-foreground mt-2 text-red-600">
                                CUIDADO: Esta ação apagará todos os dados do sistema (clientes, dispositivos, serviços e estoque). Esta ação não pode ser desfeita.
                              </p>
                            </div>
                            <Button 
                              variant="destructive" 
                              className="mt-4 gap-2" 
                              onClick={() => setIsResettingDatabase(true)}
                            >
                              <TrashIcon size={16} />
                              <span>Resetar Dados</span>
                            </Button>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
        
        {!isApiConnected && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">
              Você está offline. Algumas funcionalidades podem estar limitadas.
              As configurações serão salvas localmente e sincronizadas quando houver conexão.
            </p>
          </div>
        )}
      </motion.div>
      
      {/* Reset Database Dialog */}
      <AlertDialog open={isResettingDatabase} onOpenChange={setIsResettingDatabase}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá apagar <strong>todos</strong> os seus dados, incluindo clientes, dispositivos, serviços e estoque.
              <br /><br />
              Esta ação <strong>não pode ser desfeita</strong>. Recomendamos fazer um backup antes de prosseguir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleContinueToPasswordConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, resetar todos os dados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Password Confirmation Dialog */}
      <AlertDialog open={isPasswordConfirmOpen} onOpenChange={setIsPasswordConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de Segurança</AlertDialogTitle>
            <AlertDialogDescription>
              Para confirmar a exclusão de todos os dados, copie a dica de senha abaixo e cole-a no campo de confirmação.
              <div className="mt-4 p-3 bg-muted rounded-md font-medium text-center">
                MilenaeNicolas
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password-confirm">Cole a dica de senha aqui:</Label>
              <Input
                id="password-confirm"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Digite a senha exatamente como mostrada"
              />
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setPasswordInput('');
              setPasswordError('');
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePasswordConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={!passwordInput}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ServerIcon size={20} className="text-primary" />
            <CardTitle>Sincronização de Dados</CardTitle>
          </div>
          <CardDescription>
            Gerencie a sincronização entre dados locais e o servidor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Status do Servidor</Label>
                <span className="flex items-center gap-1">
                  {isApiConnected ? (
                    <>
                      <CheckIcon size={16} className="text-green-500" />
                      <span className="text-sm text-green-500">Conectado</span>
                    </>
                  ) : (
                    <>
                      <AlertCircleIcon size={16} className="text-red-500" />
                      <span className="text-sm text-red-500">Desconectado</span>
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <Label>Última Sincronização</Label>
                <span className="text-sm text-muted-foreground">{getLastSyncText()}</span>
              </div>
            </div>
            
            <div className="flex flex-col justify-end space-y-2">
              <Button 
                onClick={handleSyncData} 
                disabled={!isApiConnected || isSyncing}
                className="mt-4"
              >
                {isSyncing ? (
                  <>
                    <RefreshCwIcon size={16} className="mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCwIcon size={16} className="mr-2" />
                    Sincronizar Dados com Servidor
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {isApiConnected 
                  ? 'Clique para sincronizar os dados locais com o servidor'
                  : 'Conecte-se ao servidor para sincronizar os dados'}
              </p>
            </div>
          </div>
          
          <div className="border rounded-md p-3 bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Sobre sincronização de dados:</h4>
            <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4">
              <li>Os dados são automaticamente sincronizados quando há conexão com o servidor</li>
              <li>Em caso de conflito, os dados do servidor têm precedência</li>
              <li>Sincronização manual pode ser útil após trabalhar em modo offline</li>
              <li>Em modo offline, seus dados são armazenados localmente no navegador</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Settings;
