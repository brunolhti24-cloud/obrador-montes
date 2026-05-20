import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className="disabled:cursor-default"
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              star <= (hovered || value) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId }) {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => base44.entities.Review.filter({ product_id: productId }),
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const mutation = useMutation({
    mutationFn: () => base44.entities.Review.create({
      product_id: productId,
      rating,
      comment,
      reviewer_name: user?.full_name || t('review.defaultName'),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      setRating(0);
      setComment('');
      setShowForm(false);
      toast.success(t('review.thanks'));
    },
  });

  return (
    <div className="mt-4 space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StarRating value={Math.round(avgRating || 0)} readonly />
          {avgRating ? (
            <span className="text-sm font-semibold">{avgRating} <span className="text-muted-foreground font-normal">({reviews.length} {reviews.length !== 1 ? t('review.reviewPlural') : t('review.reviewSingular')})</span></span>
          ) : (
            <span className="text-sm text-muted-foreground">{t('review.noReviews')}</span>
          )}
        </div>
        {isAuthenticated && !showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)} className="text-xs">
            {t('review.opinionBtn')}
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-muted/50 rounded-xl p-4 space-y-3">
          <StarRating value={rating} onChange={setRating} />
          <Textarea
            placeholder={t('review.placeholder')}
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={2}
            className="resize-none text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => mutation.mutate()} disabled={rating === 0 || mutation.isPending}>
              {t('review.publish')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>{t('review.cancel')}</Button>
          </div>
        </div>
      )}

      {/* List */}
      {reviews.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {reviews.map(r => (
            <div key={r.id} className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">{r.reviewer_name || t('review.defaultName')}</span>
                <StarRating value={r.rating} readonly />
              </div>
              {r.comment && <p className="text-xs text-muted-foreground">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}