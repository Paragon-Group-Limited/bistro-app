import { useState, useEffect } from 'react';
import { Tag, Plus, Pencil, Trash2, Percent, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { StaffLayout } from '@/components/staff/StaffLayout';
import {
  getPromotions,
  addPromotion,
  editPromotion,
  deletePromotion,
} from '@/data/api';
import type { Promotion, PromoType } from '@/data/types';
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

function isExpired(promo: Promotion): boolean {
  const now = new Date();
  if (new Date(promo.expiresAt) < now) return true;
  if (promo.usageLimit !== undefined && promo.usedCount >= promo.usageLimit) return true;
  return false;
}

function getStatusLabel(promo: Promotion): 'Active' | 'Expired' {
  if (isExpired(promo)) return 'Expired';
  if (promo.isActive) return 'Active';
  return 'Expired';
}

function typeBadgeVariant(type: PromoType): 'default' | 'secondary' | 'outline' {
  switch (type) {
    case 'percentage':
      return 'default';
    case 'fixed':
      return 'secondary';
    case 'bogo':
      return 'outline';
  }
}

function typeBadgeLabel(type: PromoType): string {
  switch (type) {
    case 'percentage':
      return 'Percentage';
    case 'fixed':
      return 'Fixed';
    case 'bogo':
      return 'BOGO';
  }
}

function valueDisplay(promo: Promotion): string {
  switch (promo.type) {
    case 'percentage':
      return `${promo.value}% off`;
    case 'fixed':
      return `\u09F3${promo.value} off`;
    case 'bogo':
      return 'Buy 1 Get 1';
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<PromoType>('percentage');
  const [value, setValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  async function loadData() {
    setLoading(true);
    const data = await getPromotions();
    setPromotions(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setCode('');
    setName('');
    setType('percentage');
    setValue('');
    setMinOrderAmount('');
    setMaxDiscount('');
    setUsageLimit('');
    setStartsAt(new Date().toISOString().slice(0, 10));
    setExpiresAt('');
    setIsActive(true);
  }

  function openAdd() {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  }

  function openEdit(promo: Promotion) {
    setEditing(promo);
    setCode(promo.code);
    setName(promo.name);
    setType(promo.type);
    setValue(String(promo.value));
    setMinOrderAmount(promo.minOrderAmount !== undefined ? String(promo.minOrderAmount) : '');
    setMaxDiscount(promo.maxDiscount !== undefined ? String(promo.maxDiscount) : '');
    setUsageLimit(promo.usageLimit !== undefined ? String(promo.usageLimit) : '');
    setStartsAt(promo.startsAt.slice(0, 10));
    setExpiresAt(promo.expiresAt.slice(0, 10));
    setIsActive(promo.isActive);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!code.trim() || !name.trim() || !value || !startsAt || !expiresAt) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      type,
      value: Number(value),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      startsAt,
      expiresAt,
      isActive,
    };

    if (editing) {
      await editPromotion(editing.id, payload);
      toast.success('Promotion updated');
    } else {
      await addPromotion(payload);
      toast.success('Promotion added');
    }

    setDialogOpen(false);
    loadData();
  }

  async function handleDelete(id: string) {
    await deletePromotion(id);
    toast.success('Promotion deleted');
    loadData();
  }

  async function handleToggleActive(promo: Promotion) {
    await editPromotion(promo.id, { isActive: !promo.isActive });
    toast.success(promo.isActive ? 'Promotion deactivated' : 'Promotion activated');
    loadData();
  }

  // Sort: active first, then expired/inactive
  const sorted = [...promotions].sort((a, b) => {
    const aExpired = isExpired(a) || !a.isActive;
    const bExpired = isExpired(b) || !b.isActive;
    if (aExpired !== bExpired) return aExpired ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <StaffLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 mb-1">
            <Tag className="w-5 h-5" />
            <h2 className="text-xl font-bold">
              Promotions{' '}
              <span className="text-base font-normal text-muted-foreground">
                ({promotions.length})
              </span>
            </h2>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5" onClick={openAdd}>
                <Plus className="w-4 h-4" />
                Add Promotion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editing ? 'Edit Promotion' : 'Add Promotion'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="promo-code">Code</Label>
                    <Input
                      id="promo-code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="e.g. SUMMER20"
                      className="font-mono uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promo-name">Name</Label>
                    <Input
                      id="promo-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Summer Sale"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="promo-type">Type</Label>
                    <Select value={type} onValueChange={(v) => setType(v as PromoType)}>
                      <SelectTrigger id="promo-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="bogo">BOGO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promo-value">Value</Label>
                    <Input
                      id="promo-value"
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={type === 'percentage' ? 'e.g. 20' : 'e.g. 100'}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="promo-min-order">Min Order Amount</Label>
                    <Input
                      id="promo-min-order"
                      type="number"
                      value={minOrderAmount}
                      onChange={(e) => setMinOrderAmount(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promo-max-discount">Max Discount</Label>
                    <Input
                      id="promo-max-discount"
                      type="number"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promo-usage-limit">Usage Limit</Label>
                  <Input
                    id="promo-usage-limit"
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="Optional (leave empty for unlimited)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="promo-starts">Starts At</Label>
                    <Input
                      id="promo-starts"
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promo-expires">Expires At</Label>
                    <Input
                      id="promo-expires"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    id="promo-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="promo-active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editing ? 'Save Changes' : 'Add Promotion'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage discount codes and promotional offers
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Loading...
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Gift className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm">No promotions yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((promo) => {
            const expired = isExpired(promo) || !promo.isActive;
            const status = getStatusLabel(promo);

            return (
              <Card
                key={promo.id}
                className={expired ? 'opacity-50' : ''}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Top row: code + name + badges */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <code className="text-base font-bold font-mono tracking-wide">
                          {promo.code}
                        </code>
                        <span className="text-sm text-muted-foreground">{promo.name}</span>
                        <Badge variant={typeBadgeVariant(promo.type)}>
                          {promo.type === 'percentage' && <Percent className="w-3 h-3 mr-1" />}
                          {promo.type === 'bogo' && <Gift className="w-3 h-3 mr-1" />}
                          {typeBadgeLabel(promo.type)}
                        </Badge>
                        <Badge variant={status === 'Active' ? 'default' : 'secondary'}>
                          {status}
                        </Badge>
                      </div>

                      {/* Value display */}
                      <p className="text-lg font-semibold">{valueDisplay(promo)}</p>

                      {/* Details row */}
                      <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                        {promo.minOrderAmount !== undefined && (
                          <span>Min order: &#2547;{promo.minOrderAmount.toLocaleString()}</span>
                        )}
                        {promo.maxDiscount !== undefined && (
                          <span>Max discount: &#2547;{promo.maxDiscount.toLocaleString()}</span>
                        )}
                        {promo.usageLimit !== undefined ? (
                          <span>
                            {promo.usedCount} / {promo.usageLimit} used
                          </span>
                        ) : (
                          <span>{promo.usedCount} used</span>
                        )}
                      </div>

                      {/* Date range */}
                      <div className="text-xs text-muted-foreground">
                        {formatDate(promo.startsAt)} &rarr; {formatDate(promo.expiresAt)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={promo.isActive}
                        onCheckedChange={() => handleToggleActive(promo)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(promo)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(promo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </StaffLayout>
  );
}
