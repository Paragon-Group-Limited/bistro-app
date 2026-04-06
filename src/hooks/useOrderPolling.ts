import { useEffect, useRef, useCallback } from 'react';
import { getOrder } from '@/data/api';
import type { Order, OrderStatus } from '@/data/types';

type StatusChangeCallback = (order: Order, newStatus: OrderStatus, oldStatus: OrderStatus) => void;

export function useOrderPolling(
  orderId: string | null,
  interval: number = 5000,
  onStatusChange?: StatusChangeCallback
) {
  const prevStatusRef = useRef<OrderStatus | null>(null);

  const checkOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const order = await getOrder(orderId);
      if (order && prevStatusRef.current && order.status !== prevStatusRef.current) {
        onStatusChange?.(order, order.status, prevStatusRef.current);
      }
      if (order) prevStatusRef.current = order.status;
    } catch (err) {
      console.error('Order polling error:', err);
    }
  }, [orderId, onStatusChange]);

  useEffect(() => {
    if (!orderId) return;
    checkOrder(); // Initial check
    const id = setInterval(checkOrder, interval);
    return () => clearInterval(id);
  }, [orderId, interval, checkOrder]);
}
