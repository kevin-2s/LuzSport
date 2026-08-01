import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField } from '../../components/molecules/FormField';
import { Button } from '../../components/atoms/Button';
import { useSessionStore } from '../../store/sessionStore';
import api from '../../services/api';
import { ShoppingBag, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setSession = useSessionStore((state) => state.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      setSession(user, token);
      
      if (user.rol === 'SUPERADMIN') {
        navigate('/superadmin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-slate-50">
      {/* Left panel (visual, hidden on small screens) */}
      <div className="hidden md:flex flex-col justify-between bg-brand-500 text-white p-12 relative overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-brand-600/50 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-500/20 blur-3xl"></div>

        <div className="flex items-center gap-2.5 z-10">
          <ShoppingBag className="h-8 w-8 text-accent-400" />
          <span className="font-extrabold text-2xl tracking-wider">LUZSPORT</span>
        </div>

        <div className="space-y-4 z-10 max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight">
            Control de Inventario y Ventas a tu alcance.
          </h1>
          <p className="text-brand-100 text-base leading-relaxed font-light">
            Gestiona de forma inteligente el inventario por tallas, mantén el control de tus ventas y lleva un seguimiento exacto de los clientes fiados.
          </p>
        </div>

        <div className="text-xs text-brand-200 z-10">
          &copy; {new Date().getFullYear()} LuzSport. Todos los derechos reservados.
        </div>
      </div>

      {/* Right panel (Form) */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-center">
            {/* Logo shown on mobile */}
            <div className="flex items-center justify-center gap-2 md:hidden mb-6">
              <ShoppingBag className="h-8 w-8 text-brand-500" />
              <span className="font-extrabold text-2xl tracking-wider text-slate-800">LUZSPORT</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Bienvenido</h2>
            <p className="text-sm text-slate-500 mt-1">Ingresa tus credenciales para acceder al sistema</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-2.5 text-sm">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField
              label="Correo Electrónico"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@luzsport.com"
              required
            />

            <FormField
              label="Contraseña"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Iniciar Sesión
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
