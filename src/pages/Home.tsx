import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Mail, Star, Award, Clock, Truck, ChevronRight, ShoppingCart, Beef, Fish, Bird, Sparkles, MessageCircle } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
});

const stats = [
  { value: '20+', label: 'Años de maestría' },
  { value: 'Premium', label: 'Cortes exclusivos' },
  { value: '100%', label: 'Garantía de origen' },
  { value: 'Top 1', label: 'En la región' },
];

const features = [
  { icon: Award, title: 'Calidad Prime', desc: 'Seleccionamos a mano los mejores cortes del obrador para los paladares más exigentes.' },
  { icon: Clock, title: 'Fresco Diario', desc: 'Procesamiento artesanal diario. Del obrador a tu mesa conservando el máximo sabor.' },
  { icon: Truck, title: 'Entrega VIP', desc: 'Transporte en cadena de frío para que tu pedido llegue en condiciones óptimas.' },
  { icon: Star, title: 'Herencia Familiar', desc: 'Dos décadas perfeccionando el arte de la carnicería fina.' },
];

const categories = [
  { label: 'Cortes Finos de Res', icon: Beef, img: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600&h=600&fit=crop' },
  { label: 'Cerdo Premium', icon: Beef, img: 'https://images.unsplash.com/photo-1588347818036-558601350947?w=600&h=600&fit=crop' },
  { label: 'Aves Frescas', icon: Bird, img: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&h=600&fit=crop' },
  { label: 'Del Mar', icon: Fish, img: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&h=600&fit=crop' },
];

export default function Home() {
  return (
    <div className="space-y-0 -mt-6 -mx-4">

      {/* ── HERO ── */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=2000&auto=format&fit=crop" 
            alt="Steak background" 
            className="w-full h-full object-cover opacity-40 scale-105"
            style={{ filter: 'brightness(0.6) contrast(1.2)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
        </div>

        {/* Gold stripe top */}
        <div className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: 'linear-gradient(90deg, transparent, #BF953F, transparent)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center lg:text-left flex flex-col items-center lg:items-start w-full">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="w-full flex flex-col items-center lg:items-start"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] w-12 bg-accent/60" />
              <span className="text-accent text-xs font-body font-semibold tracking-[0.3em] uppercase">
                Arte en Carnicería
              </span>
              <div className="h-[1px] w-12 bg-accent/60 lg:hidden" />
            </div>
            
            <h1 className="font-heading text-6xl md:text-8xl font-bold text-foreground leading-[1.1] mb-2 tracking-tight">
              Obrador
            </h1>
            <h1 className="font-heading text-6xl md:text-8xl font-bold leading-[1.1] mb-8 gold-gradient-text">
              Montes
            </h1>
            
            <p className="text-muted-foreground font-body text-lg md:text-xl max-w-lg mb-12 font-light leading-relaxed text-center lg:text-left">
              Selección exclusiva de cortes premium. <br className="hidden sm:block" />
              <span className="text-foreground font-medium">El estándar de oro para tu mesa.</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="flex flex-col sm:flex-row gap-5"
          >
            <Link to="/catalogo">
              <button className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-full font-body font-bold text-sm text-black shadow-2xl transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #FCF6BA, #B38728)' }}>
                <ShoppingCart className="w-4 h-4" />
                Explorar Catálogo
              </button>
            </Link>
            <a href="tel:+524272748014" className="w-full sm:w-auto">
              <button className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-full font-body font-bold text-sm text-foreground border border-white/20 glass-panel hover:bg-white/10 hover:border-accent/50 transition-all hover:scale-105">
                <Phone className="w-4 h-4" />
                Contacto Directo
              </button>
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-white/30 text-[10px] font-body tracking-[0.2em] uppercase">Descubrir</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-accent/50 to-transparent" />
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 px-6 border-y border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 divide-x divide-white/5">
          {stats.map((s, i) => (
            <motion.div key={i} {...fadeUp(i * 0.1)} className="text-center px-4">
              <p className="font-heading text-4xl font-semibold gold-gradient-text mb-2">{s.value}</p>
              <p className="text-muted-foreground font-body text-xs tracking-wider uppercase">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CATEGORÍAS ── */}
      <section className="py-28 px-6 relative">
        {/* Decorative background logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
          <img src="https://media.base44.com/images/public/69fa176f04a4100a804d3357/f2ccd0164_image.png" alt="watermark" className="w-[600px] h-[600px] grayscale" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-[1px] bg-accent/40" />
              <Sparkles className="w-4 h-4 text-accent" />
              <div className="w-8 h-[1px] bg-accent/40" />
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">Colección Premium</h2>
            <p className="text-muted-foreground font-body max-w-lg mx-auto font-light">
              Nuestra selección más exclusiva. Carnes maduradas y cortes especiales elegidos minuciosamente.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}>
                <Link to="/catalogo">
                  <div className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer bg-card border border-white/5">
                    <img src={cat.img} alt={cat.label} className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-4 text-center">
                      <div className="w-12 h-12 rounded-full border border-white/20 glass-panel flex items-center justify-center mb-4 group-hover:-translate-y-2 group-hover:border-accent/50 transition-all duration-500">
                        <cat.icon className="w-5 h-5 text-accent" />
                      </div>
                      <p className="font-heading text-white font-semibold text-xl tracking-wide group-hover:text-accent transition-colors">{cat.label}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp(0.4)} className="text-center mt-16">
            <Link to="/catalogo">
              <button className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-body font-semibold text-sm text-foreground border border-white/20 hover:border-accent hover:bg-white/5 transition-all duration-300">
                Ver Catálogo Completo
                <ChevronRight className="w-4 h-4 text-accent" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── SOBRE NOSOTROS ── */}
      <section className="py-28 px-6 bg-black/10 backdrop-blur-sm border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp()}>
              <h2 className="font-heading text-4xl md:text-5xl font-bold mb-8 leading-[1.2]">
                La perfección no se apura, <br />
                <span className="gold-gradient-text">se cultiva.</span>
              </h2>
              <div className="space-y-6 text-muted-foreground font-body font-light text-lg leading-relaxed">
                <p>
                  En <strong className="text-foreground font-medium">Obrador Montes</strong>, entendemos que un corte excepcional requiere maestría, tiempo y dedicación. Durante más de dos décadas, hemos perfeccionado el arte de la selección y maduración cárnica.
                </p>
                <p>
                  No somos solo una carnicería; somos curadores de sabor. Trabajamos en estrecha colaboración con las mejores ganaderías para garantizar que cada pieza que lleva nuestro sello cumpla con los estándares más rigurosos de marmoleo, textura y sabor.
                </p>
              </div>
              <div className="mt-10 flex items-center gap-6">
                <img src="https://media.base44.com/images/public/69fa176f04a4100a804d3357/f2ccd0164_image.png" alt="Sello de calidad" className="w-16 h-16 opacity-80 drop-shadow-md grayscale" />
                <div>
                  <p className="font-heading text-lg font-semibold text-foreground">Calidad Suprema</p>
                  <p className="font-body text-sm text-muted-foreground">Firma de excelencia</p>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.2)} className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="glass-panel rounded-2xl p-6 hover:border-accent/30 transition-colors group">
                    <div className="w-12 h-12 rounded-full border border-white/10 bg-black/50 flex items-center justify-center mb-5 group-hover:bg-accent/10 transition-colors">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2 text-foreground">{f.title}</h3>
                    <p className="text-muted-foreground text-sm font-body leading-relaxed font-light">{f.desc}</p>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold mb-4">Servicio Personalizado</h2>
            <p className="text-muted-foreground font-body font-light max-w-lg mx-auto">
              Nuestros carniceros expertos están a su disposición para asesorarle sobre el corte perfecto para su ocasión.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Phone */}
            <motion.a href="tel:+524272748014" {...fadeUp(0.1)}
              className="glass-panel group flex items-center gap-6 rounded-2xl p-8 hover:border-accent/40 transition-all cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full border border-white/10 bg-black/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6 text-foreground group-hover:text-accent transition-colors" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-body mb-1 uppercase tracking-widest">Línea Directa</p>
                <p className="font-heading font-semibold text-2xl text-foreground">
                  427 274 8014
                </p>
              </div>
            </motion.a>

            {/* Email */}
            <motion.a href="mailto:contacto@obradormontes.mx" {...fadeUp(0.2)}
              className="glass-panel group flex items-center gap-6 rounded-2xl p-8 hover:border-accent/40 transition-all cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full border border-white/10 bg-black/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-foreground group-hover:text-accent transition-colors" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-body mb-1 uppercase tracking-widest">Atención VIP</p>
                <p className="font-heading font-semibold text-xl text-foreground break-all">
                  contacto@<br/>obradormontes.mx
                </p>
              </div>
            </motion.a>
          </div>

          {/* WhatsApp CTA */}
          <motion.div {...fadeUp(0.3)} className="text-center">
            <a
              href="https://wa.me/524272748014?text=Hola,%20busco%20asesoría%20para%20un%20corte%20premium"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-12 py-5 rounded-full font-body font-semibold text-black text-sm shadow-xl transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #FCF6BA, #B38728)' }}
            >
              <MessageCircle className="w-5 h-5" />
              Asesoría por WhatsApp
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-6 border-t border-white/10 bg-black/30 backdrop-blur-md text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <img
            src="https://media.base44.com/images/public/69fa176f04a4100a804d3357/f2ccd0164_image.png"
            alt="Logo"
            className="w-16 h-16 object-contain mb-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500"
          />
          <p className="font-heading text-foreground font-bold text-xl tracking-wide mb-2">Obrador Montes</p>
          <p className="gold-gradient-text text-[10px] font-body tracking-[0.2em] uppercase font-semibold mb-8">Carnicería Premium</p>
          <p className="text-white/30 font-body text-xs font-light">© {new Date().getFullYear()} Obrador Montes. Excelencia en cada corte.</p>
        </div>
      </footer>

    </div>
  );
}