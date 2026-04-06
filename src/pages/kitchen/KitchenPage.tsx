import { useEffect, useState, useCallback, useRef } from 'react';
import { Clock, Check, X, ChefHat, Bell, Package, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOrders, updateOrderStatus } from '@/data/api';
import type { Order, OrderStatus } from '@/data/types';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { DeclineReasonDialog } from '@/components/kitchen/DeclineReasonDialog';
import { OrderTimer } from '@/components/kitchen/OrderTimer';
import { KitchenSearch } from '@/components/kitchen/KitchenSearch';
import { OrderPriorityBadge } from '@/components/kitchen/OrderPriorityBadge';

const columns: { status: OrderStatus; label: string; icon: typeof Clock; color: string }[] = [
  { status: 'pending', label: 'New Orders', icon: Bell, color: 'bg-orange-500' },
  { status: 'accepted', label: 'Accepted', icon: Check, color: 'bg-blue-500' },
  { status: 'preparing', label: 'Preparing', icon: ChefHat, color: 'bg-amber-500' },
  { status: 'ready', label: 'Ready', icon: Package, color: 'bg-emerald-500' },
];

function TimeAgo({ iso }: { iso: string }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return <span>just now</span>;
  if (mins < 60) return <span>{mins}m ago</span>;
  return <span>{Math.floor(mins / 60)}h {mins % 60}m ago</span>;
}

export function KitchenPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { play: playNotification } = useNotificationSound();
  const [orders, setOrders] = useState<Order[]>([]);
  const [declineId, setDeclineId] = useState<string | null>(null);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const prevPendingCountRef = useRef(0);

  const refresh = useCallback(async () => {
    const all = await getOrders();
    const active = all.filter(o => !['completed', 'declined'].includes(o.status));
    const pendingCount = active.filter(o => o.status === 'pending').length;

    // Play sound if new pending orders arrived
    if (pendingCount > prevPendingCountRef.current && prevPendingCountRef.current >= 0) {
      playNotification();
    }
    prevPendingCountRef.current = pendingCount;

    setOrders(active);
  }, [playNotification]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    if (newStatus === 'completed') toast.success('Order completed');
    refresh();
  };

  const handleDecline = async (reason: string) => {
    if (!declineId) return;
    await updateOrderStatus(declineId, 'declined', reason);
    setDeclineId(null);
    toast.info('Order declined');
    refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Kitchen Display</h1>
              <p className="text-xs text-muted-foreground font-mono">
                {orders.length} active order{orders.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { logout(); navigate('/staff/login'); }}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Kanban columns */}
      <main className="p-4 md:p-6">
        <div className="mb-4 max-w-sm">
          <KitchenSearch value={searchQuery} onChange={setSearchQuery} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {columns.map(col => {
            const colOrders = orders
              .filter(o => o.status === col.status)
              .filter(o => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return (
                  o.orderNumber.toLowerCase().includes(q) ||
                  (o.tableNumber && o.tableNumber.toString().includes(q))
                );
              });
            const Icon = col.icon;

            return (
              <div key={col.status} className="flex flex-col">
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={`w-2 h-2 rounded-full ${col.color}`} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {col.label}
                  </span>
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    {colOrders.length}
                  </Badge>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1">
                  <AnimatePresence mode="popLayout">
                    {colOrders.map(order => (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <Card className="overflow-hidden">
                          {/* Card header with colored accent */}
                          <CardHeader className={`px-4 py-2.5 flex flex-row items-center justify-between space-y-0 border-b-2 ${
                            col.status === 'pending' ? 'border-orange-500' :
                            col.status === 'accepted' ? 'border-blue-500' :
                            col.status === 'preparing' ? 'border-amber-500' : 'border-emerald-500'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm">{order.orderNumber}</span>
                              {order.tableNumber && (
                                <Badge variant="secondary" className="text-[10px]">
                                  T{order.tableNumber}
                                </Badge>
                              )}
                              <OrderPriorityBadge createdAt={order.createdAt} />
                            </div>
                            <div className="flex flex-col items-end gap-0.5">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                                <Clock className="w-3 h-3" />
                                <TimeAgo iso={order.createdAt} />
                              </div>
                              <div className="text-[10px] text-muted-foreground/70">
                                <OrderTimer createdAt={order.createdAt} compact />
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="p-0">
                            {/* Items */}
                            <div className="px-4 py-3 space-y-2">
                              {order.items.map(item => (
                                <div key={item.id} className="flex items-center gap-2">
                                  <Badge variant="outline" className="w-6 h-6 rounded-md flex items-center justify-center p-0 text-[10px] font-bold">
                                    {item.quantity}
                                  </Badge>
                                  <span className="text-sm">{item.menuItemName}</span>
                                </div>
                              ))}
                              {order.notes && (
                                <p className="text-xs text-primary mt-2 italic">
                                  📝 {order.notes}
                                </p>
                              )}
                            </div>

                            {/* Customer */}
                            <div className="px-4 py-2 border-t text-xs text-muted-foreground">
                              {order.customerName}
                            </div>

                            {/* Actions */}
                            <div className="px-3 py-2.5 border-t flex gap-2">
                              {order.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => handleStatusChange(order.id, 'accepted')}
                                  >
                                    <Check className="w-4 h-4 mr-1" /> Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                    onClick={() => {
                                      setDeclineId(order.id);
                                      setShowDeclineDialog(true);
                                    }}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {order.status === 'accepted' && (
                                <Button
                                  size="sm"
                                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                                  onClick={() => handleStatusChange(order.id, 'preparing')}
                                >
                                  <ChefHat className="w-4 h-4 mr-1" /> Start Preparing
                                </Button>
                              )}
                              {order.status === 'preparing' && (
                                <Button
                                  size="sm"
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                  onClick={() => handleStatusChange(order.id, 'ready')}
                                >
                                  <Package className="w-4 h-4 mr-1" /> Mark Ready
                                </Button>
                              )}
                              {order.status === 'ready' && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="flex-1"
                                  onClick={() => handleStatusChange(order.id, 'completed')}
                                >
                                  <Check className="w-4 h-4 mr-1" /> Complete
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {colOrders.length === 0 && (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <Icon className="w-6 h-6 text-muted-foreground/30 mb-2" />
                        <p className="text-xs text-muted-foreground">No orders</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Decline dialog */}
      <DeclineReasonDialog
        open={showDeclineDialog}
        onOpenChange={setShowDeclineDialog}
        onConfirm={handleDecline}
        orderId={declineId || ''}
      />
    </div>
  );
}
