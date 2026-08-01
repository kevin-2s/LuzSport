import React from 'react';
import { useSessionStore } from '../../store/sessionStore';
import { Button } from '../../components/atoms/Button';
import { LogOut, ShoppingBag, Users, Layers, Award } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, clearSession } = useSessionStore();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-brand-500 text-white shadow-md py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-accent-400" />
          <span className="font-extrabold text-xl tracking-wider">LUZSPORT</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{user?.email}</p>
            <p className="text-xs text-brand-200">Sucursal ID: {user?.tiendaId}</p>
          </div>
          <Button
            onClick={clearSession}
            variant="outline"
            className="border-brand-400 text-white hover:bg-brand-600 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">¡Bienvenido a LuzSport!</h1>
            <p className="text-slate-500 text-sm mt-1">
              Aquí puedes gestionar el inventario, registrar ventas y administrar los fiados de tu sucursal.
            </p>
          </div>
          <div className="bg-accent-50 text-accent-700 px-4 py-3 rounded-lg border border-accent-100 flex items-center gap-2">
            <Award className="h-5 w-5 text-accent-500" />
            <span className="text-sm font-semibold">Sesión activa como Sucursal</span>
          </div>
        </div>

        {/* Dashboard Grid Mock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="bg-brand-50 p-3 rounded-lg text-brand-500">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Inventario</h3>
              <p className="text-slate-400 text-xs mt-1">Consulta y actualiza tu stock por talla.</p>
              <p className="text-2xl font-bold text-brand-600 mt-2">-- artículos</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Ventas Hoy</h3>
              <p className="text-slate-400 text-xs mt-1">Registra nuevas ventas y mira tus ingresos.</p>
              <p className="text-2xl font-bold text-emerald-600 mt-2">$0.00</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="bg-amber-50 p-3 rounded-lg text-amber-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Clientes & Fiados</h3>
              <p className="text-slate-400 text-xs mt-1">Controla las cuentas por cobrar y abonos.</p>
              <p className="text-2xl font-bold text-amber-600 mt-2">-- fiadores</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
