import { X, Minus, Plus, ShoppingBag, Trash2, Store, Package, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import type { OrderType, DeliveryAddress } from '@/data/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceOrder: (options: {
    orderType: OrderType;
    tableNumber?: string;
    deliveryAddress?: DeliveryAddress;
    notes: string;
  }) => void;
}

const DELIVERY_FEE = 60;

export function CartSheet({ isOpen, onClose, onPlaceOrder }: CartSheetProps) {
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useCart();
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);

  // Delivery address fields
  const [deliveryName, setDeliveryName] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  const total = subtotal + (orderType === 'delivery' ? DELIVERY_FEE : 0);

  const canPlace = () => {
    if (orderType === 'dine-in') return !!tableNumber.trim();
    if (orderType === 'delivery') return !!deliveryName.trim() && !!deliveryPhone.trim() && !!deliveryAddress.trim() && !!deliveryArea.trim();
    return true; // takeaway needs nothing extra
  };

  const handlePlaceOrder = async () => {
    if (!canPlace()) return;
    setPlacing(true);
    await new Promise(r => setTimeout(r, 800));
    onPlaceOrder({
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      deliveryAddress: orderType === 'delivery' ? {
        fullName: deliveryName,
        phone: deliveryPhone,
        address: deliveryAddress,
        area: deliveryArea,
        instructions: deliveryInstructions || undefined,
      } : undefined,
      notes,
    });
    setPlacing(false);
    setTableNumber('');
    setNotes('');
    setDeliveryName('');
    setDeliveryPhone('');
    setDeliveryAddress('');
    setDeliveryArea('');
    setDeliveryInstructions('');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="space-y-2.5 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Your Order
            <span className="text-xs text-muted-foreground font-mono ml-auto">
              ({items.length} {items.length === 1 ? 'item' : 'items'})
            </span>
          </SheetTitle>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Your cart is empty</p>
              <p className="text-xs mt-1">Add items from the menu</p>
            </div>
          ) : (
            <>
              {items.map(cartItem => (
                <motion.div
                  key={cartItem.menuItem.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm truncate">
                        {cartItem.menuItem.name}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(cartItem.menuItem.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold">{cartItem.quantity}</span>
                        <Button
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <span className="font-mono text-sm font-semibold text-primary">
                        ৳{cartItem.menuItem.price * cartItem.quantity}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear all
              </Button>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <SheetFooter className="flex-col space-y-4 pt-4 border-t">
            {/* Order Type Selector */}
            <div className="w-full space-y-2">
              <Label className="text-xs font-medium">Order Type</Label>
              <RadioGroup
                value={orderType}
                onValueChange={v => setOrderType(v as OrderType)}
                className="grid grid-cols-3 gap-2"
              >
                <Label
                  htmlFor="type-dine-in"
                  className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 cursor-pointer transition-colors ${
                    orderType === 'dine-in' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'
                  }`}
                >
                  <RadioGroupItem value="dine-in" id="type-dine-in" className="sr-only" />
                  <Store className="w-4 h-4" />
                  <span className="text-xs font-medium">Dine In</span>
                </Label>
                <Label
                  htmlFor="type-takeaway"
                  className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 cursor-pointer transition-colors ${
                    orderType === 'takeaway' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'
                  }`}
                >
                  <RadioGroupItem value="takeaway" id="type-takeaway" className="sr-only" />
                  <Package className="w-4 h-4" />
                  <span className="text-xs font-medium">Takeaway</span>
                </Label>
                <Label
                  htmlFor="type-delivery"
                  className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 cursor-pointer transition-colors ${
                    orderType === 'delivery' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'
                  }`}
                >
                  <RadioGroupItem value="delivery" id="type-delivery" className="sr-only" />
                  <Truck className="w-4 h-4" />
                  <span className="text-xs font-medium">Delivery</span>
                </Label>
              </RadioGroup>
            </div>

            {/* Dine-in: Table Number */}
            {orderType === 'dine-in' && (
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="space-y-1.5">
                  <Label htmlFor="table" className="text-xs">Table Number *</Label>
                  <Input
                    id="table"
                    value={tableNumber}
                    onChange={e => setTableNumber(e.target.value)}
                    placeholder="e.g. 7"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs">Notes</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Special requests..."
                    className="h-9"
                  />
                </div>
              </div>
            )}

            {/* Takeaway: just notes */}
            {orderType === 'takeaway' && (
              <div className="w-full space-y-1.5">
                <Label htmlFor="notes-ta" className="text-xs">Notes</Label>
                <Input
                  id="notes-ta"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Special requests..."
                  className="h-9"
                />
              </div>
            )}

            {/* Delivery: full address form */}
            {orderType === 'delivery' && (
              <div className="w-full space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Full Name *</Label>
                    <Input value={deliveryName} onChange={e => setDeliveryName(e.target.value)} placeholder="Your name" className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Phone *</Label>
                    <Input value={deliveryPhone} onChange={e => setDeliveryPhone(e.target.value)} placeholder="+880..." className="h-9" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Address *</Label>
                  <Input value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="House, Road, Block" className="h-9" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Area *</Label>
                    <Input value={deliveryArea} onChange={e => setDeliveryArea(e.target.value)} placeholder="e.g. Gulshan" className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Instructions</Label>
                    <Input value={deliveryInstructions} onChange={e => setDeliveryInstructions(e.target.value)} placeholder="Ring bell..." className="h-9" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes-del" className="text-xs">Notes</Label>
                  <Input
                    id="notes-del"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Special requests..."
                    className="h-9"
                  />
                </div>
              </div>
            )}

            <Separator />

            {/* Total */}
            <div className="w-full space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Subtotal</span>
                <span className="text-sm font-mono">৳{subtotal}</span>
              </div>
              {orderType === 'delivery' && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Delivery Fee</span>
                  <span className="text-sm font-mono">৳{DELIVERY_FEE}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-medium">Total</span>
                <span className="text-2xl font-bold font-mono">৳{total}</span>
              </div>
            </div>

            {/* Place Order */}
            <Button
              onClick={handlePlaceOrder}
              disabled={!canPlace() || placing}
              className="w-full"
              size="lg"
            >
              {placing ? 'Placing Order...' : 'Place Order'}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
