
import React from 'react';
import { LogOutIcon, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage } from '@/components/ui/avatar';

interface UserMenuProps {
  onDeveloperContact: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onDeveloperContact }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white cursor-pointer">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/logo.svg" alt="Logo" className="p-0" />
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDeveloperContact} className="cursor-pointer">
          <Mail className="mr-2 h-4 w-4" />
          <span>Desenvolvedor</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 hover:text-red-700">
          <LogOutIcon className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
