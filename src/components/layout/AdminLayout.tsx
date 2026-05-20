import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, LogOut, ChevronRight, Menu, X, Users, Building2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Pedidos', path: '/admin/pedidos', icon: ShoppingBag },
  { label: 'Productos', path: '/admin/productos', icon: Package },
  { label: 'Usuarios', path: '/admin/usuarios', icon: Users },
  { label: 'Solicitudes', path: '/admin/solicitudes', icon: Building2 },
];

export default function AdminLayout() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Allow admin and staff roles
  const isAuthorized = user && (user.role === 'admin' || user.role === 'staff');
  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  // Filter items based on role
  const filteredNavItems = navItems.filter(item => {
    if (user.role === 'staff') {
      return ['Pedidos', 'Productos'].includes(item.label);
    }
    return true; // Admin sees everything
  });

  return (
    <div className="min-h-screen flex relative bg-slate-50">
      {/* Background Image & Overlay */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=2000&auto=format&fit=crop" 
          alt="Steak background" 
          className="w-full h-full object-cover opacity-[0.03] scale-105 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 via-slate-50/80 to-white/40" />
      </div>

      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white shadow-xl shrink-0 z-10 relative">
        <div className="h-20 flex items-center px-6 border-b border-slate-100"
          style={{ background: 'linear-gradient(135deg, #BF953F, #FCF6BA, #B38728)' }}>
          <span className="font-heading text-black font-bold text-sm tracking-[0.2em] uppercase">Admin Panel</span>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 mt-4">
          {filteredNavItems.map(item => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[11px] uppercase tracking-widest font-body transition-all duration-300 ${
                  isActive
                    ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200'
                    : 'text-slate-500 font-semibold hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent' : ''}`} />
                {item.label}
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center justify-center gap-2 px-4 py-3 w-full rounded-xl text-[10px] uppercase tracking-widest font-body font-bold text-slate-400 hover:bg-red-50 hover:text-red-600 border border-transparent transition-all"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-5 border-b border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm">
        <span className="font-heading font-bold text-xs text-slate-900 uppercase tracking-widest gold-gradient-text">Admin Panel</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 pt-16 bg-white/95 backdrop-blur-2xl">
          <nav className="p-5 space-y-2">
            {filteredNavItems.map(item => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl text-xs uppercase tracking-widest font-body transition-all ${
                    isActive ? 'bg-slate-900 text-white font-bold' : 'text-slate-500 font-semibold hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => base44.auth.logout()}
                className="flex items-center gap-4 px-5 py-4 w-full rounded-xl text-xs uppercase tracking-widest font-body font-bold text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto z-10 relative">
        <div className="p-5 md:p-8 pt-[88px] md:pt-10 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}