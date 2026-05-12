import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const categoryImages = {
  CERDO: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400&h=300&fit=crop',
  RES: 'https://images.unsplash.com/photo-1588347818036-558601350947?w=400&h=300&fit=crop',
  BORREGO: 'https://images.unsplash.com/photo-1608039829572-69e38ccf9697?w=400&h=300&fit=crop',
  POLLO: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop',
  MARISCOS: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop',
  PAPAS: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=300&fit=crop',
  VARIOS: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
};

export default function Favorites() {
  const { addItem } = useCart();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => base44.entities.Favorite.list(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => base44.entities.Favorite.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const favoriteProducts = favorites.map(fav => {
    const product = products.find(p => p.id === fav.product_id);
    return { ...fav, product };
  }).filter(f => f.product);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        <h1 className="font-heading text-2xl font-bold">Mis Favoritos</h1>
        <span className="text-sm text-muted-foreground">({favorites.length})</span>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Heart className="w-16 h-16 text-muted-foreground/30" />
          <p className="text-muted-foreground font-body">Aún no tienes favoritos</p>
          <Link to="/catalogo">
            <Button className="bg-primary text-primary-foreground">Ver Catálogo</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriteProducts.map(({ id, product }, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all">
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  <img
                    src={product.image_url || categoryImages[product.category]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = categoryImages.VARIOS; }}
                  />
                  <button
                    onClick={() => removeMutation.mutate(id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full text-red-500 hover:bg-white transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  <p className="font-heading font-semibold text-sm line-clamp-1">{product.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold font-heading">${product.price?.toFixed(0)}<span className="text-[10px] text-muted-foreground font-normal">/kg</span></span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs bg-primary"
                    onClick={() => { addItem(product); toast.success(`${product.name} agregado`); }}
                  >
                    Agregar al carrito
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}