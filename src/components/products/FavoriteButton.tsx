import React from 'react';
import { Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export default function FavoriteButton({ product, className }) {
  const queryClient = useQueryClient();

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => base44.entities.Favorite.list(),
  });

  const isFavorite = favorites.some(f => f.product_id === product.id);
  const favorite = favorites.find(f => f.product_id === product.id);

  const addMutation = useMutation({
    mutationFn: () => base44.entities.Favorite.create({ product_id: product.id, product_name: product.name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const removeMutation = useMutation({
    mutationFn: () => base44.entities.Favorite.delete(favorite.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const toggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isFavorite) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        'p-1.5 rounded-full transition-all',
        isFavorite ? 'text-red-500' : 'text-muted-foreground hover:text-red-400',
        className
      )}
    >
      <Heart className={cn('w-4 h-4', isFavorite && 'fill-red-500')} />
    </button>
  );
}