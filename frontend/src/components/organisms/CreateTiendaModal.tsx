import React, { useState } from 'react';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { X, AlertCircle } from 'lucide-react';

interface CreateTiendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { nombre: string; direccion: string }) => Promise<void>;
  isLoading: boolean;
}

export const CreateTiendaModal: React.FC<CreateTiendaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ nombre, direccion });
      setNombre('');
      setDireccion('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocurrió un error al crear la tienda.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-neutral-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-border flex justify-between items-center">
          <h3 className="text-lg font-bold text-neutral-textPrimary">Nueva Tienda / Sucursal</h3>
          <button
            onClick={onClose}
            className="text-neutral-textSecondary hover:text-neutral-textPrimary rounded-lg p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-semantic-danger/20 text-semantic-danger p-3 rounded-lg flex items-start gap-2 text-sm">
              <AlertCircle className="h-5 w-5 text-semantic-danger shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <FormField
            label="Nombre de la Sucursal"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Sucursal Flores"
            required
            disabled={isLoading}
          />

          <FormField
            label="Dirección"
            id="direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Ej. Av. Rivadavia 1234, CABA"
            required
            disabled={isLoading}
          />

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
            >
              Crear Tienda
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
