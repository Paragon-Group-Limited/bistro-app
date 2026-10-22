import { useEffect, useState, useRef } from 'react';
import { ShoppingBag, Search, History, User, LogOut, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { MenuItemCard } from '@/components/customer/MenuItemCard';
import { MenuItemDetail } from '@/components/customer/MenuItemDetail';
import { CartSheet } from '@/components/customer/CartSheet';
import { MenuSkeleton } from '@/components/customer/MenuSkeleton';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { getCategories, getMenuItems, createOrder } from '@/data/api';
import type { Category, MenuItem } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterPrepTime, setFilterPrepTime] = useState<number | null>(null);
  const [filterDietary, setFilterDietary] = useState<string | null>(null);
  const [filterPrice, setFilterPrice] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { totalItems, items, subtotal, clearCart } = useCart();
  const { customer, logout } = useAuth();
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getCategories(), getMenuItems()]).then(([cats, items]) => {
      setCategories(cats);
      setMenuItems(items);
      if (cats.length > 0) setActiveCategory(cats[0].id);
    }).catch(() => {
      toast.error('Could not load the menu. Pull down to refresh.');
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const hasActiveFilters = !!(filterCategory || filterPrepTime || filterDietary || filterPrice);

  const applyFilters = (items: MenuItem[]) => {
    let result = items;
    if (filterCategory) result = result.filter(i => i.categoryId === filterCategory);
    if (filterPrepTime) result = result.filter(i => i.prepTimeMinutes <= filterPrepTime);
    if (filterDietary === 'vegetarian') result = result.filter(i => i.tags.includes('vegetarian'));
    if (filterDietary === 'spicy') result = result.filter(i => i.tags.includes('spicy'));
    if (filterPrice === 'under300') result = result.filter(i => i.price < 300);
    if (filterPrice === '300to600') result = result.filter(i => i.price >= 300 && i.price <= 600);
    if (filterPrice === 'over600') result = result.filter(i => i.price > 600);
    return result;
  };

  const filteredItems = applyFilters(
    searchQuery
      ? menuItems.filter(
          i =>
            i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : menuItems
  );

  const clearAllFilters = () => {
    setFilterCategory(null);
    setFilterPrepTime(null);
    setFilterDietary(null);
    setFilterPrice(null);
  };

  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    categoryRefs.current[catId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePlaceOrder = async (options: {
    orderType: import('@/data/types').OrderType;
    tableNumber?: string;
    deliveryAddress?: import('@/data/types').DeliveryAddress;
    notes: string;
    isUrgent: boolean;
  }) => {
    try {
      const customerId = customer?.id || 'cust-guest';
      const customerName = customer?.name || 'Guest';
      const order = await createOrder(customerId, customerName, items, {
        orderType: options.orderType,
        tableNumber: options.tableNumber,
        deliveryAddress: options.deliveryAddress,
        notes: options.notes,
        isUrgent: options.isUrgent,
      });
      clearCart();
      setCartOpen(false);
      navigate(`/order-confirmed?id=${order.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to place order';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-2xl mx-auto px-4 py-3">
          {/* Top row: logo + actions */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="text-primary">Bistro Central</span>
              </h1>
              {customer && (
                <p className="text-xs text-muted-foreground">
                  Hi, {customer.name.split(' ')[0]} 👋
                </p>
              )}
            </div>

            <div className="flex items-center gap-1">
              <ThemeToggle />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/orders')}
              >
                <History className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {customer && (
                    <>
                      <DropdownMenuLabel className="font-normal">
                        <p className="text-sm font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{customer.phone}</p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <History className="w-4 h-4 mr-2" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => { logout(); navigate('/login'); }}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCartOpen(true)}
                className="relative"
              >
                <ShoppingBag className="h-5 w-5" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key={totalItems}
                      initial={{ scale: 0 }}
                      animate={{ scale: [1.25, 1] }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full
                        bg-primary text-primary-foreground text-[10px] font-bold
                        flex items-center justify-center"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>

          {/* Search bar — always visible */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search menu..."
              className="pl-9 h-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Categories + filter button — single row */}
          <div className="flex items-center gap-2 mt-2.5 pb-1">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none flex-1 min-w-0">
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  variant={
                    hasActiveFilters
                      ? filterCategory === cat.id ? 'default' : 'secondary'
                      : activeCategory === cat.id ? 'default' : 'secondary'
                  }
                  size="sm"
                  onClick={() => {
                    if (hasActiveFilters) {
                      setFilterCategory(filterCategory === cat.id ? null : cat.id);
                    } else {
                      scrollToCategory(cat.id);
                    }
                  }}
                  className="shrink-0 text-xs h-8"
                >
                  {cat.name}
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`shrink-0 h-8 w-8 relative ${hasActiveFilters ? 'text-primary' : ''}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {hasActiveFilters && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
          </div>
        </div>

        {/* Expanded filter panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t"
            >
              <div className="max-w-2xl mx-auto px-4 py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filters</span>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs h-6 px-2">
                      <X className="w-3 h-3 mr-1" />
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Prep Time */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase mb-1.5">Prep Time</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      { label: 'Any', value: null },
                      { label: '< 5 min', value: 5 },
                      { label: '< 10 min', value: 10 },
                      { label: '< 15 min', value: 15 },
                      { label: '< 20 min', value: 20 },
                    ].map(opt => (
                      <Button
                        key={opt.label}
                        variant={filterPrepTime === opt.value ? 'default' : 'secondary'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setFilterPrepTime(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Dietary */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase mb-1.5">Dietary</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      { label: 'Any', value: null },
                      { label: 'Vegetarian', value: 'vegetarian' },
                      { label: 'Spicy', value: 'spicy' },
                    ].map(opt => (
                      <Button
                        key={opt.label}
                        variant={filterDietary === opt.value ? 'default' : 'secondary'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setFilterDietary(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase mb-1.5">Price</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      { label: 'Any', value: null },
                      { label: 'Under ৳300', value: 'under300' },
                      { label: '৳300–৳600', value: '300to600' },
                      { label: 'Over ৳600', value: 'over600' },
                    ].map(opt => (
                      <Button
                        key={opt.label}
                        variant={filterPrice === opt.value ? 'default' : 'secondary'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setFilterPrice(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Menu Items */}
      <main className="max-w-2xl mx-auto px-4 py-4 pb-28">
        {loading ? (
          <MenuSkeleton />
        ) : searchQuery || hasActiveFilters ? (
          <div>
            <p className="text-xs text-muted-foreground mb-3 font-mono">
              {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
              {searchQuery && <> for &quot;{searchQuery}&quot;</>}
              {hasActiveFilters && !searchQuery && <> with filters</>}
            </p>
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">No items match your filters</p>
                <Button variant="link" size="sm" onClick={clearAllFilters} className="mt-2">
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredItems.map((item, i) => (
                  <MenuItemCard key={item.id} item={item} index={i} onSelect={setSelectedItem} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
          {/* Popular Items */}
          {(() => {
            const popular = menuItems.filter(i => i.tags.includes('bestseller') && i.isAvailable).slice(0, 4);
            if (popular.length === 0) return null;
            return (
              <div className="mb-8">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">🔥 Popular</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Most ordered items</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {popular.map((item, i) => (
                    <MenuItemCard key={`pop-${item.id}`} item={item} index={i} onSelect={setSelectedItem} />
                  ))}
                </div>
              </div>
            );
          })()}

          {categories.map(cat => {
            const catItems = menuItems.filter(i => i.categoryId === cat.id);
            if (catItems.length === 0) return null;
            return (
              <div
                key={cat.id}
                ref={el => { categoryRefs.current[cat.id] = el; }}
                className="mb-8 scroll-mt-36"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">{cat.name}</h2>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {catItems.map((item, i) => (
                    <MenuItemCard key={item.id} item={item} index={i} onSelect={setSelectedItem} />
                  ))}
                </div>
              </div>
            );
          })
        }
          </>
        )}
      </main>

      {/* Floating Cart Bar */}
      <AnimatePresence>
        {totalItems > 0 && !cartOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-30 p-4"
          >
            <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => setCartOpen(true)}
              className="w-full max-w-2xl mx-auto h-14 rounded-xl flex items-center justify-between px-6"
              size="lg"
            >
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm">
                  {totalItems}
                </Badge>
                <span className="font-semibold">View Order</span>
              </div>
              <span className="font-mono font-bold text-lg">৳{subtotal}</span>
            </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Sheet */}
      <CartSheet isOpen={cartOpen} onClose={() => setCartOpen(false)} onPlaceOrder={handlePlaceOrder} />

      {/* Item Detail Dialog */}
      <MenuItemDetail
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
