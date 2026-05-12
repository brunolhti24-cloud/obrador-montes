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
import { Package, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const CATEGORIES = ['CERDO', 'RES', 'BORREGO', 'MARISCOS', 'POLLO', 'PAPAS', 'VARIOS'];

const empty = { name: '', description: '', category: 'RES', price: '', in_stock: true, image_url: '', ingredient: '' };

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
  const openEdit = (p) => { setEditing(p); setForm({ ...p }); setOpen(true); };
  const handleSave = () => saveMutation.mutate({ ...form, price: parseFloat(form.price) || 0 });

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
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar productos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-11 font-body h-12 bg-black/50 border-white/10 focus-visible:ring-accent rounded-xl text-foreground" />
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl bg-white/5" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="glass-panel rounded-2xl border border-white/5 px-5 py-4 flex items-center gap-5 hover:border-white/20 transition-all duration-300"
            >
              <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black">
                <img
                  src={p.image_url || 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=60&h=60&fit=crop'}
                  alt={p.name}
                  className="w-full h-full object-cover opacity-80"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=60&h=60&fit=crop'; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-base truncate text-foreground">{p.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10px] text-muted-foreground font-body uppercase tracking-widest">{p.category}</p>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <p className="text-xs text-accent font-bold font-body">${p.price}/kg</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold border ${p.in_stock ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {p.in_stock ? 'En stock' : 'Agotado'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-colors" onClick={() => openEdit(p)}>
                  <Pencil className="w-4 h-4 text-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 transition-colors"
                  onClick={() => deleteMutation.mutate(p.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-background border border-white/10 shadow-2xl glass-panel">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl gold-gradient-text">{editing ? 'Editar Corte Exclusivo' : 'Añadir Nuevo Corte'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1 block">Nombre *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-black/50 border-white/10 focus-visible:ring-accent font-body text-foreground rounded-lg" />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1 block">Categoría</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger className="bg-black/50 border-white/10 focus:ring-accent font-body text-foreground rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-background border-white/10 text-foreground">
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1 block">Precio (MXN/kg)</Label>
                <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="bg-black/50 border-white/10 focus-visible:ring-accent font-body text-foreground rounded-lg" />
              </div>
              <div className="col-span-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1 block">Descripción</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-black/50 border-white/10 focus-visible:ring-accent font-body text-foreground rounded-lg resize-none" rows={3} />
              </div>
              <div className="col-span-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1 block">URL de imagen (Alta Resolución)</Label>
                <Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="bg-black/50 border-white/10 focus-visible:ring-accent font-body text-foreground rounded-lg" placeholder="https://..." />
              </div>
              <div className="col-span-2 flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                <Switch checked={form.in_stock} onCheckedChange={v => setForm({ ...form, in_stock: v })} />
                <Label className="text-xs font-body font-semibold text-foreground">Producto Disponible para Venta</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-white/5 pt-4">
            <Button variant="ghost" onClick={() => setOpen(false)} className="font-body text-muted-foreground hover:text-white">Cancelar</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending || !form.name}
              className="font-body font-bold text-black ml-2" style={{ background: 'linear-gradient(135deg, #FCF6BA, #B38728)' }}>
              {saveMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}