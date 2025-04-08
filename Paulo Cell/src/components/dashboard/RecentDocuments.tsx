
import React from 'react';
import { ArrowRightIcon, FileTextIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface RecentDocumentsProps {
  documents: any[];
}

const RecentDocuments: React.FC<RecentDocumentsProps> = ({ documents }) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Documentos Recentes</h2>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate('/documents')}>
          <span>Ver todos</span>
          <ArrowRightIcon size={16} />                  
        </Button>
      </div>
      
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Documentos Fiscais</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">NF-e: {documents.filter(d => d.type === 'nfe').length}</span>
            <span className="text-xs text-muted-foreground">NFC-e: {documents.filter(d => d.type === 'nfce').length}</span>
            <span className="text-xs text-muted-foreground">NFS-e: {documents.filter(d => d.type === 'nfse').length}</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground mb-3">
          <span className="font-medium">{documents.length}</span> Total
        </div>
        <div className="text-xs text-muted-foreground mb-1">Valor Total</div>
        <div className="text-lg font-semibold mb-3">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(documents.reduce((sum, doc) => sum + doc.value, 0))}
        </div>
        
        <div className="border-t border-border pt-3 space-y-2">
          <div className="text-xs text-muted-foreground mb-1">Documentos Recentes</div>
          {documents && documents.length > 0 ? (
            documents.slice(0, 1).map((document) => (
              <div key={document.id} onClick={() => navigate(`/documents/${document.id}`)} 
                   className="flex justify-between items-center cursor-pointer hover:bg-muted/50 p-2 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <FileTextIcon size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {document.type.toUpperCase()} - {document.number}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(document.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(document.value)}
                  </div>
                  <div className={`text-xs px-2 py-0.5 rounded-full ${document.status === 'Emitida' ? 'bg-green-100 text-green-700' : document.status === 'Cancelada' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {document.status}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <p className="text-muted-foreground mb-2 text-sm">Nenhum documento cadastrado</p>
              <Button size="sm" onClick={() => navigate('/documents/new', { state: { documentType: 'nfe' } })}>Cadastrar Documento</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentDocuments;
