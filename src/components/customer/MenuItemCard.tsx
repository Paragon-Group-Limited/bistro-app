import { Plus, Minus, Clock, Flame, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MenuItem } from '@/data/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface MenuItemCardProps {
  item: MenuItem;
  index: number;
  onSelect: (item: MenuItem) => void;
}

export function MenuItemCard({ item, index, onSelect }: MenuItemCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find(i => i.menuItem.id === item.id);
  const qty = cartItem?.quantity || 0;

  const tagConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    bestseller: { label: 'Popular', variant: 'default' },
    new: { label: 'New', variant: 'secondary' },
    spicy: { label: 'Spicy', variant: 'destructive' },
    vegetarian: { label: 'Veg', variant: 'outline' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      style={{ willChange: 'opacity, transform' }}
    >
      <Card className={`overflow-hidden transition-all duration-200 cursor-pointer
        ${!item.isAvailable ? 'opacity-50 pointer-events-none' : 'hover:shadow-md hover:border-primary/20'}
        ${qty > 0 ? 'ring-1 ring-primary/30' : ''}`}
      >
        {/* Image */}
        <div className="relative w-full h-36 bg-muted" onClick={() => onSelect(item)}>
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UtensilsCrossed className="w-10 h-10 text-muted-foreground/30" />
            </div>
          )}
          {/* Tags overlay */}
          {item.tags.length > 0 && (
            <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
              {item.tags.map(tag => {
                const config = tagConfig[tag];
                if (!config) return null;
                return (
                  <Badge key={tag} variant={config.variant} className="text-[10px]">
                    {tag === 'spicy' && <Flame className="w-3 h-3 mr-0.5" />}
                    {config.label}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        <CardContent className="p-4" onClick={() => onSelect(item)}>
          {/* Name & Price */}
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <h3 className="font-semibold text-base leading-tight">
              {item.name}
            </h3>
            <span className="font-mono font-bold text-primary text-sm whitespace-nowrap shrink-0">
              ৳{item.price}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
            {item.description}
          </p>

          {/* Meta & Add button */}
          <div className="flex items-center justify-between" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {item.prepTimeMinutes}m
              </span>
              {item.calories && (
                <span>{item.calories} cal</span>
              )}
            </div>

            {!item.isAvailable ? (
              <span className="text-xs text-muted-foreground italic">Unavailable</span>
            ) : qty === 0 ? (
              <motion.div whileTap={{ scale: 0.93 }}>
                <Button size="sm" onClick={() => addItem(item)} className="gap-1 min-h-[36px]">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </motion.div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => updateQuantity(item.id, qty - 1)}
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <span className="w-8 text-center text-sm font-semibold text-primary">
                  {qty}
                </span>
                <Button
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => addItem(item)}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
