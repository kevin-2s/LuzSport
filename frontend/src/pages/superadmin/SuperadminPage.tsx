import React, { useState } from 'react';
import { useSessionStore } from '../../store/sessionStore';
import { Button } from '../../components/atoms/Button';
import { LogOut, ShieldAlert, Store, UserPlus, List, Calendar, MapPin } from 'lucide-react';
import { useTiendas } from '../../hooks/useTiendas';
import { CreateTiendaModal } from '../../components/organisms/CreateTiendaModal';
import { CreateManagerModal } from '../../components/organisms/CreateManagerModal';

export const SuperadminPage: React.FC = () => {
  const { user, clearSession } = useSessionStore();
  const {
    tiendas,
    isLoading,
    createTienda,
    isCreatingTienda,
    createManager,
    isCreatingManager,
  } = useTiendas();

  const [isTiendaOpen, setIsTiendaOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreateTienda = async (data: { nombre: string; direccion: string }) => {
    await createTienda(data);
    showSuccess('Tienda creada exitosamente.');
  };

  const handleCreateManager = async (data: { email: string; password: string; tiendaId: string }) => {
    await createManager(data);
    showSuccess(`Encargado registrado con éxito para la tienda seleccionada.`);
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-md py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" />
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
        {/* Success Alert Banner */}
        {successMessage && (
          <div className="bg-emerald-50 border border-semantic-success/20 text-semantic-success px-4 py-3 rounded-xl flex items-center gap-2.5 text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
            <span className="h-2 w-2 rounded-full bg-semantic-success"></span>
            {successMessage}
          </div>
        )}

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
          <div className="bg-white p-6 rounded-xl border border-neutral-border shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary-light p-2.5 rounded-lg text-primary">
                <Store className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-neutral-textPrimary">Nueva Tienda/Sucursal</h2>
            </div>
            <p className="text-neutral-textSecondary text-sm">
              Registra una nueva ubicación física para aislar su inventario y transacciones.
            </p>
            <div className="pt-2">
              <Button onClick={() => setIsTiendaOpen(true)} className="w-full">
                Crear Tienda
              </Button>
            </div>
          </div>

          {/* Create Shop User Box */}
          <div className="bg-white p-6 rounded-xl border border-neutral-border shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-2.5 rounded-lg text-slate-700">
                <UserPlus className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-neutral-textPrimary">Nuevo Encargado de Tienda</h2>
            </div>
            <p className="text-neutral-textSecondary text-sm">
              Crea una cuenta de usuario y asóciala a una sucursal específica.
            </p>
            <div className="pt-2">
              <Button onClick={() => setIsManagerOpen(true)} variant="secondary" className="w-full">
                Registrar Encargado
              </Button>
            </div>
          </div>
        </div>

        {/* Shops list */}
        <div className="bg-white rounded-xl border border-neutral-border shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 p-2.5 rounded-lg text-neutral-textSecondary">
              <List className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-neutral-textPrimary">Tiendas Existentes</h2>
          </div>

          {isLoading ? (
            <div className="border-t border-neutral-border pt-8 text-center py-8 text-neutral-textSecondary text-sm">
              <span className="loading loading-infinity loading-lg text-primary mx-auto mb-2 block"></span>
              Cargando sucursales desde la base de datos...
            </div>
          ) : tiendas.length === 0 ? (
            <div className="border-t border-neutral-border pt-8 text-center py-12 text-neutral-textSecondary text-sm">
              No hay tiendas creadas en el sistema. Crea una para comenzar.
            </div>
          ) : (
            <div className="overflow-x-auto border-t border-neutral-border pt-4">
              <table className="w-full text-left text-sm text-neutral-textPrimary border-collapse">
                <thead>
                  <tr className="border-b border-neutral-border text-neutral-textSecondary font-semibold">
                    <th className="py-3 px-4">Nombre de la Sucursal</th>
                    <th className="py-3 px-4">Dirección</th>
                    <th className="py-3 px-4">Fecha de Creación</th>
                  </tr>
                </thead>
                <tbody>
                  {tiendas.map((t) => (
                    <tr key={t.id} className="border-b border-neutral-border hover:bg-neutral-bg transition-colors">
                      <td className="py-3 px-4 font-semibold flex items-center gap-2">
                        <Store className="h-4 w-4 text-primary shrink-0" />
                        {t.nombre}
                      </td>
                      <td className="py-3 px-4 text-neutral-textSecondary">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                          {t.direccion}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-textSecondary">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                          {new Date(t.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateTiendaModal
        isOpen={isTiendaOpen}
        onClose={() => setIsTiendaOpen(false)}
        onSubmit={handleCreateTienda}
        isLoading={isCreatingTienda}
      />

      <CreateManagerModal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        onSubmit={handleCreateManager}
        isLoading={isCreatingManager}
        tiendas={tiendas}
      />
    </div>
  );
};
