import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { getBillers, addBiller, editBiller, deleteBiller } from '@/data/api';
import type { Biller } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

function BillerDialog({ biller, onSave, trigger }: {
  biller?: Biller;
  onSave: (data: Omit<Biller, 'id'>) => Promise<void>;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && biller) {
      setCompanyName(biller.companyName);
      setAddress(biller.address);
      setCity(biller.city);
      setCountry(biller.country);
      setPhone(biller.phone);
      setEmail(biller.email);
      setTaxNumber(biller.taxNumber || '');
      setVatNumber(biller.vatNumber || '');
      setIsDefault(biller.isDefault);
    } else if (open) {
      setCompanyName(''); setAddress(''); setCity(''); setCountry('Bangladesh');
      setPhone(''); setEmail(''); setTaxNumber(''); setVatNumber(''); setIsDefault(false);
    }
  }, [open, biller]);

  const handleSubmit = async () => {
    if (!companyName.trim() || !email.trim()) {
      toast.error('Company name and email are required');
      return;
    }
    setSaving(true);
    await onSave({
      companyName, address, city, country, phone, email,
      taxNumber: taxNumber || undefined,
      vatNumber: vatNumber || undefined,
      isDefault,
    });
    setSaving(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{biller ? 'Edit Biller' : 'Add Biller'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input value={companyName} onChange={e => setCompanyName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={city} onChange={e => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={country} onChange={e => setCountry(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tax Number (TIN)</Label>
              <Input value={taxNumber} onChange={e => setTaxNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>VAT Number</Label>
              <Input value={vatNumber} onChange={e => setVatNumber(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isDefault} onCheckedChange={setIsDefault} />
            <Label>Default Biller</Label>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : biller ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BillerSettings() {
  const [billerList, setBillerList] = useState<Biller[]>([]);

  useEffect(() => {
    getBillers().then(setBillerList);
  }, []);

  const handleAdd = async (data: Omit<Biller, 'id'>) => {
    const biller = await addBiller(data);
    if (data.isDefault) {
      setBillerList(prev => prev.map(b => ({ ...b, isDefault: false })));
    }
    setBillerList(prev => [...prev, biller]);
    toast.success('Biller added');
  };

  const handleEdit = async (id: string, data: Omit<Biller, 'id'>) => {
    const updated = await editBiller(id, data);
    setBillerList(prev => {
      const list = data.isDefault ? prev.map(b => ({ ...b, isDefault: false })) : prev;
      return list.map(b => b.id === id ? updated : b);
    });
    toast.success('Biller updated');
  };

  const handleDelete = async (id: string) => {
    await deleteBiller(id);
    setBillerList(prev => prev.filter(b => b.id !== id));
    toast.success('Biller removed');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Billers</h3>
          <p className="text-xs text-muted-foreground">Manage billing entities for invoices</p>
        </div>
        <BillerDialog
          onSave={handleAdd}
          trigger={<Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Biller</Button>}
        />
      </div>

      <div className="space-y-3">
        {billerList.map(biller => (
          <Card key={biller.id}>
            <CardContent className="flex items-start gap-4 py-4 px-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{biller.companyName}</p>
                  {biller.isDefault && (
                    <Badge variant="default" className="text-[10px] gap-1">
                      <Star className="w-2.5 h-2.5" /> Default
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{biller.address}, {biller.city}</p>
                <div className="flex gap-4 mt-1">
                  <span className="text-xs text-muted-foreground">{biller.phone}</span>
                  <span className="text-xs text-muted-foreground">{biller.email}</span>
                </div>
                {(biller.taxNumber || biller.vatNumber) && (
                  <div className="flex gap-3 mt-1">
                    {biller.taxNumber && <span className="text-[10px] font-mono text-muted-foreground">TIN: {biller.taxNumber}</span>}
                    {biller.vatNumber && <span className="text-[10px] font-mono text-muted-foreground">VAT: {biller.vatNumber}</span>}
                  </div>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <BillerDialog
                  biller={biller}
                  onSave={data => handleEdit(biller.id, data)}
                  trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  }
                />
                {!biller.isDefault && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(biller.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
