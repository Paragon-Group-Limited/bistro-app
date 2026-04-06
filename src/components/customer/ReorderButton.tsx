import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Order } from '@/data/types';

interface ReorderButtonProps {
  order: Order;
  onReorder: (items: Order['items']) => void;
}

export function ReorderButton({ order, onReorder }: ReorderButtonProps) {
  const handleReorder = () => {
    if (order.items.length === 0) {
      toast.error('No items to reorder');
      return;
    }
    onReorder(order.items);
    toast.success(`${order.items.length} item${order.items.length !== 1 ? 's' : ''} added to cart`);
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleReorder}
      className="gap-1.5"
    >
      <RotateCcw className="w-3.5 h-3.5" />
      Reorder
    </Button>
  );
}
