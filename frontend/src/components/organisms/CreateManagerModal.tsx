import React, { useState } from 'react';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { X, AlertCircle } from 'lucide-react';
import type { Tienda } from '../../hooks/useTiendas';

interface CreateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { email: string; password: string; tiendaId: string }) => Promise<void>;
  isLoading: boolean;
  tiendas: Tienda[];
}

export const CreateManagerModal: React.FC<CreateManagerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  tiendas,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tiendaId, setTiendaId] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tiendaId) {
      setError('Por favor selecciona una tienda para asociar al encargado.');
      return;
    }

    try {
      await onSubmit({ email, password, tiendaId });
      setEmail('');
      setPassword('');
      setTiendaId('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocurrió un error al registrar al encargado.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-neutral-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-border flex justify-between items-center">
          <h3 className="text-lg font-bold text-neutral-textPrimary">Nuevo Encargado de Tienda</h3>
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
            label="Correo Electrónico"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="encargado@luzsport.com"
            required
            disabled={isLoading}
          />

          <FormField
            label="Contraseña"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            disabled={isLoading}
          />

          {/* Tienda select dropdown */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tiendaId" className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
              Asociar a Tienda/Sucursal
            </label>
            <select
              id="tiendaId"
              value={tiendaId}
              onChange={(e) => setTiendaId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border text-sm transition-all duration-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 text-neutral-textPrimary"
              required
              disabled={isLoading}
            >
              <option value="">Selecciona una tienda...</option>
              {tiendas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} ({t.direccion})
                </option>
              ))}
            </select>
          </div>

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
              variant="secondary"
            >
              Registrar Encargado
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
