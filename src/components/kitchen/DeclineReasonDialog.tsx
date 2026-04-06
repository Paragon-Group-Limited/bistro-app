import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const DECLINE_REASONS = [
  'Out of ingredients',
  'Equipment issue',
  'Table not available',
  'Order mistake',
  'Kitchen too busy',
  'Custom reason',
];

interface DeclineReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  orderId: string;
}

export function DeclineReasonDialog({
  open,
  onOpenChange,
  onConfirm,
  orderId,
}: DeclineReasonDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');

  const handleConfirm = () => {
    const reason = selectedReason === 'Custom reason' ? customReason : selectedReason;
    if (!reason?.trim()) {
      toast.error('Please select or enter a reason');
      return;
    }
    onConfirm(reason);
    setSelectedReason(null);
    setCustomReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Why decline this order?</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {DECLINE_REASONS.map(reason => (
            <button
              key={reason}
              onClick={() => {
                setSelectedReason(reason);
                if (reason !== 'Custom reason') {
                  setCustomReason('');
                }
              }}
              className={`w-full p-3 rounded-md border text-left transition-all ${
                selectedReason === reason
                  ? 'border-primary bg-primary/10'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <span className="text-sm font-medium">{reason}</span>
            </button>
          ))}

          {selectedReason === 'Custom reason' && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="custom-reason">Enter reason</Label>
              <Input
                id="custom-reason"
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                placeholder="e.g., Customer requested cancellation..."
                autoFocus
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!selectedReason}
          >
            Decline Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
