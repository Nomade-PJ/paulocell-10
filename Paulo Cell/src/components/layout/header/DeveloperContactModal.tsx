
import React from 'react';
import { Mail, Phone, Github } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeveloperContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeveloperContactModal: React.FC<DeveloperContactModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const handleEmailContact = () => {
    window.open('mailto:josecarlosdev24h@gmail.com', '_blank');
  };

  const handleWhatsAppContact = () => {
    window.open('https://wa.me/5598992022352', '_blank');
  };
  
  const handleGithubContact = () => {
    window.open('https://github.com/Nomade-PJ', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contato com o Desenvolvedor</DialogTitle>
          <DialogDescription>
            Entre em contato com o desenvolvedor do projeto.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4 p-3 border rounded-md hover:bg-muted/50 cursor-pointer" onClick={handleEmailContact}>
            <Mail className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">josecarlosdev24h@gmail.com</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 border rounded-md hover:bg-muted/50 cursor-pointer" onClick={handleWhatsAppContact}>
            <Phone className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium">WhatsApp</p>
              <p className="text-sm text-muted-foreground">(98) 99202-2352</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 border rounded-md hover:bg-muted/50 cursor-pointer" onClick={handleGithubContact}>
            <Github className="h-6 w-6 text-gray-800" />
            <div>
              <p className="font-medium">GitHub</p>
              <p className="text-sm text-muted-foreground">Nomade-PJ</p>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            ©Todos os direitos reserved - NomadePJ/jose Carlos
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeveloperContactModal;
