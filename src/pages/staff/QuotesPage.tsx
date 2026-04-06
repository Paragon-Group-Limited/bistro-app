import { useState, useEffect } from 'react';
import { FileText, Plus, ChevronDown, ChevronUp, Send, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { StaffLayout } from '@/components/staff/StaffLayout';
import { getQuotes, addQuote, updateQuoteStatus } from '@/data/api';
import type { Quote, QuoteStatus, QuoteItem } from '@/data/types';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ---- Constants ----

const STATUS_FILTERS: { id: QuoteStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Draft' },
  { id: 'sent', label: 'Sent' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'expired', label: 'Expired' },
  { id: 'converted', label: 'Converted' },
];

function getStatusBadge(status: QuoteStatus) {
  switch (status) {
    case 'draft':
      return <Badge variant="outline">Draft</Badge>;
    case 'sent':
      return <Badge variant="default">Sent</Badge>;
    case 'accepted':
      return (
        <Badge variant="secondary" className="text-green-600">
          Accepted
        </Badge>
      );
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    case 'expired':
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Expired
        </Badge>
      );
    case 'converted':
      return <Badge variant="secondary">Converted</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// ---- Create Quote Dialog ----

interface NewQuoteItem {
  productName: string;
  quantity: string;
  unitPrice: string;
}

function CreateQuoteDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<NewQuoteItem[]>([
    { productName: '', quantity: '', unitPrice: '' },
  ]);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setCustomerName('');
    setCustomerPhone('');
    setValidUntil('');
    setNotes('');
    setItems([{ productName: '', quantity: '', unitPrice: '' }]);
  }

  function updateItem(index: number, field: keyof NewQuoteItem, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function addRow() {
    setItems((prev) => [...prev, { productName: '', quantity: '', unitPrice: '' }]);
  }

  function removeRow(index: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const taxAmount = Math.round(subtotal * 0.15 * 100) / 100;
  const grandTotal = subtotal + taxAmount;

  async function handleCreate() {
    if (!customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    if (!validUntil) {
      toast.error('Please set a valid until date');
      return;
    }

    const validItems = items.filter(
      (it) => it.productName.trim() && Number(it.quantity) > 0 && Number(it.unitPrice) > 0,
    );

    if (validItems.length === 0) {
      toast.error('Add at least one valid item');
      return;
    }

    const quoteItems: QuoteItem[] = validItems.map((it, i) => ({
      id: `qi-${Date.now()}-${i}`,
      productName: it.productName.trim(),
      quantity: Number(it.quantity),
      unitPrice: Number(it.unitPrice),
      total: Number(it.quantity) * Number(it.unitPrice),
    }));

    const calcSubtotal = quoteItems.reduce((sum, it) => sum + it.total, 0);
    const calcTax = Math.round(calcSubtotal * 0.15 * 100) / 100;

    setSaving(true);
    try {
      await addQuote({
        referenceNo: `QT-${Date.now().toString().slice(-6)}`,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        items: quoteItems,
        subtotal: calcSubtotal,
        taxAmount: calcTax,
        grandTotal: calcSubtotal + calcTax,
        status: 'draft',
        validUntil,
        notes: notes.trim() || undefined,
        createdBy: 'Admin',
      });
      toast.success('Quote created');
      resetForm();
      onOpenChange(false);
      onCreated();
    } catch {
      toast.error('Failed to create quote');
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
          <DialogTitle>Create Quote</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="qt-customer-name">Customer Name</Label>
            <Input
              id="qt-customer-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
            />
          </div>

          {/* Customer Phone */}
          <div className="space-y-2">
            <Label htmlFor="qt-customer-phone">Phone</Label>
            <Input
              id="qt-customer-phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Phone number"
            />
          </div>

          {/* Items */}
          <div className="space-y-2">
            <Label>Items</Label>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    placeholder="Product name"
                    value={item.productName}
                    onChange={(e) => updateItem(index, 'productName', e.target.value)}
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
                    placeholder="Unit price"
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
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

          {/* Totals */}
          <div className="border rounded-md p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>&#2547;{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (15%)</span>
              <span>&#2547;{taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-1">
              <span>Grand Total</span>
              <span>&#2547;{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Valid Until */}
          <div className="space-y-2">
            <Label htmlFor="qt-valid-until">Valid Until</Label>
            <Input
              id="qt-valid-until"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="qt-notes">Notes</Label>
            <Input
              id="qt-notes"
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
            {saving ? 'Creating...' : 'Create Quote'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Quote Card ----

function QuoteCard({
  quote,
  onStatusChange,
}: {
  quote: Quote;
  onStatusChange: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function handleStatusUpdate(status: QuoteStatus) {
    setUpdating(true);
    try {
      await updateQuoteStatus(quote.id, status);
      const labels: Record<string, string> = {
        sent: 'Quote sent',
        accepted: 'Quote accepted',
        rejected: 'Quote rejected',
        converted: 'Converted to order',
      };
      toast.success(labels[status] || `Status updated to ${status}`);
      onStatusChange();
    } catch {
      toast.error('Failed to update quote status');
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
                <span className="font-mono text-sm font-medium">
                  {quote.referenceNo}
                </span>
                {getStatusBadge(quote.status)}
              </div>
              <p className="text-sm">{quote.customerName}</p>
              {quote.customerPhone && (
                <p className="text-xs text-muted-foreground">
                  {quote.customerPhone}
                </p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {quote.items.length} item{quote.items.length !== 1 ? 's' : ''}
                </span>
                <span>Valid until: {quote.validUntil}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-semibold text-sm">
                &#2547;{quote.grandTotal.toLocaleString()}
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
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Line Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        &#2547;{item.unitPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        &#2547;{item.total.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="text-sm space-y-1 text-right">
              <div className="flex justify-end gap-6">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="w-28 text-right">
                  &#2547;{quote.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-end gap-6">
                <span className="text-muted-foreground">Tax</span>
                <span className="w-28 text-right">
                  &#2547;{quote.taxAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-end gap-6 font-semibold border-t pt-1">
                <span>Grand Total</span>
                <span className="w-28 text-right">
                  &#2547;{quote.grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {quote.notes && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Notes:</span> {quote.notes}
              </p>
            )}

            {/* Action buttons based on status */}
            {quote.status === 'draft' && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={updating}
                  onClick={() => handleStatusUpdate('sent')}
                >
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>
            )}

            {quote.status === 'sent' && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={updating}
                  onClick={() => handleStatusUpdate('accepted')}
                >
                  <Check className="w-4 h-4" />
                  Mark Accepted
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1.5"
                  disabled={updating}
                  onClick={() => handleStatusUpdate('rejected')}
                >
                  <X className="w-4 h-4" />
                  Mark Rejected
                </Button>
              </div>
            )}

            {quote.status === 'accepted' && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={updating}
                  onClick={() => handleStatusUpdate('converted')}
                >
                  <FileText className="w-4 h-4" />
                  Convert to Order
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---- Main Page ----

export function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  async function loadQuotes() {
    setLoading(true);
    const data = await getQuotes();
    setQuotes(data);
    setLoading(false);
  }

  useEffect(() => {
    loadQuotes();
  }, []);

  const filtered =
    statusFilter === 'all'
      ? quotes
      : quotes.filter((q) => q.status === statusFilter);

  return (
    <StaffLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5" />
            <h2 className="text-xl font-bold">Quotes &amp; Proposals</h2>
          </div>
        </div>
        <Button
          className="gap-1.5"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Create Quote
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
          <FileText className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">
            {statusFilter === 'all'
              ? 'No quotes yet.'
              : `No ${statusFilter} quotes.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} onStatusChange={loadQuotes} />
          ))}
        </div>
      )}

      {/* Create Quote Dialog */}
      <CreateQuoteDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={loadQuotes}
      />
    </StaffLayout>
  );
}
