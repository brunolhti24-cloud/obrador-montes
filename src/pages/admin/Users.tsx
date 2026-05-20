import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Search, UserCheck, ShieldCheck, ShoppingBag, BadgeAlert, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('customers'); // 'customers' or 'wholesalers'
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.api.get('/users'),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => base44.api.put(`/users/${id}`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Rol de usuario actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar el rol');
    }
  });
  
  const deleteUserMutation = useMutation({
    mutationFn: (id) => base44.api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Usuario eliminado correctamente');
    },
    onError: () => {
      toast.error('Error al eliminar el usuario');
    }
  });

  const handleDelete = (id) => {
    deleteUserMutation.mutate(id);
  };

  // Separate users by role
  const wholesalers = users.filter(u => u.role === 'wholesale');
  const staffMembers = users.filter(u => u.role === 'staff');
  const regularCustomers = users.filter(u => u.role === 'customer' || u.role === 'admin');

  const currentList = 
    activeTab === 'wholesalers' ? wholesalers : 
    activeTab === 'staff' ? staffMembers : 
    regularCustomers;

  const filtered = currentList.filter(u =>
    !search || 
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #FCF6BA, #B38728)' }}>
            <Users className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-slate-900">Directorio de Usuarios</h1>
            <p className="text-xs text-slate-400 font-body uppercase tracking-widest mt-1">
              Control centralizado de accesos y membresías
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-bold font-body uppercase tracking-wider transition-all relative ${
              activeTab === 'customers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Clientes
            <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[9px] ${
              activeTab === 'customers' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {regularCustomers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('wholesalers')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-bold font-body uppercase tracking-wider transition-all relative ${
              activeTab === 'wholesalers' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Mayoristas
            <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[9px] ${
              activeTab === 'wholesalers' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {wholesalers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-bold font-body uppercase tracking-wider transition-all relative ${
              activeTab === 'staff' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Trabajadores
            <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[9px] ${
              activeTab === 'staff' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {staffMembers.length}
            </span>
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder={`Buscar en ${activeTab === 'customers' ? 'clientes' : 'mayoristas'}...`} 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="pl-11 font-body h-12 bg-white border-slate-200 focus-visible:ring-primary rounded-xl text-slate-900 shadow-sm" 
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl bg-slate-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((user, idx) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all shadow-sm"
            >
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-sm ${
                  user.role === 'admin' ? 'bg-amber-100 text-amber-600' : 
                  user.role === 'staff' ? 'bg-emerald-100 text-emerald-600' : 
                  user.role === 'wholesale' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {user.name?.[0].toUpperCase() || user.email?.[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <p className="font-heading font-bold text-lg text-slate-900 truncate">{user.name || 'Sin Nombre'}</p>
                    {!user.verified && (
                      <span className="bg-red-50 text-red-500 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <BadgeAlert className="w-3 h-3" /> NO VERIFICADO
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 font-body">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-amber-500 text-white' : 
                      user.role === 'staff' ? 'bg-emerald-600 text-white' : 
                      user.role === 'wholesale' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : 
                       user.role === 'staff' ? 'Trabajador' : 
                       user.role === 'wholesale' ? 'Mayorista' : 'Cliente'}
                    </span>
                    <span className="text-[10px] text-slate-300 font-body">
                      Unido el {new Date(user.created_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                {user.role !== 'admin' && (
                  <>
                    {user.role === 'staff' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl font-bold font-body text-xs h-10 border-slate-200 text-slate-600 hover:bg-slate-50"
                        onClick={() => updateRoleMutation.mutate({ id: user.id, role: 'customer' })}
                        disabled={updateRoleMutation.isPending}
                      >
                        <UserCheck className="w-4 h-4 mr-2" /> Bajar a Cliente
                      </Button>
                    ) : user.role === 'customer' ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl font-bold font-body text-xs h-10 border-blue-100 text-blue-600 hover:bg-blue-50"
                          onClick={() => updateRoleMutation.mutate({ id: user.id, role: 'wholesale' })}
                          disabled={updateRoleMutation.isPending}
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" /> Mayorista
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl font-bold font-body text-xs h-10 border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => updateRoleMutation.mutate({ id: user.id, role: 'staff' })}
                          disabled={updateRoleMutation.isPending}
                        >
                          <Users className="w-4 h-4 mr-2" /> Trabajador
                        </Button>
                      </div>
                    ) : user.role === 'wholesale' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl font-bold font-body text-xs h-10 border-slate-200 text-slate-600 hover:bg-slate-50"
                        onClick={() => updateRoleMutation.mutate({ id: user.id, role: 'customer' })}
                        disabled={updateRoleMutation.isPending}
                      >
                        <UserCheck className="w-4 h-4 mr-2" /> Bajar a Cliente
                      </Button>
                    )}
                  </>
                )}
                {user.role === 'admin' && (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-bold font-body">Privilegios Admin</span>
                  </div>
                )}
                
                {user.role !== 'admin' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl h-10 w-10 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        disabled={deleteUserMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl border-slate-100">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-heading">¿Estás completamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription className="font-body text-slate-500">
                          Esta acción eliminará permanentemente al usuario <span className="font-bold text-slate-900">{user.name || user.email}</span> de la base de datos. 
                          No podrás deshacer esta operación.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl font-body">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(user.id)}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-body font-bold"
                        >
                          Eliminar Usuario
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </motion.div>
          ))}
          
          {filtered.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-body">No se encontraron usuarios que coincidan con la búsqueda.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
