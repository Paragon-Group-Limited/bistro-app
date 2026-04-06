import { type ReactNode } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  ClipboardList,
  UserCog,
  BarChart3,
  Receipt,
  Package,
  Truck,
  ShoppingCart,
  FileText,
  Gift,
  Tag,
  CalendarDays,
  RotateCcw,
  Settings,
  LayoutGrid,
  LogOut,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { StaffRole } from '@/data/types';

type NavItemType = 'tab' | 'route';

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  type: NavItemType;
  route?: string;        // for route-based items
  roles: StaffRole[];    // which roles can see this
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Operations',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, type: 'tab', roles: ['admin', 'manager', 'waiter'] },
      { id: 'orders', label: 'Orders', icon: ClipboardList, type: 'tab', roles: ['admin', 'manager', 'waiter'] },
      { id: 'menu', label: 'Menu', icon: UtensilsCrossed, type: 'tab', roles: ['admin', 'manager'] },
      { id: 'tables', label: 'Tables', icon: LayoutGrid, type: 'route', route: '/staff/tables', roles: ['admin', 'manager', 'waiter'] },
      { id: 'customers', label: 'Customers', icon: Users, type: 'tab', roles: ['admin', 'manager'] },
      { id: 'team', label: 'Team', icon: UserCog, type: 'tab', roles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'Finance',
    items: [
      { id: 'reports', label: 'Reports', icon: BarChart3, type: 'route', route: '/staff/reports', roles: ['admin', 'manager'] },
      { id: 'expenses', label: 'Expenses', icon: Receipt, type: 'route', route: '/staff/expenses', roles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'Procurement',
    items: [
      { id: 'inventory', label: 'Inventory', icon: Package, type: 'route', route: '/staff/inventory', roles: ['admin', 'manager'] },
      { id: 'suppliers', label: 'Suppliers', icon: Truck, type: 'route', route: '/staff/suppliers', roles: ['admin', 'manager'] },
      { id: 'purchases', label: 'Purchases', icon: ShoppingCart, type: 'route', route: '/staff/purchases', roles: ['admin', 'manager'] },
      { id: 'quotes', label: 'Quotes', icon: FileText, type: 'route', route: '/staff/quotes', roles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { id: 'gift-cards', label: 'Gift Cards', icon: Gift, type: 'route', route: '/staff/gift-cards', roles: ['admin', 'manager'] },
      { id: 'promotions', label: 'Promotions', icon: Tag, type: 'route', route: '/staff/promotions', roles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'Utilities',
    items: [
      { id: 'calendar', label: 'Calendar', icon: CalendarDays, type: 'route', route: '/staff/calendar', roles: ['admin', 'manager', 'waiter'] },
      { id: 'returns', label: 'Returns', icon: RotateCcw, type: 'route', route: '/staff/returns', roles: ['admin', 'manager'] },
      { id: 'settings', label: 'Settings', icon: Settings, type: 'route', route: '/staff/settings', roles: ['admin'] },
    ],
  },
];

interface StaffLayoutProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function StaffLayout({ children, activeTab, onTabChange }: StaffLayoutProps) {
  const { staff, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = staff?.role || 'waiter';

  const isActive = (item: NavItem) => {
    if (item.type === 'tab') {
      // Tab items are active when on /staff route and the tab matches
      return location.pathname === '/staff' && activeTab === item.id;
    }
    // Route items are active when the path matches
    return item.route ? location.pathname === item.route : false;
  };

  const handleClick = (item: NavItem) => {
    if (item.type === 'tab') {
      // If we're not on /staff, navigate there first
      if (location.pathname !== '/staff') {
        navigate('/staff');
      }
      onTabChange?.(item.id);
    } else if (item.route) {
      navigate(item.route);
    }
  };

  // Only show items the user's role has access to
  // Only show route items that have pages built (route exists in App.tsx)
  const builtRoutes = new Set([
    '/staff/settings',
    '/staff/reports',
    '/staff/expenses',
    '/staff/tables',
    '/staff/inventory',
    '/staff/suppliers',
    '/staff/purchases',
    '/staff/promotions',
    '/staff/returns',
    '/staff/gift-cards',
    '/staff/quotes',
    '/staff/calendar',
  ]);

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-16 md:w-56 shrink-0 border-r bg-card flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-4 md:px-5 border-b">
          <h1 className="hidden md:block text-lg font-bold">
            <span className="text-primary">Bistro Central</span>
            <span className="text-xs text-muted-foreground ml-1.5 font-mono">staff</span>
          </h1>
          <div className="md:hidden flex justify-center">
            <span className="text-lg font-bold text-primary">B</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-none">
          {navGroups.map((group, gi) => {
            const visibleItems = group.items.filter(item => {
              if (!item.roles.includes(role)) return false;
              // Show tab items always, route items only if built
              if (item.type === 'route' && item.route && !builtRoutes.has(item.route)) return false;
              return true;
            });
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label}>
                {gi > 0 && <Separator className="my-2" />}
                <p className="hidden md:block text-[10px] text-muted-foreground uppercase tracking-wider px-3 mb-1">
                  {group.label}
                </p>
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  return (
                    <Button
                      key={item.id}
                      variant={active ? 'secondary' : 'ghost'}
                      onClick={() => handleClick(item)}
                      className={`w-full justify-start gap-3 ${active ? 'text-primary' : ''}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="hidden md:block">{item.label}</span>
                    </Button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t space-y-2">
          {staff && (
            <div className="hidden md:block px-2 py-1">
              <p className="text-sm font-medium truncate">{staff.name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{staff.role}</p>
            </div>
          )}
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
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
