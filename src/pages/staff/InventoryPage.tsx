import { useState, useEffect } from 'react';
import { Package, Plus, Pencil, AlertTriangle, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { StaffLayout } from '@/components/staff/StaffLayout';
import {
  getInventoryItems,
  addInventoryItem,
  editInventoryItem,
  getWarehouses,
  addWarehouse,
  editWarehouse,
} from '@/data/api';
import type { InventoryItem, Warehouse } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type SubTab = 'stock-levels' | 'low-stock' | 'warehouses';

const subTabs: { id: SubTab; label: string }[] = [
  { id: 'stock-levels', label: 'Stock Levels' },
  { id: 'low-stock', label: 'Low Stock' },
  { id: 'warehouses', label: 'Warehouses' },
];

// ---- Stock Levels Tab ----

function StockLevelsTab({
  items,
  warehouses,
  onRefresh,
}: {
  items: InventoryItem[];
  warehouses: Warehouse[];
  onRefresh: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [warehouseId, setWarehouseId] = useState('');

  const activeWarehouses = warehouses.filter((w) => w.isActive);

  function openAdd() {
    setEditing(null);
    setName('');
    setSku('');
    setUnit('');
    setQuantity('');
    setReorderLevel('');
    setCostPrice('');
    setWarehouseId(activeWarehouses[0]?.id ?? '');
    setDialogOpen(true);
  }

  function openEdit(item: InventoryItem) {
    setEditing(item);
    setName(item.name);
    setSku(item.sku);
    setUnit(item.unit);
    setQuantity(String(item.quantity));
    setReorderLevel(String(item.reorderLevel));
    setCostPrice(String(item.costPrice));
    setWarehouseId(item.warehouseId);
    setDialogOpen(true);
  }

  async function handleSave() {
    const wh = warehouses.find((w) => w.id === warehouseId);
    const warehouseName = wh?.name ?? '';

    if (editing) {
      await editInventoryItem(editing.id, {
        name,
        sku,
        unit,
        quantity: Number(quantity),
        reorderLevel: Number(reorderLevel),
        costPrice: Number(costPrice),
        warehouseId,
        warehouseName,
      });
      toast.success('Inventory item updated');
    } else {
      await addInventoryItem({
        name,
        sku,
        unit,
        quantity: Number(quantity),
        reorderLevel: Number(reorderLevel),
        costPrice: Number(costPrice),
        warehouseId,
        warehouseName,
        categoryId: '',
        categoryName: '',
      });
      toast.success('Inventory item added');
    }
    setDialogOpen(false);
    onRefresh();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">All Stock Levels</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5" onClick={openAdd}>
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Edit Inventory Item' : 'Add Inventory Item'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="inv-name">Name</Label>
                <Input
                  id="inv-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Basmati Rice"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inv-sku">SKU</Label>
                <Input
                  id="inv-sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. RICE-BAS-001"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inv-unit">Unit</Label>
                  <Input
                    id="inv-unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. kg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inv-quantity">Quantity</Label>
                  <Input
                    id="inv-quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inv-reorder">Reorder Level</Label>
                  <Input
                    id="inv-reorder"
                    type="number"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inv-cost">Cost Price (&#2547;)</Label>
                  <Input
                    id="inv-cost"
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="inv-warehouse">Warehouse</Label>
                <Select value={warehouseId} onValueChange={setWarehouseId}>
                  <SelectTrigger id="inv-warehouse">
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeWarehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editing ? 'Save Changes' : 'Add Item'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Cost Price (&#2547;)</TableHead>
                <TableHead className="text-right">Reorder Level</TableHead>
                <TableHead>Last Restocked</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No inventory items yet.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => {
                  const isLow = item.quantity <= item.reorderLevel;
                  return (
                    <TableRow
                      key={item.id}
                      className={isLow ? 'bg-red-50 dark:bg-red-950/30' : ''}
                    >
                      <TableCell className="font-mono text-sm">
                        {item.sku}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.name}
                          {isLow && (
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.warehouseName}</TableCell>
                      <TableCell className="text-right font-medium">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        &#2547;{item.costPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.reorderLevel} {item.unit}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.lastRestockedAt ?? '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

// ---- Low Stock Tab ----

function LowStockTab({ items }: { items: InventoryItem[] }) {
  const lowStockItems = items.filter((i) => i.quantity <= i.reorderLevel);

  if (lowStockItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Package className="w-10 h-10 mb-3" />
        <p className="text-sm">All items are above reorder levels.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <h3 className="font-semibold">
          {lowStockItems.length} item{lowStockItems.length !== 1 && 's'} below
          reorder level
        </h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {lowStockItems.map((item) => (
          <Card
            key={item.id}
            className="border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold">{item.name}</h4>
                <Badge
                  variant="outline"
                  className="border-amber-400 text-amber-700 dark:text-amber-400 shrink-0"
                >
                  Low Stock
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Stock</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reorder Level</span>
                  <span className="font-medium">
                    {item.reorderLevel} {item.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Warehouse</span>
                  <span>{item.warehouseName}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---- Warehouses Tab ----

function WarehousesTab({
  warehouses,
  onRefresh,
}: {
  warehouses: Warehouse[];
  onRefresh: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  function openAdd() {
    setEditing(null);
    setCode('');
    setName('');
    setAddress('');
    setPhone('');
    setDialogOpen(true);
  }

  function openEdit(wh: Warehouse) {
    setEditing(wh);
    setCode(wh.code);
    setName(wh.name);
    setAddress(wh.address ?? '');
    setPhone(wh.phone ?? '');
    setDialogOpen(true);
  }

  async function handleSave() {
    if (editing) {
      await editWarehouse(editing.id, {
        code,
        name,
        address: address || undefined,
        phone: phone || undefined,
      });
      toast.success('Warehouse updated');
    } else {
      await addWarehouse({
        code,
        name,
        address: address || undefined,
        phone: phone || undefined,
        isActive: true,
      });
      toast.success('Warehouse added');
    }
    setDialogOpen(false);
    onRefresh();
  }

  async function handleToggleActive(wh: Warehouse) {
    await editWarehouse(wh.id, { isActive: !wh.isActive });
    toast.success(
      wh.isActive ? 'Warehouse deactivated' : 'Warehouse activated',
    );
    onRefresh();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Warehouses</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5" onClick={openAdd}>
              <Plus className="w-4 h-4" />
              Add Warehouse
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Edit Warehouse' : 'Add Warehouse'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="wh-code">Code</Label>
                <Input
                  id="wh-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. WH-01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wh-name">Name</Label>
                <Input
                  id="wh-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Main Warehouse"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wh-address">Address</Label>
                <Input
                  id="wh-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 123 Market Street"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wh-phone">Phone</Label>
                <Input
                  id="wh-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +880-1700-000000"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editing ? 'Save Changes' : 'Add Warehouse'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {warehouses.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Building2 className="w-10 h-10 mb-3" />
            <p className="text-sm">No warehouses yet.</p>
          </div>
        ) : (
          warehouses.map((wh) => (
            <Card key={wh.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <h4 className="font-semibold">{wh.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {wh.code}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => openEdit(wh)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-1 text-sm">
                  {wh.address && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address</span>
                      <span className="text-right max-w-[60%]">
                        {wh.address}
                      </span>
                    </div>
                  )}
                  {wh.phone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span>{wh.phone}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <Badge variant={wh.isActive ? 'default' : 'secondary'}>
                    {wh.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Switch
                    checked={wh.isActive}
                    onCheckedChange={() => handleToggleActive(wh)}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}

// ---- Main Page ----

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState<SubTab>('stock-levels');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const [itemData, whData] = await Promise.all([
      getInventoryItems(),
      getWarehouses(),
    ]);
    setItems(itemData);
    setWarehouses(whData);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <StaffLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Package className="w-5 h-5" />
          <h2 className="text-xl font-bold">Inventory</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage stock levels, low stock alerts, and warehouses
        </p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
        {subTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="text-xs shrink-0"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Loading...
        </div>
      ) : (
        <>
          {activeTab === 'stock-levels' && (
            <StockLevelsTab
              items={items}
              warehouses={warehouses}
              onRefresh={loadData}
            />
          )}
          {activeTab === 'low-stock' && <LowStockTab items={items} />}
          {activeTab === 'warehouses' && (
            <WarehousesTab warehouses={warehouses} onRefresh={loadData} />
          )}
        </>
      )}
    </StaffLayout>
  );
}
