import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Minus, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import ReviewSection from '@/components/products/ReviewSection';
import { motion } from 'framer-motion';
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

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem, isWholesaleEligible, totalWeight } = useCart();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [qty, setQty] = useState(1);

  const isWholesale = user?.role === 'wholesale';

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => base44.entities.Product.filter({ id }),
    select: data => data[0],
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => base44.entities.Review.filter({ product_id: id }),
  });

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">{t('detail.notFound')}</p>
        <Link to="/catalogo"><Button className="mt-4">{t('detail.viewCatalog')}</Button></Link>
      </div>
    );
  }

  const imgSrc = product.image_url || categoryImages[product.category] || categoryImages.VARIOS;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, qty);
    toast.success(t('detail.addedSuccess').replace('{qty}', qty.toString()).replace('{name}', product.name));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {t('detail.back')}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-2 gap-8"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden bg-muted shadow-2xl border border-white/5">
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={e => { e.target.src = categoryImages.VARIOS; }}
          />
          <Badge className="absolute top-4 left-4 text-[10px] font-bold tracking-widest uppercase bg-accent text-black border-none shadow-lg">
            {product.category}
          </Badge>
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-white font-bold text-lg uppercase tracking-widest border-2 border-white/30 px-6 py-2 rounded-lg">{t('detail.noStock')}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <h1 className="font-heading text-3xl font-bold">{product.name}</h1>
            {avgRating && (
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-sm">{avgRating}</span>
                <span className="text-muted-foreground text-sm">({reviews.length} {t('detail.reviews')})</span>
              </div>
            )}
          </div>

          <div>
            {isWholesale && product.wholesale_price && product.wholesale_price < product.price && (
              <span className="text-sm text-muted-foreground line-through decoration-red-500 mb-1 block">
                {t('detail.normalPrice')}: ${product.price?.toFixed(0)}
              </span>
            )}
            <div className="flex items-baseline">
              <span className={`text-4xl font-bold font-heading ${isWholesaleEligible ? 'text-amber-600' : 'text-primary'}`}>
                ${(isWholesaleEligible ? (product.wholesale_price || product.price) : product.price)?.toFixed(0)}
              </span>
              <span className="text-muted-foreground ml-2">/ kg</span>
              {isWholesale && product.wholesale_price && (
                <Badge className={`ml-3 border-none shadow-sm ${isWholesaleEligible ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {isWholesaleEligible ? t('detail.wholesale.applied') : t('detail.wholesale.available')}
                </Badge>
              )}
            </div>
            {isWholesale && !isWholesaleEligible && (
              <div className="mt-2 bg-amber-50 border border-amber-100 p-3 rounded-xl">
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">
                  {t('detail.wholesale.badge')}
                </span>
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest flex items-center gap-2 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {t('detail.wholesale.benefit')}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  {t('detail.wholesale.reached1')}<span className="font-bold">40kg</span>{t('detail.wholesale.reached2')}{totalWeight.toFixed(1)}{t('detail.wholesale.reached3')}
                </p>
              </div>
            )}
          </div>

          {product.description && (
            <p className="text-muted-foreground font-body leading-relaxed">{getProductDescription(product.name, product.description, language)}</p>
          )}
          {product.full_description && (
            <p className="text-sm font-body leading-relaxed">{product.full_description}</p>
          )}
          {product.ingredient && (
            <p className="text-sm"><span className="font-semibold">{t('detail.ingredient')}:</span> {product.ingredient}</p>
          )}

          {/* Quantity selector */}
          {product.in_stock && (
            <div className="space-y-3">
              <p className="text-sm font-medium">{t('detail.qty')}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty(q => Math.max(0.5, q - 0.5))}
                  className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-bold w-8 text-center">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 0.5)}
                  className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <Button onClick={handleAdd} className={`w-full h-12 text-base font-semibold ${isWholesaleEligible ? 'bg-amber-600 hover:bg-amber-700' : 'bg-primary'}`}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                {t('detail.add')} ${((isWholesaleEligible ? (product.wholesale_price || product.price) : product.price) * qty).toFixed(0)} MXN
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Reviews */}
      <ReviewSection productId={id} productName={product.name} />
    </div>
  );
}