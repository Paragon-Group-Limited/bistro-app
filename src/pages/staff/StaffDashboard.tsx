import { useEffect, useState } from 'react';
import { UtensilsCrossed, Users, ClipboardList, ChevronRight, TrendingUp, ShoppingBag, Clock, DollarSign, Search, UserCog, Store, Package, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDashboardStats, getMenuItems, getCategories, getAllCategories, getCustomers, getOrders, getStaff, updateMenuItemAvailability, addMenuItem, editMenuItem, addStaff, editStaff, deleteStaff, editCustomer, deleteCustomer } from '@/data/api';
import type { MenuItem, Customer, Order, StaffMember, StaffRole, Category } from '@/data/types';
import { AddMenuItemDialog } from '@/components/staff/AddMenuItemDialog';
import { EditMenuItemDialog } from '@/components/staff/EditMenuItemDialog';
import { AddStaffDialog } from '@/components/staff/AddStaffDialog';
import { EditStaffDialog } from '@/components/staff/EditStaffDialog';
import { EditCustomerDialog } from '@/components/staff/EditCustomerDialog';
import { CustomerDetailSheet } from '@/components/staff/CustomerDetailSheet';
import { CategoryManager } from '@/components/staff/CategoryManager';
import { StaffLayout } from '@/components/staff/StaffLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Tab = 'dashboard' | 'menu' | 'orders' | 'customers' | 'team';

