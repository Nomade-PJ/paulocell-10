
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Página de carregamento temporária
const LoadingPage = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Carregando...</p>
  </div>
);

// Página de login temporária
const Login = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-100">
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Paulo Cell</h1>
      <p className="text-center">Sistema de gestão para assistência técnica</p>
      <div className="mt-6">
        <button className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
          Entrar
        </button>
      </div>
    </div>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
