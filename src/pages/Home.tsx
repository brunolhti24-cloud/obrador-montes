import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Mail, Star, Award, Clock, Truck, ChevronRight, ShoppingCart, Beef, Fish, Bird, Sparkles, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
});

export default function Home() {
  const { t } = useLanguage();

  const stats = [
    { value: '20+', label: t('home.stats.years') },
    { value: 'Premium', label: t('home.stats.cuts') },
    { value: '100%', label: t('home.stats.guarantee') },
    { value: 'Top 1', label: t('home.stats.region') },
  ];

  const features = [
    { icon: Award, title: t('home.feature1.title'), desc: t('home.feature1.desc') },
    { icon: Clock, title: t('home.feature2.title'), desc: t('home.feature2.desc') },
    { icon: Truck, title: t('home.feature3.title'), desc: t('home.feature3.desc') },
    { icon: Star, title: t('home.feature4.title'), desc: t('home.feature4.desc') },
  ];

  const categories = [
    { label: t('home.catalog.beef'), icon: Beef, img: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600&h=600&fit=crop' },
    { label: t('home.catalog.pork'), icon: Beef, img: 'https://images.unsplash.com/photo-1588347818036-558601350947?w=600&h=600&fit=crop' },
    { label: t('home.catalog.poultry'), icon: Bird, img: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&h=600&fit=crop' },
    { label: t('home.catalog.seafood'), icon: Fish, img: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&h=600&fit=crop' },
  ];

  return (
    <div className="space-y-0 -mt-6 -mx-4">

      {/* ── HERO ── */}
      <section className="relative min-h-[70vh] md:min-h-[95vh] flex items-center justify-center overflow-hidden bg-background">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=2000&auto=format&fit=crop" 
            alt="Steak background" 
            className="w-full h-full object-cover opacity-20 scale-105"
            style={{ filter: 'brightness(1.1) contrast(1.1)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />
        </div>

        {/* Gold stripe top */}
        <div className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: 'linear-gradient(90deg, transparent, #BF953F, transparent)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center lg:text-left flex flex-col items-center lg:items-start w-full py-12 md:py-0">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="w-full flex flex-col items-center lg:items-start"
          >
            <div className="flex items-center gap-4 mb-4 md:mb-6">
              <div className="h-[1px] w-12 bg-primary/30" />
              <span className="text-primary text-[10px] md:text-xs font-body font-semibold tracking-[0.3em] uppercase">
                {t('home.hero.tagline')}
              </span>
              <div className="h-[1px] w-12 bg-primary/30 lg:hidden" />
            </div>
            
            <h1 className="font-heading text-5xl md:text-8xl font-bold text-foreground leading-[1.1] mb-6 md:mb-8 tracking-tight">
              {t('home.hero.title')}
            </h1>
            
            <p className="text-muted-foreground font-body text-base md:text-xl max-w-lg mb-8 md:mb-12 font-light leading-relaxed text-center lg:text-left px-4 md:px-0">
              {t('home.hero.desc').split('. ')[0]}. <br className="hidden sm:block" />
              <span className="text-foreground font-medium">{t('home.hero.desc').split('. ')[1]}</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="flex flex-col sm:flex-row gap-4 md:gap-5 w-full sm:w-auto"
          >
            <Link to="/catalogo" className="w-full sm:w-auto">
              <button className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-3.5 md:py-4 rounded-full font-body font-bold text-sm text-white shadow-xl hover:shadow-primary/20 transition-all hover:scale-105 bg-primary">
                <ShoppingCart className="w-4 h-4" />
                {t('home.hero.buttonCatalog')}
              </button>
            </Link>
            <a href="tel:+524272748014" className="w-full sm:w-auto">
              <button className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-3.5 md:py-4 rounded-full font-body font-bold text-sm text-foreground border border-border bg-white/50 backdrop-blur-sm hover:bg-white hover:border-primary transition-all hover:scale-105 shadow-sm">
                <Phone className="w-4 h-4" />
                {t('home.hero.buttonContact')}
              </button>
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator - Hide on small mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-3"
        >
          <span className="text-muted-foreground text-[10px] font-body tracking-[0.2em] uppercase">{t('home.hero.scroll')}</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-primary/30 to-transparent" />
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-12 md:py-16 px-6 border-y border-border bg-secondary/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 divide-x divide-border">
          {stats.map((s, i) => (
            <motion.div key={i} {...fadeUp(i * 0.1)} className="text-center px-2 md:px-4">
              <p className="font-heading text-3xl md:text-4xl font-semibold text-primary mb-1 md:mb-2">{s.value}</p>
              <p className="text-muted-foreground font-body text-[10px] md:text-xs tracking-wider uppercase">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CATEGORÍAS ── */}
      <section className="py-20 md:py-28 px-6 relative bg-background">
        {/* Decorative background logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
          <img src="https://media.base44.com/images/public/69fa176f04a4100a804d3357/f2ccd0164_image.png" alt="watermark" className="w-[600px] h-[600px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-12 md:mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-[1px] bg-primary/20" />
              <Sparkles className="w-4 h-4 text-primary" />
              <div className="w-8 h-[1px] bg-primary/20" />
            </div>
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">{t('home.catalog.tagline')}</h2>
            <p className="text-muted-foreground font-body text-sm md:text-base max-w-lg mx-auto font-light">
              {t('home.catalog.desc')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}>
                <Link to="/catalogo">
                  <div className="group relative rounded-xl md:rounded-2xl overflow-hidden aspect-[4/5] md:aspect-[3/4] cursor-pointer bg-white border border-border shadow-sm hover:shadow-xl transition-all duration-500">
                    <img src={cat.img} alt={cat.label} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 md:pb-8 px-3 md:px-4 text-center">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-3 md:mb-4 group-hover:-translate-y-2 group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                        <cat.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <p className="font-heading text-white font-semibold text-base md:text-xl tracking-wide group-hover:text-accent transition-colors leading-tight">{cat.label}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp(0.4)} className="text-center mt-12 md:mt-16">
            <Link to="/catalogo">
              <button className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-body font-semibold text-sm text-foreground border border-border hover:border-primary hover:bg-primary/5 transition-all duration-300 shadow-sm">
                {t('home.catalog.button')}
                <ChevronRight className="w-4 h-4 text-primary" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── SOBRE NOSOTROS ── */}
      <section className="py-20 md:py-28 px-6 bg-secondary/20 border-y border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <motion.div {...fadeUp()}>
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6 md:mb-8 leading-[1.2]">
                {t('home.about.title').split(', ')[0]}, <br />
                <span className="text-primary">{t('home.about.title').split(', ')[1]}</span>
              </h2>
              <div className="space-y-6 text-muted-foreground font-body font-light text-base md:text-lg leading-relaxed">
                <p>
                  {t('home.about.desc1')}
                </p>
                <p>
                  {t('home.about.desc2')}
                </p>
              </div>
              <div className="mt-8 md:mt-10 flex items-center gap-6">
                <img src="https://media.base44.com/images/public/69fa176f04a4100a804d3357/f2ccd0164_image.png" alt="Sello de calidad" className="w-14 h-14 md:w-16 md:h-16 opacity-90 grayscale hover:grayscale-0 transition-all" />
                <div>
                  <p className="font-heading text-lg font-semibold text-foreground">{t('home.about.sealTitle')}</p>
                  <p className="font-body text-sm text-muted-foreground">{t('home.about.sealDesc')}</p>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.2)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 relative">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all group">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                      <Icon className="w-5 h-5" />
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
      <section className="py-20 md:py-28 px-6 relative overflow-hidden bg-background">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-12 md:mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">{t('home.contact.title')}</h2>
            <p className="text-muted-foreground font-body font-light max-w-lg mx-auto">
              {t('home.contact.desc')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-10">
            {/* Phone */}
            <motion.a href="tel:+524272748014" {...fadeUp(0.1)}
              className="bg-white border border-border group flex items-center gap-6 rounded-2xl p-6 md:p-8 hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer shadow-sm"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-body mb-1 uppercase tracking-widest">{t('home.contact.phoneTag')}</p>
                <p className="font-heading font-semibold text-xl md:text-2xl text-foreground">
                  427 274 8014
                </p>
              </div>
            </motion.a>

            {/* Email */}
            <motion.a href="mailto:contacto@obradormontes.mx" {...fadeUp(0.2)}
              className="bg-white border border-border group flex items-center gap-6 rounded-2xl p-6 md:p-8 hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer shadow-sm"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-body mb-1 uppercase tracking-widest">{t('home.contact.emailTag')}</p>
                <p className="font-heading font-semibold text-lg md:text-xl text-foreground break-all">
                  contacto@obradormontes.mx
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
              className="inline-flex items-center justify-center gap-3 px-12 py-5 rounded-full font-body font-semibold text-white text-sm shadow-xl hover:shadow-primary/20 transition-all hover:scale-105 bg-primary"
            >
              <MessageCircle className="w-5 h-5" />
              {t('home.contact.whatsappButton')}
            </a>
          </motion.div>
        </div>
      </section>

      <footer className="py-16 px-6 border-t border-border bg-secondary/30 backdrop-blur-md text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <img
            src="https://media.base44.com/images/public/69fa176f04a4100a804d3357/f2ccd0164_image.png"
            alt="Logo"
            className="w-16 h-16 object-contain mb-6 opacity-80 grayscale hover:grayscale-0 transition-all duration-500"
          />
          <p className="font-heading text-foreground font-bold text-xl tracking-wide mb-1">Montega</p>
          <p className="text-primary text-[10px] font-body tracking-[0.2em] uppercase font-bold mb-8">{t('nav.quality')}</p>
          <p className="text-muted-foreground font-body text-xs font-light">© {new Date().getFullYear()} Montega. {t('home.footer.desc')}</p>
        </div>
      </footer>
    </div>
  );
}