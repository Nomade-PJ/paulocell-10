
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        <h1 className="mb-4 text-4xl font-bold text-red-500">404</h1>
        <h2 className="mb-6 text-2xl font-semibold">Página não encontrada</h2>
        <p className="mb-6 text-gray-600">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link 
          to="/" 
          className="inline-block rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
        >
          Voltar para o início
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
