import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Package, Plus, Pencil, Trash2, Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const CATEGORIES = ['CERDO', 'RES', 'BORREGO', 'MARISCOS', 'POLLO', 'PAPAS', 'VARIOS'];

const empty = { 
  name: '', 
  description: '', 
  category: 'RES', 
  price: '', 
  wholesale_price: '', 
  in_stock: true, 
  image_url: '', 
  ingredient: '',
  stock: 100,      // Default 100kg
  min_stock: 10    // Alert at 10kg
};

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date', 300),
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editing ? base44.entities.Product.update(editing.id, data) : base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(editing ? 'Producto actualizado' : 'Producto creado');
      setOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto eliminado');
    },
  });

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...empty, ...p }); setOpen(true); };
  const handleSave = () => saveMutation.mutate({ 
    ...form, 
    price: parseFloat(form.price) || 0,
    wholesale_price: parseFloat(form.wholesale_price) || 0,
    stock: parseFloat(form.stock as any) || 0,
    min_stock: parseFloat(form.min_stock as any) || 0
  });

  const filtered = products.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #FCF6BA, #B38728)' }}>
            <Package className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Catálogo de Productos</h1>
            <p className="text-xs text-muted-foreground font-body uppercase tracking-widest mt-1">{products.length} productos registrados</p>
          </div>
        </div>
        <Button onClick={openNew} className="font-body gap-2 font-bold text-black hover:scale-105 transition-transform" style={{ background: 'linear-gradient(135deg, #FCF6BA, #B38728)' }}>
          <Plus className="w-4 h-4" /> Nuevo Producto
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Buscar productos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-11 font-body h-12 bg-white border-slate-200 focus-visible:ring-primary rounded-xl text-slate-900 shadow-sm" />
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl bg-slate-100" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p, idx) => {
            const isLowStock = (p.stock || 0) <= (p.min_stock || 10);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={`bg-white rounded-2xl border ${isLowStock ? 'border-red-200 shadow-red-50 shadow-lg' : 'border-slate-100'} px-5 py-4 flex items-center gap-5 hover:shadow-md transition-all duration-300 shadow-sm`}
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                  <img
                    src={p.image_url || 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=60&h=60&fit=crop'}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as any).src = 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=60&h=60&fit=crop'; }}
                  />
                  {isLowStock && (
                    <div className="absolute inset-0 bg-red-600/10 flex items-center justify-center">
                       <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-base truncate text-slate-900">{p.name}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <p className="text-[10px] text-slate-400 font-body uppercase tracking-widest font-bold">{p.category}</p>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <p className="text-xs text-primary font-bold font-body">${p.price}/kg</p>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <p className={`text-xs font-bold font-body ${isLowStock ? 'text-red-600' : 'text-slate-500'}`}>
                       Inventario: {p.stock || 0}kg
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  {p.stock <= 0 ? (
                    <span className="text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold border bg-red-50 text-red-600 border-red-200">
                      Agotado
                    </span>
                  ) : isLowStock ? (
                    <span className="text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold border bg-amber-50 text-amber-600 border-amber-200">
                      Stock Bajo
                    </span>
                  ) : (
                    <span className="text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold border bg-green-50 text-green-600 border-green-200">
                      En stock
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <Button variant="ghost" size="icon" className="h-9 w-9 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg transition-colors" onClick={() => openEdit(p)}>
                    <Pencil className="w-4 h-4 text-slate-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg text-red-600 transition-colors"
                    onClick={() => { if(confirm('¿Eliminar este producto?')) deleteMutation.mutate(p.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-white border border-slate-200 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-slate-900">{editing ? 'Editar Corte Exclusivo' : 'Añadir Nuevo Corte'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1 block">Nombre *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-slate-50 border-slate-200 focus-visible:ring-primary font-body text-slate-900 rounded-xl" />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1 block">Precio Normal (kg)</Label>
                <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="bg-slate-50 border-slate-200 focus-visible:ring-primary font-body text-slate-900 rounded-xl" />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-widest text-amber-600 font-bold mb-1 block">Precio Mayoreo (40kg)</Label>
                <Input type="number" value={form.wholesale_price} onChange={e => setForm({ ...form, wholesale_price: e.target.value })} className="bg-amber-50/50 border-amber-100 focus-visible:ring-amber-500 font-body text-slate-900 rounded-xl" />
              </div>
              
              {/* STOCK FIELDS */}
              <div>
                <Label className="text-[10px] uppercase tracking-widest text-blue-600 font-bold mb-1 block">Stock Actual (kg)</Label>
                <Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="bg-blue-50/30 border-blue-100 focus-visible:ring-blue-500 font-body text-slate-900 rounded-xl" />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-widest text-red-600 font-bold mb-1 block">Nivel Crítico (kg)</Label>
                <Input type="number" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: e.target.value })} className="bg-red-50/30 border-red-100 focus-visible:ring-red-500 font-body text-slate-900 rounded-xl" />
              </div>

              <div className="col-span-2">
                <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1 block">Descripción</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-slate-50 border-slate-200 focus-visible:ring-primary font-body text-slate-900 rounded-xl resize-none" rows={2} />
              </div>
              <div className="col-span-2">
                <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1 block">URL de imagen</Label>
                <Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="bg-slate-50 border-slate-200 focus-visible:ring-primary font-body text-slate-900 rounded-xl" />
              </div>
              <div className="col-span-2 flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Switch checked={form.in_stock} onCheckedChange={v => setForm({ ...form, in_stock: v })} />
                <Label className="text-xs font-body font-bold text-slate-700">Producto Disponible para Venta</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-slate-100 pt-4">
            <Button variant="ghost" onClick={() => setOpen(false)} className="font-body text-slate-400 hover:text-slate-900 font-bold">Cancelar</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending || !form.name}
              className="font-body font-bold text-black ml-2 shadow-lg" style={{ background: 'linear-gradient(135deg, #FCF6BA, #B38728)' }}>
              {saveMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}