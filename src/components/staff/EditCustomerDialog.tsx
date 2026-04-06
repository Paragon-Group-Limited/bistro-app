import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Customer } from '@/data/types';

interface EditCustomerDialogProps {
  customer: Customer;
  onEdit: (id: string, updates: Partial<Customer>) => void;
}

export function EditCustomerDialog({ customer, onEdit }: EditCustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [email, setEmail] = useState(customer.email || '');

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }

    onEdit(customer.id, {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
    });
    setOpen(false);
    toast.success('Customer updated');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {customer.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="customer@example.com"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
