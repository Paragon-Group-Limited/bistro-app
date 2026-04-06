import { useEffect, useState } from 'react';
import { ShoppingBag, DollarSign, Calendar } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getCustomerOrders } from '@/data/api';
import type { Customer, Order } from '@/data/types';

interface CustomerDetailSheetProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailSheet({ customer, open, onOpenChange }: CustomerDetailSheetProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer && open) {
      setLoading(true);
      getCustomerOrders(customer.id).then(o => {
        setOrders(o);
        setLoading(false);
      });
    }
  }, [customer, open]);

  if (!customer) return null;

  const memberSince = new Date(customer.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Customer Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
              {customer.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold truncate">{customer.name}</p>
              <p className="text-sm text-muted-foreground font-mono">{customer.phone}</p>
              {customer.email && (
                <p className="text-sm text-muted-foreground truncate">{customer.email}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="pt-4 pb-3 px-3 text-center">
                <ShoppingBag className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-bold font-mono">{customer.totalOrders}</p>
                <p className="text-[10px] text-muted-foreground">Orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-3 text-center">
                <DollarSign className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-bold font-mono text-primary">৳{customer.totalSpent.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Total Spent</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-3 text-center">
                <Calendar className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm font-bold">{memberSince}</p>
                <p className="text-[10px] text-muted-foreground">Member Since</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Order History */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Order History</h3>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No orders yet</p>
            ) : (
              <div className="space-y-2">
                {orders.map(order => (
                  <Card key={order.id}>
                    <CardContent className="flex items-center gap-3 py-3 px-4">
                      <span className="font-mono font-bold text-sm w-14">{order.orderNumber}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          {order.tableNumber && ` · Table ${order.tableNumber}`}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span className="font-mono text-sm font-semibold text-primary">৳{order.total}</span>
                      <Badge
                        variant={
                          order.status === 'completed' ? 'secondary' :
                          order.status === 'declined' ? 'destructive' : 'default'
                        }
                        className="capitalize text-[10px]"
                      >
                        {order.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
