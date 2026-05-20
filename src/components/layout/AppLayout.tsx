import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import DynamicBackground from './DynamicBackground';
import WhatsAppButton from '../common/WhatsAppButton';

export default function AppLayout() {
  return (
    <div className="min-h-screen font-body relative flex flex-col">
      <DynamicBackground />
      <div className="relative z-10 flex-1 flex flex-col">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
          <Outlet />
        </main>
        
        {/* Footer */}
        <footer className="mt-auto border-t border-border bg-white/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-heading font-bold text-lg text-foreground mb-4">Montega</h3>
              <p className="text-sm text-muted-foreground font-body max-w-xs">
                Cortes premium y atención personalizada. Calidad excepcional directo a tu puerta.
              </p>
            </div>
            
            <div>
              <h3 className="font-heading font-bold text-sm text-foreground uppercase tracking-widest mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-muted-foreground font-body">
                <li><Link to="/privacidad" className="hover:text-primary transition-colors">Aviso de Privacidad</Link></li>
                <li><Link to="/terminos" className="hover:text-primary transition-colors">Términos y Condiciones</Link></li>
                <li><Link to="/reembolsos" className="hover:text-primary transition-colors">Política de Reembolsos</Link></li>
                <li><Link to="/mayoreo" className="hover:text-primary transition-colors font-bold">Mayoreo / Restaurantes</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-heading font-bold text-sm text-foreground uppercase tracking-widest mb-4">Soporte</h3>
              <ul className="space-y-3 text-sm text-muted-foreground font-body">
                <li><a href="mailto:soporte@obradormontes.com" className="hover:text-primary transition-colors">soporte@obradormontes.com</a></li>
                <li>WhatsApp: +52 (442) 123 4567</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border py-6 text-center text-xs text-muted-foreground font-body">
            <p>&copy; {new Date().getFullYear()} Montega. Todos los derechos reservados.</p>
          </div>
        </footer>
        <WhatsAppButton />
      </div>
    </div>
  );
}