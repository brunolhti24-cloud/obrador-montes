import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem, isWholesaleEligible } = useCart();
  const price = isWholesaleEligible ? item.wholesale_price : item.base_price;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-border/50 last:border-0">
      <div className="flex-1 min-w-0">
        <h4 className="font-heading font-semibold text-sm truncate">{item.product_name}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          ${price?.toFixed(0)} /kg
          {isWholesaleEligible && item.wholesale_price < item.base_price && (
            <span className="ml-2 text-amber-600 font-bold">(Mayoreo 40 kilos)</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => updateQuantity(item.product_id, item.quantity - 0.5)}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => updateQuantity(item.product_id, item.quantity + 0.5)}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      <div className="text-right min-w-[60px]">
        <p className="font-bold text-sm">${(price * item.quantity).toFixed(0)}</p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
        onClick={() => removeItem(item.product_id)}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}