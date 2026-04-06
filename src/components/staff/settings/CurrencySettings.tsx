import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { getCurrencies, addCurrency, editCurrency, deleteCurrency } from '@/data/api';
import type { Currency } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

function CurrencyDialog({ currency, onSave, trigger }: {
  currency?: Currency;
  onSave: (data: Omit<Currency, 'id'>) => Promise<void>;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && currency) {
      setCode(currency.code);
      setName(currency.name);
      setSymbol(currency.symbol);
      setExchangeRate(String(currency.exchangeRate));
      setIsDefault(currency.isDefault);
      setIsActive(currency.isActive);
    } else if (open) {
      setCode(''); setName(''); setSymbol(''); setExchangeRate('1'); setIsDefault(false); setIsActive(true);
    }
  }, [open, currency]);

  const handleSubmit = async () => {
    if (!code.trim() || !name.trim() || !symbol.trim()) {
      toast.error('Fill in all fields');
      return;
    }
    setSaving(true);
    await onSave({ code, name, symbol, exchangeRate: Number(exchangeRate), isDefault, isActive });
    setSaving(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{currency ? 'Edit Currency' : 'Add Currency'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="BDT" maxLength={3} />
            </div>
            <div className="space-y-2">
              <Label>Symbol</Label>
              <Input value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="৳" className="w-16" />
            </div>
            <div className="space-y-2">
              <Label>Exchange Rate</Label>
              <Input type="number" step="0.0001" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Bangladeshi Taka" />
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label>Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isDefault} onCheckedChange={setIsDefault} />
              <Label>Default Currency</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : currency ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CurrencySettings() {
  const [currencyList, setCurrencyList] = useState<Currency[]>([]);

  useEffect(() => {
    getCurrencies().then(setCurrencyList);
  }, []);

  const handleAdd = async (data: Omit<Currency, 'id'>) => {
    const cur = await addCurrency(data);
    if (data.isDefault) {
      setCurrencyList(prev => prev.map(c => ({ ...c, isDefault: false })));
    }
    setCurrencyList(prev => [...prev, cur]);
    toast.success('Currency added');
  };

  const handleEdit = async (id: string, data: Omit<Currency, 'id'>) => {
    const updated = await editCurrency(id, data);
    setCurrencyList(prev => {
      const list = data.isDefault ? prev.map(c => ({ ...c, isDefault: false })) : prev;
      return list.map(c => c.id === id ? updated : c);
    });
    toast.success('Currency updated');
  };

  const handleDelete = async (id: string) => {
    await deleteCurrency(id);
    setCurrencyList(prev => prev.filter(c => c.id !== id));
    toast.success('Currency removed');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Currencies</h3>
          <p className="text-xs text-muted-foreground">Manage accepted currencies and exchange rates</p>
        </div>
        <CurrencyDialog
          onSave={handleAdd}
          trigger={<Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Currency</Button>}
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {currencyList.map(cur => (
              <TableRow key={cur.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{cur.code}</span>
                    {cur.isDefault && (
                      <Badge variant="default" className="text-[10px] gap-0.5">
                        <Star className="w-2.5 h-2.5" /> Default
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{cur.name}</TableCell>
                <TableCell className="font-mono">{cur.symbol}</TableCell>
                <TableCell className="text-right font-mono text-xs">{cur.exchangeRate}</TableCell>
                <TableCell>
                  <Badge variant={cur.isActive ? 'default' : 'secondary'} className="text-[10px]">
                    {cur.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <CurrencyDialog
                      currency={cur}
                      onSave={data => handleEdit(cur.id, data)}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Pencil className="w-3 h-3" />
                        </Button>
                      }
                    />
                    {!cur.isDefault && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(cur.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
