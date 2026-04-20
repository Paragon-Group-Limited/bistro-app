import { Plus, Minus, Clock, Flame, Leaf, Star, Sparkles, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { MenuItem } from '@/data/types';
import { getProductReviews } from '@/data/api';
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
  const [pendingQty, setPendingQty] = useState(1);
  const [reviews, setReviews] = useState<Array<{ id: number; rating: number; comment: string | null; customer_name: string; created_at: string }>>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [avgRating, setAvgRating] = useState<number | null>(null);

  // Reset pending qty and fetch reviews when opening a new item
  useEffect(() => {
    if (open && item) {
      setPendingQty(1);
      getProductReviews(item.id).then(res => {
        setReviews(res.items);
        setReviewCount(res.total);
        if (res.items.length > 0) {
          const avg = res.items.reduce((sum, r) => sum + r.rating, 0) / res.items.length;
          setAvgRating(avg);
        } else {
          setAvgRating(item.avgRating ?? null);
        }
      }).catch(() => { /* non-critical */ });
    }
  }, [open, item?.id]);

  if (!item) return null;

  const cartItem = items.find(i => i.menuItem.id === item.id);
  const inCartQty = cartItem?.quantity || 0;

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
            {(avgRating !== null || (item.reviewCount ?? 0) > 0) && (
              <div>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  <span className="text-lg font-bold">{(avgRating ?? item.avgRating ?? 0).toFixed(1)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase">{reviewCount || item.reviewCount || 0} Reviews</p>
              </div>
            )}
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
          ) : inCartQty > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, inCartQty - 1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-10 text-center text-lg font-bold">{inCartQty}</span>
                  <Button
                    size="icon"
                    onClick={() => addItem(item)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-lg font-bold font-mono text-primary">
                  ৳{item.price * inCartQty}
                </span>
              </div>
              <p className="text-xs text-center text-muted-foreground">Already in your cart</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPendingQty(Math.max(1, pendingQty - 1))}
                  disabled={pendingQty <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-10 text-center text-lg font-bold">{pendingQty}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPendingQty(pendingQty + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={() => {
                    for (let i = 0; i < pendingQty; i++) addItem(item);
                    onClose();
                  }}
                  className="w-full"
                  size="lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add {pendingQty} to Order — ৳{item.price * pendingQty}
                </Button>
              </motion.div>
            </div>
          )}
          {/* Reviews */}
          {reviews.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400" />
                  Reviews ({reviewCount})
                </h4>
                {reviews.map(r => (
                  <div key={r.id} className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </span>
                      <span className="text-xs text-muted-foreground">{r.customer_name}</span>
                    </div>
                    {r.comment && (
                      <p className="text-muted-foreground text-xs leading-relaxed">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
