import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Beef, ClipboardList, LogOut, Home, Star, LayoutDashboard, Heart, Receipt, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '@/components/notifications/NotificationBell';

const navLinks = [
  { label: 'Inicio', path: '/', icon: Home },
  { label: 'Catálogo', path: '/catalogo', icon: Beef },
  { label: 'Favoritos', path: '/favoritos', icon: Heart },
  { label: 'Mis Pedidos', path: '/pedidos', icon: ClipboardList },
  { label: 'Facturas', path: '/facturas', icon: Receipt },
  { label: 'Mayoreo', path: '/mayoreo', icon: Building2 },
];

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
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
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg bg-background/90 backdrop-blur-xl border-b border-border/50' : 'bg-transparent'}`}>
        
        {/* Top accent bar */}
        <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #BF953F, #FCF6BA, #B38728)' }} />

        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 group">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md border border-border group-hover:border-accent/50 transition-colors">
              <img
                src="https://media.base44.com/images/public/69fa176f04a4100a804d3357/f2ccd0164_image.png"
                alt="Logo"
                className="w-8 h-8 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="hidden sm:block">
              <p className="font-heading text-foreground font-bold text-xl tracking-wide">
                Montega
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
              const translatedLabel = link.path === '/' ? t('nav.home') || 'Inicio' :
                                      link.path === '/catalogo' ? t('nav.catalog') :
                                      link.path === '/favoritos' ? t('nav.favorites') :
                                      link.path === '/pedidos' ? t('nav.orders') :
                                      link.path === '/facturas' ? t('nav.invoices') :
                                      link.path === '/mayoreo' ? t('nav.wholesale') : link.label;
              return (
                <Link key={link.path} to={link.path}>
                  <button className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-body font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}>
                    <Icon className="w-4 h-4" />
                    {translatedLabel}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-white border border-border shadow-md hover:bg-secondary hover:border-primary/30 transition-all text-base active:scale-95"
              title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              {language === 'es' ? '🇲🇽' : '🇺🇸'}
            </button>

            {/* Cart */}
            <Link to="/carrito" className="relative">
              <button className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white border border-border shadow-md hover:bg-secondary hover:border-primary/30 transition-all text-foreground group">
                <ShoppingCart className="w-5 h-5 group-hover:text-primary transition-colors stroke-[2.5]" />
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
                <button className="hidden md:flex items-center justify-center w-11 h-11 rounded-full border border-primary/20 text-primary hover:bg-primary/10 transition-all shadow-sm">
                  <LayoutDashboard className="w-4 h-4 stroke-[2.5]" />
                </button>
              </Link>
            )}

            {/* Logout desktop */}
            <button
              onClick={() => base44.auth.logout()}
              className="hidden md:flex items-center justify-center w-11 h-11 rounded-full bg-white border border-border text-foreground hover:text-primary hover:bg-secondary transition-all shadow-sm"
              title={t('nav.signout')}
            >
              <LogOut className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-full bg-white border border-border text-foreground shadow-md transition-all active:scale-95"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[70] w-[85%] max-w-[320px] bg-background border-r border-border shadow-2xl flex flex-col md:hidden"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-border shadow-sm flex items-center justify-center">
                    <img
                      src="https://media.base44.com/images/public/69fa176f04a4100a804d3357/f2ccd0164_image.png"
                      alt="Logo"
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-heading font-bold text-foreground">Montega</h2>
                    <p className="text-[10px] gold-gradient-text uppercase tracking-widest font-semibold">Carnicería Premium</p>
                  </div>
                </Link>
                <button 
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Section */}
              {user && (
                <div className="px-6 py-6 bg-secondary/30 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold shadow-md">
                      {user.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 capitalize">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                        {user.role || 'Cliente'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                <p className="px-4 pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{t('nav.navigation')}</p>
                {navLinks.map((link, i) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  const translatedLabel = link.path === '/' ? t('nav.home') || 'Inicio' :
                                          link.path === '/catalogo' ? t('nav.catalog') :
                                          link.path === '/favoritos' ? t('nav.favorites') :
                                          link.path === '/pedidos' ? t('nav.orders') :
                                          link.path === '/facturas' ? t('nav.invoices') :
                                          link.path === '/mayoreo' ? t('nav.wholesale') : link.label;
                  return (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 + 0.1 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}
                      >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                          isActive ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground group-hover:text-foreground'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm">{translatedLabel}</span>
                        {isActive && (
                          <motion.div 
                            layoutId="activeIndicator" 
                            className="ml-auto w-1 h-4 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" 
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                {user?.role === 'admin' && (
                  <>
                    <div className="pt-4 pb-2">
                      <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{t('nav.administration')}</p>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Link 
                        to="/admin" 
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-primary hover:bg-primary/5 transition-all group"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                          <LayoutDashboard className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm">{t('nav.admin')}</span>
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>

              {/* Footer Section */}
              <div className="p-6 border-t border-border bg-secondary/50">
                <button
                  onClick={() => base44.auth.logout()}
                  className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl text-destructive hover:bg-destructive/10 transition-all font-medium group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/5 text-destructive group-hover:bg-destructive/10 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{t('nav.signout')}</span>
                </button>
                
                <div className="mt-6 flex flex-col items-center gap-3">
                  <div className="flex gap-1.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className="w-3 h-3 text-accent fill-accent shadow-accent" />
                    ))}
                  </div>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium text-center">
                    {t('nav.quality')}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}