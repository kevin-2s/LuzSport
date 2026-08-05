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
  const [subcategoria, setSubcategoria] = useState('Camisa'); // Solo se usa si categoria es 'Ropa'
  const [color, setColor] = useState('');
  const [precio, setPrecio] = useState('');
  const zapatosDefaultTallas = Array.from({ length: 10 }, (_, i) => ({
    talla: (36 + i).toString(),
    cantidad: '',
    stockMinimo: ''
  }));

  const [tallas, setTallas] = useState<{ talla: string; cantidad: string; stockMinimo: string }[]>(zapatosDefaultTallas);
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

    const isSingleSize = categoria === 'Accesorios' || (categoria === 'Ropa' && subcategoria === 'Camisa');

    // Validations
    let tallasToSubmit = tallas;
    
    if (!isSingleSize) {
      if (tallasToSubmit.length === 0) {
        setError('Por favor ingresa al menos una talla.');
        return;
      }
      
      if (tallasToSubmit.some((t) => !t.talla.trim())) {
        setError('Asegúrate de llenar el nombre/número de todas las tallas ingresadas.');
        return;
      }
    }

    try {
      const formattedTallas = tallasToSubmit.map((t) => ({
        talla: isSingleSize ? 'U' : t.talla.trim(),
        cantidad: t.cantidad === '' ? 0 : parseInt(t.cantidad, 10),
        stockMinimo: t.stockMinimo === '' ? 0 : parseInt(t.stockMinimo, 10),
      }));

      await onSubmit({
        nombre: nombre.trim(),
        categoria,
        color: categoria === 'Accesorios' ? 'N/A' : color.trim(),
        precio: parseFloat(precio),
        tallas: formattedTallas,
      });

      // Clear state
      setNombre('');
      setCategoria('Zapatos');
      setSubcategoria('Camisa');
      setColor('');
      setPrecio('');
      setTallas(zapatosDefaultTallas);
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
                onChange={(e) => {
                  const val = e.target.value;
                  setCategoria(val);
                  if (val === 'Accesorios' || (val === 'Ropa' && subcategoria === 'Camisa')) {
                    setTallas([{ talla: 'U', cantidad: '', stockMinimo: '' }]);
                  } else if (val === 'Zapatos') {
                    setTallas(Array.from({ length: 10 }, (_, i) => ({
                      talla: (36 + i).toString(),
                      cantidad: '',
                      stockMinimo: ''
                    })));
                  } else {
                    setTallas([{ talla: '', cantidad: '', stockMinimo: '' }]);
                  }
                }}
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

          {categoria === 'Ropa' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="subcategoria" className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  Tipo de Ropa
                </label>
                <select
                  id="subcategoria"
                  value={subcategoria}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSubcategoria(val);
                    if (val === 'Camisa') {
                      setTallas([{ talla: 'U', cantidad: '', stockMinimo: '' }]);
                    } else {
                      setTallas([{ talla: '', cantidad: '', stockMinimo: '' }]);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-border text-sm transition-all duration-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 text-neutral-textPrimary"
                  disabled={isLoading}
                >
                  <option value="Camisa">Camisa (Talla Única / General)</option>
                  <option value="Jeans">Jeans (Varias Tallas)</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categoria !== 'Accesorios' ? (
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
            ) : (
              <div className="hidden sm:block"></div>
            )}

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

          {/* Conditional Stock / Tallas Section */}
          {categoria === 'Accesorios' || (categoria === 'Ropa' && subcategoria === 'Camisa') ? (
            /* Stock Inputs for Accesorios and Camisas (No sizes) */
            <div className="border-t border-neutral-border pt-4 space-y-3 shrink-0">
              <h4 className="text-xs font-bold text-slate-700 tracking-wide uppercase">Cantidad de stock</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cantidad" className="text-xs font-semibold text-slate-600">
                    Stock Disponible
                  </label>
                  <input
                    id="cantidad"
                    type="number"
                    placeholder="Ej: 15"
                    value={tallas[0]?.cantidad || ''}
                    onChange={(e) => handleTallaChange(0, 'cantidad', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-neutral-textPrimary"
                    min="0"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="stockMinimo" className="text-xs font-semibold text-slate-600">
                    Mínimo de Alerta
                  </label>
                  <input
                    id="stockMinimo"
                    type="number"
                    placeholder="Ej: 3"
                    value={tallas[0]?.stockMinimo || ''}
                    onChange={(e) => handleTallaChange(0, 'stockMinimo', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-neutral-textPrimary"
                    min="0"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Tallas Grid for Shoes and Clothing */
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
                  <div key={index} className="flex items-center gap-2 animate-in fade-in duration-200">
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
          )}

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
