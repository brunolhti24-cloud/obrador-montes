import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FavoriteButton from '@/components/products/FavoriteButton';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { getProductDescription } from '@/lib/productTranslations';

const categoryImages = {
  CERDO: '/images/pork.png',
  RES: '/images/beef.png',
  BORREGO: '/images/lamb.png',
  POLLO: '/images/chicken.png',
  MARISCOS: '/images/seafood.png',
  PAPAS: '/images/potatoes.png',
  VARIOS: '/images/misc.png',
};

const categoryColors = {
  CERDO: 'bg-primary/10 text-primary border border-primary/20',
  RES: 'bg-primary/10 text-primary border border-primary/20',
  BORREGO: 'bg-accent/10 text-accent-foreground border border-accent/20',
  POLLO: 'bg-orange-500/10 text-orange-700 border border-orange-500/20',
  MARISCOS: 'bg-blue-500/10 text-blue-700 border border-blue-500/20',
  PAPAS: 'bg-yellow-500/10 text-yellow-700 border border-yellow-500/20',
  VARIOS: 'bg-secondary text-secondary-foreground border border-border',
};

export default function ProductCard({ product }) {
  const { addItem, isWholesaleEligible } = useCart();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const isWholesale = user?.role === 'wholesale';
  const displayPrice = isWholesaleEligible ? (product.wholesale_price || product.price) : product.price;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} ${t('card.addedToast')}`);
  };

  const imgSrc = product.image_url || categoryImages[product.category] || categoryImages.VARIOS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-xl">
        <div className="relative aspect-[3/2] md:aspect-[4/3] overflow-hidden bg-muted">
          <Link to={`/producto/${product.id}`} className="block h-full w-full">
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-cover opacity-95 group-hover:scale-110 transition-all duration-700 ease-out"
              onError={(e) => { e.target.src = categoryImages[product.category] || categoryImages.VARIOS; }}
            />
            {/* Subtle vignette gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </Link>
          <Badge className={`absolute top-2 left-2 md:top-3 md:left-3 text-[9px] md:text-[10px] font-medium tracking-wider backdrop-blur-md shadow-sm ${categoryColors[product.category] || 'bg-white/80 text-black border-border'}`}>
            {product.category}
          </Badge>
          {isWholesale && product.wholesale_price && (
            <Badge className={`absolute top-2 left-16 md:top-3 md:left-20 text-[8px] md:text-[9px] border-none shadow-lg ${isWholesaleEligible ? 'bg-amber-500 text-white' : 'bg-white/90 text-slate-500'}`}>
              {isWholesaleEligible ? t('card.wholesale.ok') : t('card.wholesale.badge')}
            </Badge>
          )}
          <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 bg-white/40 border border-black/5 backdrop-blur-sm rounded-full overflow-hidden hover:bg-white/60 transition-colors scale-90 md:scale-100 shadow-sm">
            <FavoriteButton product={product} />
          </div>
        </div>

        <div className="p-5 flex flex-col h-full relative">
          <Link to={`/producto/${product.id}`} className="block mb-2 flex-grow">
            <h3 className="font-heading font-semibold text-lg text-foreground leading-tight line-clamp-1 group-hover:text-accent transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground font-light line-clamp-2 mt-1">
              {getProductDescription(product.name, product.description, language) || t('card.defaultDesc')}
            </p>
          </Link>

          <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
            <div>
              <div className="flex flex-col">
                {isWholesale && product.wholesale_price && product.wholesale_price < product.price && (
                  <span className="text-[10px] text-muted-foreground line-through decoration-red-500/50">
                    ${product.price?.toFixed(0)}
                  </span>
                )}
                <div className="flex items-baseline">
                  <span className={`text-xl font-bold font-heading ${isWholesaleEligible ? 'text-amber-600' : 'text-foreground'}`}>
                    ${displayPrice?.toFixed(0)}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-1 uppercase tracking-widest font-light">/kg</span>
                </div>
              </div>
            </div>
            <Button
              size="icon"
              onClick={handleAdd}
              className="rounded-full w-10 h-10 bg-accent hover:bg-accent/90 text-black shadow-lg hover:scale-105 transition-transform"
              title={t('card.addToCart')}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}