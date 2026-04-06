import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShoppingBag, DollarSign, Calendar } from 'lucide-react';
import { StaffLayout } from '@/components/staff/StaffLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { getDailySalesReports, getOrders, getMenuItems } from '@/data/api';
import type { DailySalesReport } from '@/data/types';

type ReportsTab = 'overview' | 'sales' | 'products';

const reportsTabs: { id: ReportsTab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'sales', label: 'Sales', icon: BarChart3 },
  { id: 'products', label: 'Products', icon: ShoppingBag },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface ProductCount {
  name: string;
  count: number;
}

export function ReportsPage() {
  const [activeSubTab, setActiveSubTab] = useState<ReportsTab>('overview');
  const [salesData, setSalesData] = useState<DailySalesReport[]>([]);
  const [productCounts, setProductCounts] = useState<ProductCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [reports, orders, menuItemsList] = await Promise.all([
          getDailySalesReports(),
          getOrders(),
          getMenuItems(),
        ]);

        setSalesData(reports);

        // Build product popularity from order items
        const countMap: Record<string, number> = {};
        for (const order of orders) {
          for (const item of order.items) {
            countMap[item.menuItemId] = (countMap[item.menuItemId] || 0) + item.quantity;
          }
        }

        // Map menu item IDs to names and sort by count
        const menuMap = new Map(menuItemsList.map(m => [m.id, m.name]));
        const sorted = Object.entries(countMap)
          .map(([id, count]) => ({
            name: menuMap.get(id) || id,
            count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setProductCounts(sorted);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Computed stats from salesData
  const totalRevenue = salesData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const bestDay = salesData.length > 0
    ? salesData.reduce((best, d) => (d.revenue > best.revenue ? d : best), salesData[0])
    : null;

  // Chart data with formatted dates
  const chartData = salesData.map(d => ({
    ...d,
    label: formatDate(d.date),
  }));

  return (
    <StaffLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold">Reports</h2>
        <p className="text-sm text-muted-foreground">Sales analytics and product performance</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
        {reportsTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeSubTab === tab.id ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveSubTab(tab.id)}
              className="text-xs shrink-0 gap-1.5"
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Loading reports...
        </div>
      ) : (
        <>
          {activeSubTab === 'overview' && (
            <OverviewTab
              salesData={salesData}
              chartData={chartData}
              totalRevenue={totalRevenue}
              totalOrders={totalOrders}
              avgOrderValue={avgOrderValue}
              bestDay={bestDay}
            />
          )}
          {activeSubTab === 'sales' && (
            <SalesTab salesData={salesData} chartData={chartData} />
          )}
          {activeSubTab === 'products' && (
            <ProductsTab productCounts={productCounts} />
          )}
        </>
      )}
    </StaffLayout>
  );
}

// ---- Overview Tab ----

function OverviewTab({
  salesData,
  chartData,
  totalRevenue,
  totalOrders,
  avgOrderValue,
  bestDay,
}: {
  salesData: DailySalesReport[];
  chartData: (DailySalesReport & { label: string })[];
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  bestDay: DailySalesReport | null;
}) {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{Math.round(avgOrderValue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Best Day</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bestDay ? `৳${bestDay.revenue.toLocaleString()}` : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {bestDay ? formatDate(bestDay.date) : 'No data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue Over 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" fontSize={12} tickLine={false} />
              <YAxis fontSize={12} tickLine={false} />
              <Tooltip
                formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Revenue']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Sales Tab ----

function SalesTab({
  salesData,
  chartData,
}: {
  salesData: DailySalesReport[];
  chartData: (DailySalesReport & { label: string })[];
}) {
  return (
    <div className="space-y-6">
      {/* Orders Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" fontSize={12} tickLine={false} />
              <YAxis fontSize={12} tickLine={false} />
              <Tooltip
                formatter={(value: number) => [value, 'Orders']}
              />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sales Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Avg Order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.map(day => (
                <TableRow key={day.date}>
                  <TableCell>{formatDate(day.date)}</TableCell>
                  <TableCell className="text-right">{day.orders}</TableCell>
                  <TableCell className="text-right">৳{day.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right">৳{day.avgOrderValue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Products Tab ----

function ProductsTab({ productCounts }: { productCounts: ProductCount[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">Top 10 Menu Items by Popularity</h3>
      <div className="grid gap-3">
        {productCounts.map((item, index) => (
          <Card key={item.name}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
              </div>
              <div className="text-sm text-muted-foreground shrink-0">
                {item.count} orders
              </div>
            </CardContent>
          </Card>
        ))}
        {productCounts.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No product data available.
          </p>
        )}
      </div>
    </div>
  );
}
