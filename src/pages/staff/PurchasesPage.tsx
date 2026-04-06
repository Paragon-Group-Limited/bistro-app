import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { StaffLayout } from '@/components/staff/StaffLayout';
import {
  getPurchaseOrders,
  addPurchaseOrder,
  updatePurchaseOrderStatus,
  getSuppliers,
  getInventoryItems,
} from '@/data/api';
import type {
  PurchaseOrder,
  PurchaseOrderStatus,
  Supplier,
  InventoryItem,
} from '@/data/types';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ---- Constants ----

const STATUS_FILTERS: { id: PurchaseOrderStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Draft' },
  { id: 'ordered', label: 'Ordered' },
  { id: 'partial', label: 'Partial' },
  { id: 'received', label: 'Received' },
  { id: 'cancelled', label: 'Cancelled' },
];

function getStatusBadge(status: PurchaseOrderStatus) {
  switch (status) {
    case 'draft':
      return <Badge variant="outline">Draft</Badge>;
    case 'ordered':
      return <Badge variant="default">Ordered</Badge>;
    case 'partial':
      return <Badge variant="secondary">Partial</Badge>;
    case 'received':
      return (
        <Badge variant="secondary" className="text-green-600">
          Received
        </Badge>
      );
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getNextStatusActions(
  status: PurchaseOrderStatus,
): { label: string; next: PurchaseOrderStatus }[] {
  switch (status) {
    case 'draft':
      return [
        { label: 'Mark Ordered', next: 'ordered' },
        { label: 'Cancel', next: 'cancelled' },
      ];
    case 'ordered':
      return [
        { label: 'Mark Partial', next: 'partial' },
        { label: 'Mark Received', next: 'received' },
        { label: 'Cancel', next: 'cancelled' },
      ];
    case 'partial':
      return [{ label: 'Mark Received', next: 'received' }];
    default:
      return [];
  }
}

// ---- Create PO Dialog ----

interface NewPOItem {
  itemName: string;
  quantity: string;
  unitCost: string;
}

function CreatePODialog({
  suppliers,
  open,
  onOpenChange,
  onCreated,
}: {
  suppliers: Supplier[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [supplierId, setSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<NewPOItem[]>([
    { itemName: '', quantity: '', unitCost: '' },
  ]);
  const [saving, setSaving] = useState(false);

  const activeSuppliers = suppliers.filter((s) => s.isActive);

  function resetForm() {
    setSupplierId('');
    setExpectedDate('');
    setNotes('');
    setItems([{ itemName: '', quantity: '', unitCost: '' }]);
  }

  function updateItem(index: number, field: keyof NewPOItem, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function addRow() {
    setItems((prev) => [...prev, { itemName: '', quantity: '', unitCost: '' }]);
  }

  function removeRow(index: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreate() {
    if (!supplierId) {
      toast.error('Please select a supplier');
      return;
    }

    const validItems = items.filter(
      (it) => it.itemName.trim() && Number(it.quantity) > 0 && Number(it.unitCost) > 0,
    );

    if (validItems.length === 0) {
      toast.error('Add at least one valid item');
      return;
    }

    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return;

    const poItems = validItems.map((it, i) => ({
      id: `poi-${Date.now()}-${i}`,
      inventoryItemId: '',
      itemName: it.itemName.trim(),
      quantity: Number(it.quantity),
      unitCost: Number(it.unitCost),
      receivedQuantity: 0,
    }));

    const subtotal = poItems.reduce(
      (sum, it) => sum + it.quantity * it.unitCost,
      0,
    );

    setSaving(true);
    try {
      await addPurchaseOrder({
        referenceNo: `PO-${Date.now().toString().slice(-6)}`,
        supplierId,
        supplierName: supplier.companyName,
        items: poItems,
        status: 'draft',
        subtotal,
        notes: notes || undefined,
        orderDate: new Date().toISOString().slice(0, 10),
        expectedDate: expectedDate || undefined,
        createdBy: 'Admin',
      });
      toast.success('Purchase order created');
      resetForm();
      onOpenChange(false);
      onCreated();
    } catch {
      toast.error('Failed to create purchase order');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm();
        onOpenChange(val);
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Supplier */}
          <div className="space-y-2">
            <Label htmlFor="po-supplier">Supplier</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger id="po-supplier">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {activeSuppliers.map((sup) => (
                  <SelectItem key={sup.id} value={sup.id}>
                    {sup.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expected Date */}
          <div className="space-y-2">
            <Label htmlFor="po-expected-date">Expected Date</Label>
            <Input
              id="po-expected-date"
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
          </div>

          {/* Items */}
          <div className="space-y-2">
            <Label>Items</Label>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    placeholder="Item name"
                    value={item.itemName}
                    onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Qty"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="w-20"
                  />
                  <Input
                    placeholder="Unit cost"
                    type="number"
                    value={item.unitCost}
                    onChange={(e) => updateItem(index, 'unitCost', e.target.value)}
                    className="w-24"
                  />
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-destructive"
                      onClick={() => removeRow(index)}
                    >
                      &times;
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={addRow}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </Button>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="po-notes">Notes</Label>
            <Input
              id="po-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? 'Creating...' : 'Create PO'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- PO Card ----

function POCard({
  po,
  onStatusChange,
}: {
  po: PurchaseOrder;
  onStatusChange: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const actions = getNextStatusActions(po.status);

  async function handleStatusUpdate(next: PurchaseOrderStatus) {
    setUpdating(true);
    try {
      await updatePurchaseOrderStatus(po.id, next);
      toast.success(`Status updated to ${next}`);
      onStatusChange();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        {/* Summary row */}
        <button
          type="button"
          className="w-full text-left"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{po.referenceNo}</span>
                {getStatusBadge(po.status)}
              </div>
              <p className="text-sm text-muted-foreground">{po.supplierName}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Ordered: {po.orderDate}</span>
                {po.expectedDate && <span>Expected: {po.expectedDate}</span>}
                <span>{po.items.length} item{po.items.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-semibold text-sm">
                &#2547;{po.subtotal.toLocaleString()}
              </span>
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </button>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 space-y-3">
            {/* Items table */}
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty Ordered</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead>
                    <TableHead className="text-right">Qty Received</TableHead>
                    <TableHead className="text-right">Line Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {po.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.itemName}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        &#2547;{item.unitCost.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.receivedQuantity}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        &#2547;{(item.quantity * item.unitCost).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {po.notes && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Notes:</span> {po.notes}
              </p>
            )}

            {/* Status update actions */}
            {actions.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {actions.map((action) => (
                  <Button
                    key={action.next}
                    size="sm"
                    variant={action.next === 'cancelled' ? 'destructive' : 'default'}
                    disabled={updating}
                    onClick={() => handleStatusUpdate(action.next)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---- Main Page ----

export function PurchasesPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | 'all'>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  async function loadData() {
    setLoading(true);
    const [poData, supData] = await Promise.all([
      getPurchaseOrders(),
      getSuppliers(),
    ]);
    setPurchaseOrders(poData);
    setSuppliers(supData);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered =
    statusFilter === 'all'
      ? purchaseOrders
      : purchaseOrders.filter((po) => po.status === statusFilter);

  return (
    <StaffLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="w-5 h-5" />
            <h2 className="text-xl font-bold">Purchase Orders</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage supplier purchase orders
          </p>
        </div>
        <Button
          className="gap-1.5"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Create PO
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.id}
            variant={statusFilter === filter.id ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter(filter.id)}
            className="text-xs shrink-0"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <ShoppingCart className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">
            {statusFilter === 'all'
              ? 'No purchase orders yet.'
              : `No ${statusFilter} purchase orders.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((po) => (
            <POCard key={po.id} po={po} onStatusChange={loadData} />
          ))}
        </div>
      )}

      {/* Create PO Dialog */}
      <CreatePODialog
        suppliers={suppliers}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={loadData}
      />
    </StaffLayout>
  );
}
