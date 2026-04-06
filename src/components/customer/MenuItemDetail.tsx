import { Plus, Minus, Clock, Flame, Leaf, Star, Sparkles, UtensilsCrossed } from 'lucide-react';
import type { MenuItem } from '@/data/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MenuItemDetailProps {
  item: MenuItem | null;
  open: boolean;
  onClose: () => void;
}

const tagIcons: Record<string, typeof Flame> = {
  spicy: Flame,
  vegetarian: Leaf,
  bestseller: Star,
  new: Sparkles,
};

export function MenuItemDetail({ item, open, onClose }: MenuItemDetailProps) {
  const { items, addItem, updateQuantity } = useCart();

  if (!item) return null;

  const cartItem = items.find(i => i.menuItem.id === item.id);
  const qty = cartItem?.quantity || 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{item.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image */}
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted -mt-2">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {item.tags.map(tag => {
                const Icon = tagIcons[tag];
                return (
                  <Badge
                    key={tag}
                    variant={tag === 'bestseller' ? 'default' : tag === 'spicy' ? 'destructive' : 'secondary'}
                  >
                    {Icon && <Icon className="w-3 h-3 mr-1" />}
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>

          <Separator />

          {/* Details */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold font-mono text-primary">৳{item.price}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Price</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-lg font-bold">
                <Clock className="w-4 h-4 text-muted-foreground" />
                {item.prepTimeMinutes}m
              </div>
              <p className="text-[10px] text-muted-foreground uppercase">Prep Time</p>
            </div>
            {item.calories && (
              <div>
                <p className="text-lg font-bold">{item.calories}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Calories</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Add to cart */}
          {!item.isAvailable ? (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground italic">Currently unavailable</p>
            </div>
          ) : qty === 0 ? (
            <Button onClick={() => { addItem(item); onClose(); }} className="w-full" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add to Order — ৳{item.price}
            </Button>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, qty - 1)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-10 text-center text-lg font-bold">{qty}</span>
                <Button
                  size="icon"
                  onClick={() => addItem(item)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-lg font-bold font-mono text-primary">
                ৳{item.price * qty}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
