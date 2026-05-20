import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Search, Phone, Mail, Calendar, MessageSquare, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function WholesaleInquiries() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ['admin-wholesale-inquiries'],
    queryFn: () => base44.api.get('/wholesale'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.api.put(`/wholesale/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wholesale-inquiries'] });
      toast.success('Estado actualizado');
    },
    onError: () => toast.error('Error al actualizar estado')
  });

  const filtered = inquiries.filter(i =>
    !search || 
    i.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    i.contactName?.toLowerCase().includes(search.toLowerCase()) ||
    i.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-slate-900">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Solicitudes de Mayoreo</h1>
          <p className="text-xs text-slate-400 font-body uppercase tracking-widest mt-1">
            {inquiries.length} prospectos de negocios interesados
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Buscar negocio o contacto..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="pl-11 font-body h-12 bg-white border-slate-200 focus-visible:ring-primary rounded-xl text-slate-900 shadow-sm" 
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl bg-slate-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map((inquiry, idx) => (
            <motion.div
              key={inquiry.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Business Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-xl text-slate-900">{inquiry.businessName}</h3>
                      <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mt-1">
                        {inquiry.businessType}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                      inquiry.status === 'atendido' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {inquiry.status === 'atendido' ? 'Atendido' : 'Pendiente'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-body text-slate-600">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-slate-800">{inquiry.contactName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{new Date(inquiry.created_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{inquiry.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{inquiry.email}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Mensaje / Requerimientos</p>
                    <p className="text-sm italic text-slate-600">
                      "{inquiry.message || 'Sin mensaje adicional.'}"
                    </p>
                    {inquiry.estimatedVolume && (
                      <div className="mt-3 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                        <span>Volumen estimado: {inquiry.estimatedVolume}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:w-48 flex flex-col gap-2 justify-center">
                  <a 
                    href={`https://wa.me/${inquiry.phone.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full"
                  >
                    <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl h-11 flex gap-2">
                      <ExternalLink className="w-4 h-4" /> WhatsApp
                    </Button>
                  </a>
                  
                  {inquiry.status !== 'atendido' ? (
                    <Button 
                      variant="outline"
                      className="w-full rounded-xl h-11 border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                      onClick={() => updateStatusMutation.mutate({ id: inquiry.id, status: 'atendido' })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Marcar Atendido
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost"
                      className="w-full rounded-xl h-11 text-slate-400 font-bold hover:bg-slate-50"
                      onClick={() => updateStatusMutation.mutate({ id: inquiry.id, status: 'pendiente' })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <Clock className="w-4 h-4 mr-2" /> Reabrir
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {filtered.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-body">No hay solicitudes que mostrar.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
