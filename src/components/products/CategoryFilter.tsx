import React from 'react';
import { Button } from '@/components/ui/button';
import { Beef, Fish, Bird, Flame, Layers, Drumstick } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

const categoryKeys = [
  { value: 'all', key: 'cat.all', icon: Layers },
  { value: 'CERDO', key: 'cat.CERDO', icon: Beef },
  { value: 'RES', key: 'cat.RES', icon: Beef },
  { value: 'BORREGO', key: 'cat.BORREGO', icon: Beef },
  { value: 'POLLO', key: 'cat.POLLO', icon: Bird },
  { value: 'MARISCOS', key: 'cat.MARISCOS', icon: Fish },
  { value: 'PAPAS', key: 'cat.PAPAS', icon: Flame },
  { value: 'VARIOS', key: 'cat.VARIOS', icon: Layers },
];

export default function CategoryFilter({ selected, onChange }) {
  const { t } = useLanguage();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categoryKeys.map(cat => {
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
            {t(cat.key)}
          </Button>
        );
      })}
    </div>
  );
}