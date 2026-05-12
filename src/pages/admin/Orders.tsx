import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ClipboardList, Search, RefreshCw, Clock, User, Phone, StickyNote, Mail, AlertCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const statusConfig = {
  pendiente:      { label: 'Pendiente de Pago', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  confirmado:     { label: 'Pago Confirmado',   color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  en_preparacion: { label: 'En Preparación',    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  listo:          { label: 'Listo para Recoger', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  entregado:      { label: 'Entregado',          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  cancelado:      { label: 'Cancelado',          color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const allStatuses = Object.keys(statusConfig);

export default function AdminOrders() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
    refetchInterval: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Order.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Estado actualizado');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Order.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Pedido eliminado');
    },
  });

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchSearch =
      !search ||
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone?.includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #FCF6BA, #B38728)' }}>
            <ClipboardList className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Pedidos</h1>
            <p className="text-xs text-muted-foreground font-body uppercase tracking-widest mt-1">{orders.length} órdenes en total</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="font-body gap-2 bg-black/50 border-white/10 hover:bg-white/5 hover:text-white transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, nombre o teléfono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 font-body h-12 bg-black/50 border-white/10 focus-visible:ring-accent rounded-xl text-foreground"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48 font-body h-12 bg-black/50 border-white/10 focus:ring-accent rounded-xl text-foreground">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent className="bg-background border-white/10 text-foreground">
            <SelectItem value="all">Todos los estados</SelectItem>
            {allStatuses.map(s => (
              <SelectItem key={s} value={s}>{statusConfig[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {allStatuses.map(s => {
          const count = orders.filter(o => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
              className={`rounded-xl border p-4 text-center transition-all duration-300 hover:shadow-lg ${
                filterStatus === s ? statusConfig[s].color + ' shadow-[0_0_15px_rgba(255,255,255,0.05)] scale-105' : 'glass-panel border-white/5 hover:border-white/20'
              }`}
            >
              <p className="text-2xl font-bold font-heading">{count}</p>
              <p className="text-[9px] font-body text-muted-foreground uppercase tracking-widest mt-1 opacity-80">
                {statusConfig[s].label.split(' ')[0]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl bg-white/5" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground font-body uppercase tracking-widest text-sm">No hay pedidos registrados</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order, idx) => {
            const cfg = statusConfig[order.status] || statusConfig.pendiente;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-lg hover:border-white/20 transition-all duration-300"
              >
                {/* Top bar */}
                <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-white/5">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-heading font-bold text-base text-foreground">
                      #{order.id?.slice(-6).toUpperCase()}
                    </span>
                    <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-body flex items-center gap-1.5 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" />
                      {order.created_date && format(new Date(order.created_date), "d MMM, HH:mm", { locale: es })}
                    </span>
                  </div>
                  <span className="font-heading font-bold text-2xl text-accent">
                    ${order.total?.toFixed(0)} <span className="text-xs font-body font-normal text-muted-foreground uppercase tracking-widest ml-1">MXN</span>
                  </span>
                </div>

                {/* Body */}
                <div className="px-6 py-5 flex flex-wrap gap-8 items-start">
                  {/* Items */}
                  <div className="flex-1 min-w-[200px]">
                    <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-semibold">Artículos</h4>
                    <div className="space-y-2">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm font-body text-foreground">
                          <span><span className="font-bold text-accent mr-2">{item.quantity}x</span> {item.product_name}</span>
                          <span className="font-medium">${item.subtotal?.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer info */}
                  <div className="text-xs font-body space-y-2 text-muted-foreground min-w-[180px]">
                    <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-semibold">Cliente</h4>
                    {order.created_by && (
                      <p className="flex items-center gap-2 text-foreground"><Mail className="w-3.5 h-3.5 text-accent/50" /> {order.created_by}</p>
                    )}
                    {order.customer_name && (
                      <p className="flex items-center gap-2 text-foreground"><User className="w-3.5 h-3.5 text-accent/50" /> {order.customer_name}</p>
                    )}
                    {order.customer_phone && (
                      <p className="flex items-center gap-2 text-foreground"><Phone className="w-3.5 h-3.5 text-accent/50" /> {order.customer_phone}</p>
                    )}
                    {order.notes && (
                      <p className="flex items-start gap-2 text-foreground mt-2 bg-white/5 p-2 rounded-lg border border-white/5"><StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent/50" /> {order.notes}</p>
                    )}
                    {order.status === 'cancelado' && order.payment_method !== 'efectivo' && (
                      <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-2 items-start">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-red-400 text-[10px] leading-tight">
                          Reembolso Manual Requerido: Si el cliente ya había pagado este pedido por tarjeta, ingresa a tu panel de OpenPay para emitir el reembolso manualmente.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status control */}
                  <div className="min-w-[200px]">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-semibold">Acciones</p>
                    <Select
                      value={order.status}
                      onValueChange={val => updateMutation.mutate({ id: order.id, status: val })}
                      disabled={updateMutation.isPending}
                    >
                      <SelectTrigger className="h-10 text-xs font-body w-full bg-black/50 border-white/10 text-foreground rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-white/10 text-foreground">
                        {allStatuses.map(s => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {statusConfig[s].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Delete button for cancelled orders */}
                    {order.status?.toLowerCase() === 'cancelado' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-3 w-full text-xs gap-2"
                        onClick={() => {
                          if (confirm('¿Eliminar este pedido cancelado permanentemente?')) {
                            deleteMutation.mutate(order.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar Pedido
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}