import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Search, Sparkles, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import CategoryFilter from '@/components/products/CategoryFilter';
import ProductCard from '@/components/products/ProductCard';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';

export default function Catalog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const { t } = useLanguage();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date', 200),
  });

  const filtered = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'all' || p.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #8b0000 0%, #b71c1c 50%, #BF953F 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5" />
        <div className="absolute top-4 right-24 w-16 h-16 rounded-full bg-yellow-400/10" />

        <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 text-xs font-body font-semibold tracking-wider uppercase">
                {t('catalog.hero.bannerTitle')}
              </span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
              {t('catalog.hero.title')}
            </h1>
            <p className="text-white/75 font-body text-sm md:text-base max-w-md">
              {t('catalog.hero.desc')}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
              <TrendingUp className="w-4 h-4 text-yellow-300" />
              <span className="text-white font-body text-sm font-semibold">
                +{products.length} {t('catalog.hero.countSuffix')}
              </span>
            </div>
            <div className="flex gap-1">
              {['CERDO','RES','POLLO','MARISCOS'].map(c => (
                <span key={c} className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full font-body">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Gold bottom stripe */}
        <div className="h-1" style={{ background: 'linear-gradient(90deg, #ffd700, #ff6b35, #ffd700)' }} />
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t('catalog.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 h-12 font-body bg-card shadow-sm border-border/60 focus:border-primary rounded-xl text-sm"
        />
      </div>

      {/* Filters */}
      <CategoryFilter selected={category} onChange={setCategory} />

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-body">
          <span className="font-semibold text-foreground">{filtered.length}</span> {filtered.length === 1 ? t('catalog.foundSingular') : t('catalog.foundPlural')}
        </p>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground font-body">{t('catalog.noProducts')}</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}