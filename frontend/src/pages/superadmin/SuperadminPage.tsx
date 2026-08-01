import React from 'react';
import { useSessionStore } from '../../store/sessionStore';
import { Button } from '../../components/atoms/Button';
import { LogOut, ShieldAlert, Store, UserPlus, List } from 'lucide-react';

export const SuperadminPage: React.FC = () => {
  const { user, clearSession } = useSessionStore();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-md py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-red-500" />
          <span className="font-extrabold text-xl tracking-wider">LUZSPORT - ADMINISTRACIÓN</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{user?.email}</p>
            <p className="text-xs text-slate-400">Rol: Administrador</p>
          </div>
          <Button
            onClick={clearSession}
            variant="outline"
            className="border-slate-700 text-white hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="bg-slate-900 text-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Panel de Control General</h1>
            <p className="text-slate-400 text-sm mt-1">
              Aquí puedes crear tiendas/sucursales y asignarles un usuario encargado de la gestión.
            </p>
          </div>
        </div>

        {/* Action Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Branch Box */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-brand-50 p-2.5 rounded-lg text-brand-600">
                <Store className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Nueva Tienda/Sucursal</h2>
            </div>
            <p className="text-slate-500 text-sm">
              Registra una nueva ubicación física para aislar su inventario y transacciones.
            </p>
            <div className="pt-2">
              <Button className="w-full">
                Crear Tienda
              </Button>
            </div>
          </div>

          {/* Create Shop User Box */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-accent-50 p-2.5 rounded-lg text-accent-600">
                <UserPlus className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Nuevo Encargado de Tienda</h2>
            </div>
            <p className="text-slate-500 text-sm">
              Crea una cuenta de usuario y asóciala a una sucursal específica.
            </p>
            <div className="pt-2">
              <Button variant="secondary" className="w-full">
                Registrar Encargado
              </Button>
            </div>
          </div>
        </div>

        {/* Shops list mock */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-slate-50 p-2.5 rounded-lg text-slate-600">
                <List className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Tiendas Existentes</h2>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4 text-center py-8 text-slate-400 text-sm">
            Cargando sucursales desde la base de datos...
          </div>
        </div>
      </main>
    </div>
  );
};
