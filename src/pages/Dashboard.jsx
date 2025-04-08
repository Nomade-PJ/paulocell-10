
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    // O redirecionamento será tratado pelo AuthProvider
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            <div>
              <span className="mr-4">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Bem-vindo ao Sistema Paulo Cell</h2>
            <p>Esta é a versão inicial do dashboard. Funcionalidades serão adicionadas conforme o desenvolvimento avança.</p>
            
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-blue-100 p-4 rounded shadow">
                <h3 className="text-lg font-medium">Clientes</h3>
                <p className="text-3xl font-bold mt-2">0</p>
              </div>
              
              <div className="bg-green-100 p-4 rounded shadow">
                <h3 className="text-lg font-medium">Serviços</h3>
                <p className="text-3xl font-bold mt-2">0</p>
              </div>
              
              <div className="bg-yellow-100 p-4 rounded shadow">
                <h3 className="text-lg font-medium">Produtos</h3>
                <p className="text-3xl font-bold mt-2">0</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
