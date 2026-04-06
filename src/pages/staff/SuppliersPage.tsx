import { useState, useEffect } from 'react';
import { Truck, Plus, Pencil, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { StaffLayout } from '@/components/staff/StaffLayout';
import {
  getSuppliers,
  addSupplier,
  editSupplier,
  deleteSupplier,
} from '@/data/api';
import type { Supplier } from '@/data/types';
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
import { Switch } from '@/components/ui/switch';

const emptyForm = {
  companyName: '',
  contactName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  isActive: true,
};

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function loadSuppliers() {
    setLoading(true);
    const data = await getSuppliers();
    setSuppliers(data);
    setLoading(false);
  }

  useEffect(() => {
    loadSuppliers();
  }, []);

  function updateField<K extends keyof typeof emptyForm>(
    key: K,
    value: (typeof emptyForm)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(supplier: Supplier) {
    setEditing(supplier);
    setForm({
      companyName: supplier.companyName,
      contactName: supplier.contactName,
      phone: supplier.phone,
      email: supplier.email ?? '',
      address: supplier.address ?? '',
      city: supplier.city ?? '',
      isActive: supplier.isActive,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.companyName.trim() || !form.phone.trim()) {
      toast.error('Company name and phone are required');
      return;
    }

    const payload = {
      companyName: form.companyName.trim(),
      contactName: form.contactName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      isActive: form.isActive,
    };

    if (editing) {
      await editSupplier(editing.id, payload);
      toast.success('Supplier updated');
    } else {
      await addSupplier(payload);
      toast.success('Supplier added');
    }
    setDialogOpen(false);
    loadSuppliers();
  }

  async function handleDelete(id: string) {
    await deleteSupplier(id);
    toast.success('Supplier deleted');
    loadSuppliers();
  }

  return (
    <StaffLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            <h2 className="text-xl font-bold">
              Suppliers{' '}
              {!loading && (
                <span className="text-muted-foreground font-normal text-base">
                  ({suppliers.length})
                </span>
              )}
            </h2>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5" onClick={openAdd}>
                <Plus className="w-4 h-4" />
                Add Supplier
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing ? 'Edit Supplier' : 'Add Supplier'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="sup-companyName">Company Name</Label>
                  <Input
                    id="sup-companyName"
                    value={form.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    placeholder="e.g. Fresh Farms Ltd."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sup-contactName">Contact Person</Label>
                  <Input
                    id="sup-contactName"
                    value={form.contactName}
                    onChange={(e) => updateField('contactName', e.target.value)}
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sup-phone">Phone</Label>
                  <Input
                    id="sup-phone"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="e.g. +880 1700 000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sup-email">Email</Label>
                  <Input
                    id="sup-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="e.g. contact@freshfarms.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sup-address">Address</Label>
                  <Input
                    id="sup-address"
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="e.g. 123 Market Street"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sup-city">City</Label>
                  <Input
                    id="sup-city"
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="e.g. Dhaka"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sup-active">Active</Label>
                  <Switch
                    id="sup-active"
                    checked={form.isActive}
                    onCheckedChange={(checked) =>
                      updateField('isActive', checked)
                    }
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
                  {editing ? 'Save Changes' : 'Add Supplier'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <p className="text-sm text-muted-foreground mt-1">
          Manage your ingredient and supply vendors
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Loading...
        </div>
      ) : suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Truck className="w-10 h-10 mb-3 opacity-40" />
          <p>No suppliers yet. Add your first supplier to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <Card
              key={supplier.id}
              className={supplier.isActive ? '' : 'opacity-50'}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">
                      {supplier.companyName}
                    </h3>
                    {supplier.contactName && (
                      <p className="text-sm text-muted-foreground truncate">
                        {supplier.contactName}
                      </p>
                    )}
                  </div>
                  <Badge variant={supplier.isActive ? 'default' : 'secondary'}>
                    {supplier.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{supplier.phone}</span>
                  </div>
                  {supplier.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                  )}
                  {supplier.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{supplier.city}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-1 mt-3 pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(supplier)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(supplier.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </StaffLayout>
  );
}
