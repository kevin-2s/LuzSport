import React, { useState } from 'react';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';

interface CreateArticuloModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    nombre: string;
    categoria: string;
    color: string;
    precio: number;
    tallas: { talla: string; cantidad: number; stockMinimo: number }[];
  }) => Promise<void>;
  isLoading: boolean;
}

export const CreateArticuloModal: React.FC<CreateArticuloModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Zapatos');
  const [color, setColor] = useState('');
  const [precio, setPrecio] = useState('');
  const [tallas, setTallas] = useState<{ talla: string; cantidad: string; stockMinimo: string }[]>([
    { talla: '', cantidad: '', stockMinimo: '' },
  ]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddTallaField = () => {
    setTallas([...tallas, { talla: '', cantidad: '', stockMinimo: '' }]);
  };

  const handleRemoveTallaField = (index: number) => {
    if (tallas.length === 1) return;
    setTallas(tallas.filter((_, i) => i !== index));
  };

  const handleTallaChange = (index: number, field: 'talla' | 'cantidad' | 'stockMinimo', value: string) => {
    const newTallas = [...tallas];
    newTallas[index] = { ...newTallas[index], [field]: value };
    setTallas(newTallas);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (tallas.some((t) => !t.talla || t.cantidad === '' || t.stockMinimo === '')) {
      setError('Por favor completa todos los campos de tallas.');
      return;
    }

    try {
      const formattedTallas = tallas.map((t) => ({
        talla: t.talla.trim(),
        cantidad: parseInt(t.cantidad, 10),
        stockMinimo: parseInt(t.stockMinimo, 10),
      }));

      await onSubmit({
        nombre: nombre.trim(),
        categoria,
        color: color.trim(),
        precio: parseFloat(precio),
        tallas: formattedTallas,
      });

      // Clear state
      setNombre('');
      setCategoria('Zapatos');
      setColor('');
      setPrecio('');
      setTallas([{ talla: '', cantidad: '', stockMinimo: '' }]);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocurrió un error al agregar el artículo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-neutral-border flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-border flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-neutral-textPrimary">Agregar Artículo al Inventario</h3>
          <button
            onClick={onClose}
            className="text-neutral-textSecondary hover:text-neutral-textPrimary rounded-lg p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[70vh]">
          {error && (
            <div className="bg-red-50 border border-semantic-danger/20 text-semantic-danger p-3 rounded-lg flex items-start gap-2 text-sm shrink-0">
              <AlertCircle className="h-5 w-5 text-semantic-danger shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Nombre del Artículo"
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Tenis Running Pro"
              required
              disabled={isLoading}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="categoria" className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Categoría
              </label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border text-sm transition-all duration-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 text-neutral-textPrimary"
                required
                disabled={isLoading}
              >
                <option value="Zapatos">Zapatos</option>
                <option value="Ropa">Ropa</option>
                <option value="Accesorios">Accesorios</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Color"
              type="text"
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Ej: Blanco/Azul"
              required
              disabled={isLoading}
            />

            <FormField
              label="Precio de Venta"
              type="number"
              id="precio"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="Ej: 149000"
              required
              min="0"
              disabled={isLoading}
            />
          </div>

          {/* Tallas Grid */}
          <div className="border-t border-neutral-border pt-4 space-y-3 shrink-0">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-700 tracking-wide uppercase">Tallas y Stock</h4>
              <button
                type="button"
                onClick={handleAddTallaField}
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                Añadir Talla
              </button>
            </div>

            <div className="space-y-2">
              {tallas.map((t, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-[30%]">
                    <input
                      type="text"
                      placeholder="Talla (ej: 42)"
                      value={t.talla}
                      onChange={(e) => handleTallaChange(index, 'talla', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 text-neutral-textPrimary"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="w-[30%]">
                    <input
                      type="number"
                      placeholder="Stock"
                      value={t.cantidad}
                      onChange={(e) => handleTallaChange(index, 'cantidad', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 text-neutral-textPrimary"
                      required
                      min="0"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="w-[30%]">
                    <input
                      type="number"
                      placeholder="Min Alerta"
                      value={t.stockMinimo}
                      onChange={(e) => handleTallaChange(index, 'stockMinimo', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 text-neutral-textPrimary"
                      required
                      min="0"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTallaField(index)}
                    disabled={tallas.length === 1 || isLoading}
                    className="p-2 text-slate-400 hover:text-semantic-danger rounded-lg transition-colors disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-4 border-t border-neutral-border shrink-0">
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
              variant="primary"
            >
              Guardar Artículo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
