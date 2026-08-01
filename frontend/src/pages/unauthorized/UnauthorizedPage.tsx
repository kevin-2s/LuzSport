import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/atoms/Button';
import { useSessionStore } from '../../store/sessionStore';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSessionStore();

  const handleBack = () => {
    if (!user) {
      navigate('/login');
    } else if (user.rol === 'SUPERADMIN') {
      navigate('/superadmin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-9xl font-extrabold text-brand-500 tracking-widest">403</h1>
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold inline-block">
          Acceso Denegado
        </div>
        <p className="text-slate-600">
          No tienes permisos para acceder a esta sección. Si crees que esto es un error, por favor contacta al administrador del sistema.
        </p>
        <Button onClick={handleBack} variant="outline" className="mx-auto">
          Volver al Inicio
        </Button>
      </div>
    </div>
  );
};
