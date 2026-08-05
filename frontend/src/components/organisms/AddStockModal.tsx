import { useState } from 'react';
import { Button } from '../atoms/Button';
import { X, Plus, Package } from 'lucide-react';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cantidad: number) => Promise<void>;
  isLoading: boolean;
  talla: string;
  articuloNombre: string;
}

export const AddStockModal: React.FC<AddStockModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  talla,
  articuloNombre
}) => {
  const [cantidad, setCantidad] = useState<number | ''>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cantidad || cantidad <= 0) return;
    
    await onSubmit(Number(cantidad));
    setCantidad('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl border border-neutral-border p-6 space-y-5 animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-neutral-textPrimary tracking-tight">Añadir Stock</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full p-1.5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
          <Package className="h-8 w-8 text-slate-400" />
          <div>
            <p className="text-sm font-bold text-neutral-textPrimary">{articuloNombre}</p>
            <p className="text-xs text-neutral-textSecondary font-semibold">Talla: <span className="text-primary">T{talla}</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              Cantidad a añadir
            </label>
            <input
              type="number"
              min="1"
              required
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full px-4 py-3 bg-white border border-neutral-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-neutral-textPrimary text-lg font-bold"
              placeholder="Ej: 10"
              autoFocus
            />
            <p className="text-[10px] text-neutral-textSecondary">
              Esta cantidad se sumará al stock actual.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="!px-5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !cantidad || cantidad <= 0}
              className="!px-5 flex items-center gap-2"
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Añadir
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