function StatCard({ label, value, icon: Icon, description }: { label: string; value: string | number; icon: typeof TrendingUp; description?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

export function StaffDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');
  const [customerSearch, setCustomerSearch] = useState('');
  const [teamRoleFilter, setTeamRoleFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSheetOpen, setCustomerSheetOpen] = useState(false);

  const refreshData = async () => {
    getDashboardStats().then(setStats);
    getOrders().then(setAllOrders);
  };

  useEffect(() => {
    getDashboardStats().then(setStats);
    getAllCategories().then(setCategories);
    getMenuItems().then(setMenuItems);
    getCustomers().then(setCustomers);
    getOrders().then(setAllOrders);
    getStaff().then(setStaffList);

    // Auto-refresh stats and orders every 10s
    const id = setInterval(refreshData, 10000);
    return () => clearInterval(id);
  }, []);

  const toggleAvailability = async (item: MenuItem) => {
    const updated = await updateMenuItemAvailability(item.id, !item.isAvailable);
    setMenuItems(prev => prev.map(i => i.id === updated.id ? updated : i));
  };

  const handleAddItem = async (data: { name: string; description: string; price: number; categoryId: string; prepTimeMinutes: number; image?: string }) => {
    const newItem = await addMenuItem(data);
    setMenuItems(prev => [...prev, newItem]);
  };

  const handleEditItem = async (id: string, updates: Partial<MenuItem>) => {
    const updated = await editMenuItem(id, updates);
    setMenuItems(prev => prev.map(i => i.id === id ? updated : i));
  };

  const handleAddStaff = async (data: { name: string; phone: string; email?: string; role: StaffRole }) => {
    const newMember = await addStaff(data);
    setStaffList(prev => [...prev, newMember]);
  };

  const handleEditStaff = async (id: string, updates: Partial<StaffMember>) => {
    const updated = await editStaff(id, updates);
    setStaffList(prev => prev.map(s => s.id === id ? updated : s));
  };

  const handleToggleStaffActive = async (member: StaffMember) => {
    if (member.isActive) {
      const updated = await deleteStaff(member.id);
      setStaffList(prev => prev.map(s => s.id === member.id ? updated : s));
    } else {
      const updated = await editStaff(member.id, { isActive: true });
      setStaffList(prev => prev.map(s => s.id === member.id ? updated : s));
    }
  };

  const handleEditCustomer = async (id: string, updates: Partial<Customer>) => {
    const updated = await editCustomer(id, updates);
    setCustomers(prev => prev.map(c => c.id === id ? updated : c));
  };

  const handleDeleteCustomer = async (id: string) => {
    await deleteCustomer(id);
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSheetOpen(true);
  };

  const filteredOrders = orderFilter === 'all'
    ? allOrders
    : allOrders.filter(o => o.status === orderFilter);

  const filteredMenu = menuItems.filter(i => {
    if (menuSearch && !i.name.toLowerCase().includes(menuSearch.toLowerCase())) return false;
    if (menuCategoryFilter !== 'all' && i.categoryId !== menuCategoryFilter) return false;
    return true;
  });

  const filteredCustomers = customerSearch
    ? customers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch)
      )
    : customers;

  const filteredStaff = teamRoleFilter === 'all'
    ? staffList
    : staffList.filter(s => s.role === teamRoleFilter);

  const menuItemCounts = menuItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.categoryId] = (acc[item.categoryId] || 0) + 1;
    return acc;
  }, {});

  return (
    <StaffLayout activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as Tab)}>
      <AnimatePresence mode="wait">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && stats && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold">Dashboard</h2>
                  <p className="text-sm text-muted-foreground">Overview of today's operations</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard label="Orders Today" value={stats.totalOrdersToday} icon={ShoppingBag} />
                  <StatCard label="Revenue" value={`৳${stats.revenueToday.toLocaleString()}`} icon={DollarSign} />
                  <StatCard label="Pending" value={stats.pendingOrders} icon={Clock} />
                  <StatCard label="Avg Order" value={`৳${stats.avgOrderValue}`} icon={TrendingUp} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <StatCard label="Preparing" value={stats.preparingOrders} icon={UtensilsCrossed} />
                  <StatCard label="Ready" value={stats.readyOrders} icon={ClipboardList} />
                  <StatCard label="Customers" value={stats.totalCustomers} icon={Users} />
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">All Orders</h2>
                    <p className="text-sm text-muted-foreground">{allOrders.length} total orders</p>
                  </div>
                  <div className="flex gap-2">
                    {['all', 'pending', 'preparing', 'ready', 'completed'].map(f => (
                      <Button
                        key={f}
                        variant={orderFilter === f ? 'default' : 'secondary'}
                        size="sm"
                        onClick={() => setOrderFilter(f)}
                        className="capitalize text-xs"
                      >
                        {f}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {filteredOrders.map(order => (
                    <Card key={order.id} className="hover:bg-muted/50 transition-colors">
                      <CardContent className="flex items-center gap-4 py-3 px-4">
                        <span className="font-mono font-bold text-sm w-14">{order.orderNumber}</span>
                        <Badge variant="outline" className="text-[10px] gap-0.5 shrink-0">
                          {order.orderType === 'dine-in' && <Store className="w-2.5 h-2.5" />}
                          {order.orderType === 'takeaway' && <Package className="w-2.5 h-2.5" />}
                          {order.orderType === 'delivery' && <Truck className="w-2.5 h-2.5" />}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex-1 truncate">{order.customerName}</span>
                        {order.tableNumber && (
                          <Badge variant="secondary" className="text-[10px]">
                            T{order.tableNumber}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground font-mono w-16 text-right">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </span>
                        <span className="font-mono text-sm font-semibold w-16 text-right text-primary">৳{order.total}</span>
                        <Badge
                          variant={
                            order.status === 'completed' ? 'secondary' :
                            order.status === 'declined' ? 'destructive' : 'default'
                          }
                          className="capitalize w-20 justify-center text-[10px]"
                        >
                          {order.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Menu Tab */}
            {activeTab === 'menu' && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Menu Management</h2>
                    <p className="text-sm text-muted-foreground">{menuItems.length} items · {categories.length} categories</p>
                  </div>
                  <div className="flex gap-2">
                    <CategoryManager categories={categories} onUpdate={setCategories} menuItemCounts={menuItemCounts} />
                    <AddMenuItemDialog categories={categories} onAdd={handleAddItem} />
                  </div>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={menuSearch}
                    onChange={e => setMenuSearch(e.target.value)}
                    placeholder="Search menu items..."
                    className="pl-9"
                  />
                </div>

                <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none pb-1">
                  <Button
                    variant={menuCategoryFilter === 'all' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => setMenuCategoryFilter('all')}
                    className="text-xs shrink-0"
                  >
                    All ({menuItems.length})
                  </Button>
                  {categories.filter(c => c.isActive).map(cat => {
                    const count = menuItemCounts[cat.id] || 0;
                    return (
                      <Button
                        key={cat.id}
                        variant={menuCategoryFilter === cat.id ? 'default' : 'secondary'}
                        size="sm"
                        onClick={() => setMenuCategoryFilter(menuCategoryFilter === cat.id ? 'all' : cat.id)}
                        className="text-xs shrink-0"
                      >
                        {cat.name} ({count})
                      </Button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  {filteredMenu.map(item => (
                    <Card key={item.id} className={`transition-opacity ${!item.isAvailable ? 'opacity-50' : ''}`}>
                      <CardContent className="flex items-center gap-4 py-3 px-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{item.name}</span>
                            {item.tags.map(t => (
                              <Badge
                                key={t}
                                variant={t === 'bestseller' ? 'default' : t === 'new' ? 'secondary' : 'outline'}
                                className="text-[10px]"
                              >
                                {t}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{item.description}</p>
                        </div>
                        <span className="font-mono text-sm font-semibold text-primary shrink-0">
                          ৳{item.price}
                        </span>
                        <EditMenuItemDialog item={item} categories={categories} onEdit={handleEditItem} />
                        <Switch
                          checked={item.isAvailable}
                          onCheckedChange={() => toggleAvailability(item)}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Customers Tab */}
            {activeTab === 'customers' && (
              <motion.div
                key="customers"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Customers</h2>
                    <p className="text-sm text-muted-foreground">{customers.length} registered customers</p>
                  </div>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    placeholder="Search by name or phone..."
                    className="pl-9"
                  />
                </div>

                <div className="space-y-2">
                  {filteredCustomers.map(cust => (
                    <Card key={cust.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleViewCustomer(cust)}>
                      <CardContent className="flex items-center gap-4 py-3 px-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center
                          text-sm font-bold text-primary shrink-0">
                          {cust.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{cust.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{cust.phone}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-mono font-semibold">৳{cust.totalSpent.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{cust.totalOrders} orders</p>
                        </div>
                        <EditCustomerDialog customer={cust} onEdit={handleEditCustomer} />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={e => e.stopPropagation()}
                            >
                              <span className="text-xs">✕</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={e => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove {cust.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the customer from the system. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCustomer(cust.id)}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <CustomerDetailSheet
                  customer={selectedCustomer}
                  open={customerSheetOpen}
                  onOpenChange={setCustomerSheetOpen}
                />
              </motion.div>
            )}
            {/* Team Tab */}
            {activeTab === 'team' && (
              <motion.div
                key="team"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Team</h2>
                    <p className="text-sm text-muted-foreground">{staffList.length} staff members · Manage accounts and roles</p>
                  </div>
                  <AddStaffDialog onAdd={handleAddStaff} />
                </div>

                <div className="flex gap-2 mb-4">
                  {['all', 'admin', 'manager', 'kitchen', 'waiter'].map(f => (
                    <Button
                      key={f}
                      variant={teamRoleFilter === f ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => setTeamRoleFilter(f)}
                      className="capitalize text-xs"
                    >
                      {f}
                    </Button>
                  ))}
                </div>

                <div className="space-y-2">
                  {filteredStaff.map(member => {
                    const roleColors: Record<string, string> = {
                      admin: 'default',
                      manager: 'secondary',
                      kitchen: 'outline',
                      waiter: 'outline',
                    };
                    return (
                      <Card key={member.id} className={`transition-opacity ${!member.isActive ? 'opacity-50' : ''}`}>
                        <CardContent className="flex items-center gap-4 py-3 px-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                            {member.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{member.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{member.phone}</p>
                            {member.email && (
                              <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                            )}
                          </div>
                          <Badge variant={roleColors[member.role] as any} className="capitalize">
                            {member.role}
                          </Badge>
                          <EditStaffDialog member={member} onEdit={handleEditStaff} />
                          <Switch
                            checked={member.isActive}
                            onCheckedChange={() => handleToggleStaffActive(member)}
                          />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            )}

      </AnimatePresence>
    </StaffLayout>
  );
}
