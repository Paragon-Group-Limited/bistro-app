import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getTaxRates, addTaxRate, editTaxRate, deleteTaxRate } from '@/data/api';
import type { TaxRate } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

function TaxRateDialog({ taxRate, onSave, trigger }: {
  taxRate?: TaxRate;
  onSave: (data: Omit<TaxRate, 'id'>) => Promise<void>;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [type, setType] = useState<'inclusive' | 'exclusive'>('exclusive');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && taxRate) {
      setCode(taxRate.code);
      setName(taxRate.name);
      setRate(String(taxRate.rate));
      setType(taxRate.type);
      setIsActive(taxRate.isActive);
    } else if (open) {
      setCode(''); setName(''); setRate(''); setType('exclusive'); setIsActive(true);
    }
  }, [open, taxRate]);

  const handleSubmit = async () => {
    if (!code.trim() || !name.trim() || !rate) {
      toast.error('Fill in all fields');
      return;
    }
    setSaving(true);
    await onSave({ code, name, rate: Number(rate), type, isActive });
    setSaving(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{taxRate ? 'Edit Tax Rate' : 'Add Tax Rate'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input value={code} onChange={e => setCode(e.target.value)} placeholder="VAT15" />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="VAT 15%" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rate (%)</Label>
              <Input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="15" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={v => setType(v as 'inclusive' | 'exclusive')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="exclusive">Exclusive</SelectItem>
                  <SelectItem value="inclusive">Inclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label>Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : taxRate ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TaxRateSettings() {
  const [rates, setRates] = useState<TaxRate[]>([]);

  useEffect(() => {
    getTaxRates().then(setRates);
  }, []);

  const handleAdd = async (data: Omit<TaxRate, 'id'>) => {
    const rate = await addTaxRate(data);
    setRates(prev => [...prev, rate]);
    toast.success('Tax rate added');
  };

  const handleEdit = async (id: string, data: Omit<TaxRate, 'id'>) => {
    const updated = await editTaxRate(id, data);
    setRates(prev => prev.map(r => r.id === id ? updated : r));
    toast.success('Tax rate updated');
  };

  const handleDelete = async (id: string) => {
    await deleteTaxRate(id);
    setRates(prev => prev.filter(r => r.id !== id));
    toast.success('Tax rate removed');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Tax Rates</h3>
          <p className="text-xs text-muted-foreground">{rates.length} tax rates configured</p>
        </div>
        <TaxRateDialog
          onSave={handleAdd}
          trigger={<Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Tax Rate</Button>}
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.map(rate => (
              <TableRow key={rate.id}>
                <TableCell className="font-mono text-xs">{rate.code}</TableCell>
                <TableCell className="text-sm">{rate.name}</TableCell>
                <TableCell className="text-right font-mono">{rate.rate}%</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] capitalize">{rate.type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={rate.isActive ? 'default' : 'secondary'} className="text-[10px]">
                    {rate.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <TaxRateDialog
                      taxRate={rate}
                      onSave={data => handleEdit(rate.id, data)}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Pencil className="w-3 h-3" />
                        </Button>
                      }
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(rate.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
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
