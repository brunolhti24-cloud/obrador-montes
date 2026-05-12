import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Beef, ClipboardList, LogOut, Home, Star, LayoutDashboard, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '@/components/notifications/NotificationBell';

const navLinks = [
  { label: 'Inicio', path: '/', icon: Home },
  { label: 'Catálogo', path: '/catalogo', icon: Beef },
  { label: 'Favoritos', path: '/favoritos', icon: Heart },
  { label: 'Mis Pedidos', path: '/pedidos', icon: ClipboardList },
];

export default function Navbar() {
  const { totalItems } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-2xl bg-background/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
        
        {/* Top accent bar */}
        <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, #BF953F, #FCF6BA, #B38728)' }} />

        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 group">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-black/40 border border-white/10 shadow-inner overflow-hidden group-hover:border-accent/50 transition-colors">
              <img
                src="https://media.base44.com/images/public/69fa176f04a4100a804d3357/f2ccd0164_image.png"
                alt="Logo"
                className="w-8 h-8 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="hidden sm:block">
              <p className="font-heading text-foreground font-bold text-xl tracking-wide">
                Obrador Montes
              </p>
              <p className="gold-gradient-text text-[10px] font-body tracking-[0.2em] uppercase font-semibold">
                Carnicería Premium
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link key={link.path} to={link.path}>
                  <button className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-body font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-primary/20 text-primary-foreground border border-primary/30 shadow-[0_0_15px_rgba(183,28,28,0.2)]'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  }`}>
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link to="/carrito" className="relative">
              <button className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-accent/30 transition-all text-foreground group">
                <ShoppingCart className="w-5 h-5 group-hover:text-accent transition-colors" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-black shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #FCF6BA, #B38728)' }}
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </Link>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Admin link desktop */}
            {user?.role === 'admin' && (
              <Link to="/admin">
                <button className="hidden md:flex items-center justify-center w-11 h-11 rounded-full border border-accent/20 text-accent hover:bg-accent/10 transition-all">
                  <LayoutDashboard className="w-4 h-4" />
                </button>
              </Link>
            )}

            {/* Logout desktop */}
            <button
              onClick={() => base44.auth.logout()}
              className="hidden md:flex items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/5 text-foreground transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[82px] left-4 right-4 z-40 overflow-hidden shadow-2xl rounded-2xl glass-panel border border-white/10"
          >
            <div className="px-4 py-4 space-y-1 bg-card/50">
              {navLinks.map((link, i) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body font-medium transition-all ${
                        isActive
                          ? 'bg-primary/20 text-primary-foreground border border-primary/30'
                          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.label}</span>
                      {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-accent" />}
                    </Link>
                  </motion.div>
                );
              })}

              {user?.role === 'admin' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <Link to="/admin" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-body font-medium text-accent hover:bg-white/5 transition-all">
                    <LayoutDashboard className="w-5 h-5" />
                    Panel Admin
                  </Link>
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <button
                  onClick={() => base44.auth.logout()}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-body font-medium text-destructive hover:bg-white/5 transition-all w-full"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar Sesión
                </button>
              </motion.div>
            </div>

            {/* Bottom bar */}
            <div className="px-4 py-3 border-t border-white/5 bg-black/40 flex items-center justify-between">
              <span className="text-white/40 text-xs font-body uppercase tracking-wider">Carnicería Obrador Montes</span>
              <div className="flex gap-1">
                <Star className="w-3 h-3 text-accent fill-accent" />
                <Star className="w-3 h-3 text-accent fill-accent" />
                <Star className="w-3 h-3 text-accent fill-accent" />
                <Star className="w-3 h-3 text-accent fill-accent" />
                <Star className="w-3 h-3 text-accent fill-accent" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}