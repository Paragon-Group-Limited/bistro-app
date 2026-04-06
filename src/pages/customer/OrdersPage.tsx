import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, CheckCircle2, XCircle, ChefHat, Package, RotateCcw, Store, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getCustomerOrders, getMenuItem } from '@/data/api';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ReorderButton } from '@/components/customer/ReorderButton';
import type { Order, OrderStatus } from '@/data/types';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const statusConfig: Record<OrderStatus, { label: string; icon: typeof Clock; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', icon: Clock, variant: 'outline' },
  accepted: { label: 'Accepted', icon: CheckCircle2, variant: 'secondary' },
  preparing: { label: 'Preparing', icon: ChefHat, variant: 'default' },
  ready: { label: 'Ready', icon: Package, variant: 'default' },
  completed: { label: 'Completed', icon: CheckCircle2, variant: 'secondary' },
  declined: { label: 'Declined', icon: XCircle, variant: 'destructive' },
};

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [prevStatusMap, setPrevStatusMap] = useState<Record<string, OrderStatus>>({});
  const { customer } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const handleReorder = async (items: Order['items']) => {
    // Add each order item back to cart
    for (const item of items) {
      const menuItem = await getMenuItem(item.menuItemId);
      for (let i = 0; i < item.quantity; i++) {
        addItem(menuItem, item.notes);
      }
    }
    // Navigate to menu to show updated cart
    navigate('/');
  };

  useEffect(() => {
    const customerId = customer?.id || 'cust-1';
    getCustomerOrders(customerId).then(all => {
      setOrders(all);
      setActiveOrders(all.filter(o => !['completed', 'declined'].includes(o.status)));
      setPastOrders(all.filter(o => ['completed', 'declined'].includes(o.status)));
    });
  }, [customer]);

  // Poll for active order updates
  useEffect(() => {
    if (activeOrders.length === 0) return;
    const id = setInterval(async () => {
      const customerId = customer?.id || 'cust-1';
      const all = await getCustomerOrders(customerId);
      const active = all.filter(o => !['completed', 'declined'].includes(o.status));
      const past = all.filter(o => ['completed', 'declined'].includes(o.status));

      // Check for status changes and notify
      active.forEach(order => {
        const oldStatus = prevStatusMap[order.id];
        if (oldStatus && oldStatus !== order.status) {
          const messages: Record<OrderStatus, string> = {
            pending: '📋 Order received',
            accepted: '✅ Kitchen accepted your order',
            preparing: '👨‍🍳 Your order is being prepared',
            ready: '🎉 Your order is ready for pickup!',
            completed: '🙌 Order completed',
            declined: '❌ Order declined',
          };
          toast.success(messages[order.status]);
        }
      });

      setActiveOrders(active);
      setPastOrders(past);
      setPrevStatusMap(prev => {
        const updated = { ...prev };
        active.forEach(o => { updated[o.id] = o.status; });
        return updated;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [activeOrders.length, customer, prevStatusMap]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderOrder = (order: Order, i: number) => {
    const config = statusConfig[order.status];
    const Icon = config.icon;
    const isActive = !['completed', 'declined'].includes(order.status);

    return (
      <motion.div
        key={order.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
      >
        <Card className={isActive ? 'border-primary/20' : ''}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm">{order.orderNumber}</span>
                  <Badge variant="outline" className="text-[10px] gap-1 capitalize">
                    {order.orderType === 'dine-in' && <Store className="w-2.5 h-2.5" />}
                    {order.orderType === 'takeaway' && <Package className="w-2.5 h-2.5" />}
                    {order.orderType === 'delivery' && <Truck className="w-2.5 h-2.5" />}
                    {order.orderType}
                  </Badge>
                  {order.tableNumber && (
                    <Badge variant="secondary" className="text-[10px]">
                      Table {order.tableNumber}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  {formatDate(order.createdAt)} · {formatTime(order.createdAt)}
                </p>
              </div>
              <Badge variant={config.variant} className="gap-1">
                <Icon className="w-3 h-3" />
                {config.label}
              </Badge>
            </div>

            {/* Progress bar for active orders */}
            {isActive && (
              <div className="mb-4 space-y-2">
                <div className="flex gap-1.5">
                  {['pending', 'accepted', 'preparing', 'ready'].map((step, idx) => {
                    const stepOrder = ['pending', 'accepted', 'preparing', 'ready'];
                    const currentIdx = stepOrder.indexOf(order.status);
                    return (
                      <div
                        key={step}
                        className={`h-2 flex-1 rounded-full transition-all ${
                          idx <= currentIdx ? 'bg-primary' : 'bg-muted/50'
                        }`}
                      />
                    );
                  })}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {order.status === 'pending' && '📋 Waiting for kitchen...'}
                  {order.status === 'accepted' && '✅ Kitchen received'}
                  {order.status === 'preparing' && '👨‍🍳 Being prepared'}
                  {order.status === 'ready' && '🎉 Ready for pickup!'}
                </div>
              </div>
            )}

            <div className="space-y-1 mb-3">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    <span className="font-mono mr-1.5">{item.quantity}×</span>
                    {item.menuItemName}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    ৳{item.unitPrice * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {order.orderType === 'delivery' && order.deliveryAddress && (
              <div className="rounded-lg bg-muted/50 p-2 mb-2">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Delivery to</p>
                <p className="text-xs">{order.deliveryAddress.address}, {order.deliveryAddress.area}</p>
                {order.deliveryAddress.instructions && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">{order.deliveryAddress.instructions}</p>
                )}
              </div>
            )}

            <Separator className="my-2" />

            <div className="space-y-1 mb-3">
              {order.deliveryFee && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Delivery Fee</span>
                  <span className="font-mono text-xs text-muted-foreground">৳{order.deliveryFee}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="font-mono font-bold text-primary">৳{order.total}</span>
              </div>
            </div>

            {!isActive && (
              <ReorderButton order={order} onReorder={handleReorder} />
            )}

            {order.status === 'declined' && order.declineReason && (
              <p className="text-xs text-destructive mt-2 italic">
                Reason: {order.declineReason}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Your Orders</h1>
              <p className="text-xs text-muted-foreground font-mono">{orders.length} total</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No orders yet</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
              Browse Menu
            </Button>
          </div>
        ) : (
          <>
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Active Orders
                </h2>
                <div className="space-y-3">
                  {activeOrders.map((order, i) => renderOrder(order, i))}
                </div>
              </div>
            )}

            {/* Past Orders */}
            {pastOrders.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Past Orders
                </h2>
                <div className="space-y-3">
                  {pastOrders.map((order, i) => renderOrder(order, i))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
