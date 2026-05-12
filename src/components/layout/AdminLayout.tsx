import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Package, LogOut, ChevronRight, Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Pedidos', path: '/admin/pedidos', icon: ClipboardList },
  { label: 'Productos', path: '/admin/productos', icon: Package },
];

export default function AdminLayout() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex relative bg-black">
      {/* Background Image & Overlay */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=2000&auto=format&fit=crop" 
          alt="Steak background" 
          className="w-full h-full object-cover opacity-10 scale-105 blur-sm"
          style={{ filter: 'brightness(0.5) contrast(1.2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/95 to-black/80" />
      </div>

      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl shrink-0 z-10 relative">
        <div className="h-16 flex items-center px-6 border-b border-white/10"
          style={{ background: 'linear-gradient(90deg, #BF953F, #FCF6BA, #B38728)' }}>
          <span className="font-heading text-black font-bold text-base tracking-widest uppercase">Admin Panel</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-widest font-body transition-all duration-300 ${
                  isActive
                    ? 'bg-accent/10 text-accent font-bold shadow-[0_0_15px_rgba(252,246,186,0.1)] border border-accent/20'
                    : 'text-white/50 font-semibold hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10 bg-black/20">
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center justify-center gap-2 px-4 py-3 w-full rounded-xl text-xs uppercase tracking-widest font-body font-bold text-white/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent transition-all"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-5 border-b border-white/10 bg-black/80 backdrop-blur-xl shadow-sm">
        <span className="font-heading font-bold text-sm text-foreground uppercase tracking-widest gold-gradient-text">Admin Panel</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 pt-16 bg-black/95 backdrop-blur-2xl">
          <nav className="p-5 space-y-2">
            {navItems.map(item => {
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
                    isActive ? 'bg-accent/10 text-accent font-bold border border-accent/20' : 'text-white/50 font-semibold hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-4 mt-4 border-t border-white/10">
              <button
                onClick={() => base44.auth.logout()}
                className="flex items-center gap-4 px-5 py-4 w-full rounded-xl text-xs uppercase tracking-widest font-body font-bold text-red-400/70 hover:bg-red-500/10 transition-all"
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
        <div className="p-5 md:p-8 pt-[88px] md:pt-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}