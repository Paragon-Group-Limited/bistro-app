import { useState } from 'react';
import { Plus } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { StaffRole } from '@/data/types';

interface AddStaffDialogProps {
  onAdd: (data: {
    name: string;
    phone: string;
    email?: string;
    role: StaffRole;
  }) => void;
}

export function AddStaffDialog({ onAdd }: AddStaffDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole | ''>('');

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim() || !role) {
      toast.error('Fill in all required fields');
      return;
    }

    onAdd({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      role: role as StaffRole,
    });

    setName('');
    setPhone('');
    setEmail('');
    setRole('');
    setOpen(false);
    toast.success(`${name} added to team`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Staff Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Kamal Hossain"
            />
          </div>

          <div className="space-y-2">
            <Label>Phone *</Label>
            <Input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+8801712345678"
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="staff@bistro.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Role *</Label>
            <Select value={role} onValueChange={v => setRole(v as StaffRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="kitchen">Kitchen</SelectItem>
                <SelectItem value="waiter">Waiter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Staff</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
