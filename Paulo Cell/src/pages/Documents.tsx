import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search as SearchIcon,
  Plus as PlusIcon,
  Pencil as EditIcon,
  Trash as TrashIcon,
  RefreshCw as RefreshIcon,
  Eye as ViewIcon,
  Printer as PrintIcon,
  Mail as EmailIcon
} from 'lucide-react';

import MainLayout from '../components/layout/MainLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { DocumentAPI } from '../lib/api-service';
import { useConnection } from '../lib/ConnectionContext';

// Tipos
interface Document {
  id: string;
  date: string;
  customer?: {
    id: string;
    name: string;
  };
  description: string;
  totalValue: number;
  status: DocumentStatus;
  invoiceId?: string;
}

type DocumentStatus = 'Em Aberto' | 'Paga' | 'Cancelada' | 'Vencida';

// Cores para os status
const statusColors: Record<DocumentStatus, string> = {
  'Em Aberto': 'warning',
  'Paga': 'success',
  'Cancelada': 'destructive',
  'Vencida': 'destructive'
};

// Filtros disponíveis para status
const statusFilters: DocumentStatus[] = ['Em Aberto', 'Paga', 'Cancelada', 'Vencida'];

// Função auxiliar para formatar moeda
const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const navigate = useNavigate();
  const { isApiConnected } = useConnection();

  // Função para carregar documentos
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await DocumentAPI.getAll();
      setDocuments(data);
      
      // Notificar o componente que os dados foram carregados da API
      window.dispatchEvent(new CustomEvent('documentsLoaded', { 
        detail: { source: 'api', count: data.length } 
      }));
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast.error('Não foi possível carregar os documentos');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrar documentos quando mudar o termo de busca ou filtro de status
  useEffect(() => {
    let results = [...documents];
    
    // Aplicar filtro de status
    if (statusFilter) {
      results = results.filter(doc => doc.status === statusFilter);
    }
    
    // Aplicar filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(doc => 
        doc.customer?.name?.toLowerCase().includes(term) ||
        doc.id?.toLowerCase().includes(term) ||
        doc.description?.toLowerCase().includes(term) ||
        (doc.invoiceId && doc.invoiceId.toLowerCase().includes(term))
      );
    }
    
    setFilteredDocuments(results);
  }, [documents, searchTerm, statusFilter]);

  // Carregar documentos inicialmente e configurar listener para atualizações
  useEffect(() => {
    loadDocuments();
    
    // Listener para atualizar quando documentos forem alterados em outros componentes
    const handleDocumentUpdated = (event: CustomEvent) => {
      const { document: updatedDoc } = event.detail;
      
      setDocuments(prevDocs => 
        prevDocs.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc)
      );
    };
    
    // Configurar listeners para eventos de atualização
    window.addEventListener('documentUpdated', handleDocumentUpdated as EventListener);
    window.addEventListener('documentCreated', loadDocuments as EventListener);
    
    return () => {
      window.removeEventListener('documentUpdated', handleDocumentUpdated as EventListener);
      window.removeEventListener('documentCreated', loadDocuments as EventListener);
    };
  }, [loadDocuments]);

  // Função para confirmar exclusão de um documento
  const confirmDelete = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  // Função para excluir documento
  const handleDelete = async () => {
    if (!documentToDelete) return;
    
    try {
      setLoading(true);
      await DocumentAPI.delete(documentToDelete.id);
      
      // Atualizar estado local
      setDocuments(prev => prev.filter(doc => doc.id !== documentToDelete.id));
      toast.success('Documento excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast.error('Erro ao excluir documento');
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Documentos</h1>
            <p className="text-muted-foreground">Gerencie seus documentos e faturas</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={loadDocuments}
              disabled={loading || !isApiConnected}
            >
              <RefreshIcon size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Carregando...' : 'Atualizar'}
            </Button>
            <Button 
              className="gap-2" 
              onClick={() => navigate('/documents/new')}
              disabled={!isApiConnected}
            >
              <PlusIcon size={16} />
              Novo Documento
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {statusFilters.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isApiConnected && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-md">
            <p className="text-amber-800 text-sm">
              Você está offline. Algumas operações podem não estar disponíveis.
            </p>
          </div>
        )}

        <Card>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum documento encontrado</p>
              <Button 
                onClick={() => navigate('/documents/new')}
                disabled={!isApiConnected}
              >
                Criar Novo Documento
              </Button>
            </div>
          ) : (
            <div className="p-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        {doc.date ? format(new Date(doc.date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                      </TableCell>
                      <TableCell>{doc.customer?.name || 'Cliente não encontrado'}</TableCell>
                      <TableCell>{doc.description}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(doc.totalValue)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          statusColors[doc.status] === 'success' ? 'default' :
                          statusColors[doc.status] === 'warning' ? 'outline' :
                          'destructive'
                        }>
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/documents/${doc.id}`)}
                            title="Visualizar"
                          >
                            <ViewIcon size={16} />
                          </Button>
                          
                          {doc.status !== 'Cancelada' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/documents/${doc.id}`, { state: { openEditMode: true } })}
                              title="Editar"
                              disabled={!isApiConnected}
                            >
                              <EditIcon size={16} />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/documents/${doc.id}/print`)}
                            title="Imprimir"
                          >
                            <PrintIcon size={16} />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/documents/${doc.id}/email`)}
                            title="Enviar por Email"
                            disabled={!isApiConnected}
                          >
                            <EmailIcon size={16} />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete(doc)}
                            title="Excluir"
                            disabled={!isApiConnected}
                            className="text-destructive hover:text-destructive"
                          >
                            <TrashIcon size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </motion.div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Documents;
