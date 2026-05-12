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

const categoryImages = {
  CERDO: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400&h=300&fit=crop',
  RES: 'https://images.unsplash.com/photo-1588347818036-558601350947?w=400&h=300&fit=crop',
  BORREGO: 'https://images.unsplash.com/photo-1608039829572-69e38ccf9697?w=400&h=300&fit=crop',
  POLLO: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop',
  MARISCOS: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop',
  PAPAS: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=300&fit=crop',
  VARIOS: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
};

const categoryColors = {
  CERDO: 'bg-primary/20 text-primary-foreground border border-primary/30',
  RES: 'bg-primary/20 text-primary-foreground border border-primary/30',
  BORREGO: 'bg-accent/20 text-accent border border-accent/30',
  POLLO: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  MARISCOS: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  PAPAS: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  VARIOS: 'bg-white/10 text-white/80 border border-white/20',
};

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem(product);
    toast.success(`${product.name} agregado al carrito`);
  };

  const imgSrc = product.image_url || categoryImages[product.category] || categoryImages.VARIOS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group overflow-hidden bg-card border border-white/5 hover:border-accent/30 transition-all duration-500 shadow-lg hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-black">
          <Link to={`/producto/${product.id}`} className="block h-full w-full">
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700 ease-out"
              onError={(e) => { e.target.src = categoryImages[product.category] || categoryImages.VARIOS; }}
            />
            {/* Subtle vignette gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
          </Link>
          <Badge className={`absolute top-3 left-3 text-[10px] font-medium tracking-wider backdrop-blur-md ${categoryColors[product.category] || 'bg-white/10 text-white border-white/20'}`}>
            {product.category}
          </Badge>
          <div className="absolute top-2 right-2 bg-black/40 border border-white/10 backdrop-blur-sm rounded-full overflow-hidden hover:bg-black/60 transition-colors">
            <FavoriteButton product={product} />
          </div>
        </div>

        <div className="p-5 flex flex-col h-full relative">
          <Link to={`/producto/${product.id}`} className="block mb-2 flex-grow">
            <h3 className="font-heading font-semibold text-lg text-foreground leading-tight line-clamp-1 group-hover:text-accent transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground font-light line-clamp-2 mt-1">
              {product.description || 'Corte premium seleccionado del obrador.'}
            </p>
          </Link>

          <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
            <div>
              <span className="text-xl font-bold font-heading text-foreground">
                ${product.price?.toFixed(0)}
              </span>
              <span className="text-[10px] text-muted-foreground ml-1 uppercase tracking-widest font-light">/kg</span>
            </div>
            <Button
              size="icon"
              onClick={handleAdd}
              className="rounded-full w-10 h-10 bg-accent hover:bg-accent/90 text-black shadow-lg hover:scale-105 transition-transform"
              title="Agregar al carrito"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}