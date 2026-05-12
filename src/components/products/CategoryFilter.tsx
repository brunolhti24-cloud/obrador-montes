import React from 'react';
import { Button } from '@/components/ui/button';
import { Beef, Fish, Bird, Flame, Layers, Drumstick } from 'lucide-react';

const categories = [
  { value: 'all', label: 'Todos', icon: Layers },
  { value: 'CERDO', label: 'Cerdo', icon: Beef },
  { value: 'RES', label: 'Res', icon: Beef },
  { value: 'BORREGO', label: 'Borrego', icon: Beef },
  { value: 'POLLO', label: 'Pollo', icon: Bird },
  { value: 'MARISCOS', label: 'Mariscos', icon: Fish },
  { value: 'PAPAS', label: 'Papas & Snacks', icon: Flame },
  { value: 'VARIOS', label: 'Varios', icon: Layers },
];

export default function CategoryFilter({ selected, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map(cat => {
        const Icon = cat.icon;
        const isActive = selected === cat.value;
        return (
          <Button
            key={cat.value}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(cat.value)}
            className={`whitespace-nowrap font-body text-xs shrink-0 ${
              isActive ? 'bg-primary text-primary-foreground' : ''
            }`}
          >
            <Icon className="w-3.5 h-3.5 mr-1.5" />
            {cat.label}
          </Button>
        );
      })}
    </div>
  );
}