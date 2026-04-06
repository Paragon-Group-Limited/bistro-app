import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, ArrowRight, ShoppingBag, Store, Package, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getOrder } from '@/data/api';
import type { Order } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function OrderConfirmation() {
  const [order, setOrder] = useState<Order | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('id');

  useEffect(() => {
    if (orderId) {
      getOrder(orderId).then(o => o && setOrder(o));
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </motion.div>

        <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Your order has been sent to the kitchen
        </p>

        {order && (
          <Card className="mb-6 text-left">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold">{order.orderNumber}</span>
                  <Badge variant="outline" className="text-[10px] gap-1 capitalize">
                    {order.orderType === 'dine-in' && <Store className="w-2.5 h-2.5" />}
                    {order.orderType === 'takeaway' && <Package className="w-2.5 h-2.5" />}
                    {order.orderType === 'delivery' && <Truck className="w-2.5 h-2.5" />}
                    {order.orderType}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Just now
                </div>
              </div>
              <Separator />
              {order.items.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    <span className="font-mono mr-1">{item.quantity}×</span>
                    {item.menuItemName}
                  </span>
                  <span className="font-mono text-xs">৳{item.unitPrice * item.quantity}</span>
                </div>
              ))}
              <Separator />
              {order.deliveryFee && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span className="font-mono">৳{order.deliveryFee}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="font-mono font-bold text-primary text-lg">৳{order.total}</span>
              </div>
              {order.tableNumber && (
                <p className="text-xs text-muted-foreground">Table {order.tableNumber}</p>
              )}
              {order.deliveryAddress && (
                <p className="text-xs text-muted-foreground">
                  Delivery: {order.deliveryAddress.address}, {order.deliveryAddress.area}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <Button onClick={() => navigate('/orders')} className="w-full">
            Track Order
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={() => navigate('/')} className="w-full">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Order More
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
