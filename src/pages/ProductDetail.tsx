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

const categoryImages = {
  CERDO: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=800&h=600&fit=crop',
  RES: 'https://images.unsplash.com/photo-1588347818036-558601350947?w=800&h=600&fit=crop',
  BORREGO: 'https://images.unsplash.com/photo-1608039829572-69e38ccf9697?w=800&h=600&fit=crop',
  POLLO: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=600&fit=crop',
  MARISCOS: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&h=600&fit=crop',
  PAPAS: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=800&h=600&fit=crop',
  VARIOS: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
};

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

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
        <p className="text-muted-foreground">Producto no encontrado</p>
        <Link to="/catalogo"><Button className="mt-4">Ver Catálogo</Button></Link>
      </div>
    );
  }

  const imgSrc = product.image_url || categoryImages[product.category] || categoryImages.VARIOS;

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    toast.success(`${qty} kg de ${product.name} agregado al carrito`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver al catálogo
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-2 gap-8"
      >
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={e => { e.target.src = categoryImages.VARIOS; }}
          />
          <Badge className="absolute top-4 left-4 text-xs">
            {product.category}
          </Badge>
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Sin stock</span>
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
                <span className="text-muted-foreground text-sm">({reviews.length} reseñas)</span>
              </div>
            )}
          </div>

          <div>
            <span className="text-4xl font-bold font-heading text-primary">${product.price?.toFixed(0)}</span>
            <span className="text-muted-foreground ml-2">/ kg</span>
          </div>

          {product.description && (
            <p className="text-muted-foreground font-body leading-relaxed">{product.description}</p>
          )}
          {product.full_description && (
            <p className="text-sm font-body leading-relaxed">{product.full_description}</p>
          )}
          {product.ingredient && (
            <p className="text-sm"><span className="font-semibold">Ingrediente principal:</span> {product.ingredient}</p>
          )}

          {/* Quantity selector */}
          {product.in_stock && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Cantidad (kg)</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-bold w-8 text-center">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <Button onClick={handleAdd} className="w-full h-12 text-base font-semibold bg-primary">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Agregar ${(product.price * qty).toFixed(0)} MXN
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