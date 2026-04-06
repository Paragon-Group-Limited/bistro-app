import { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { StaffLayout } from '@/components/staff/StaffLayout';
import { getReturns, updateReturnStatus } from '@/data/api';
import type { Return, ReturnStatus } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const STATUS_FILTERS: { id: ReturnStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'requested', label: 'Requested' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'refunded', label: 'Refunded' },
];

const STATUS_BADGE_VARIANT: Record<ReturnStatus, 'outline' | 'default' | 'destructive' | 'secondary'> = {
  requested: 'outline',
  approved: 'default',
  rejected: 'destructive',
  refunded: 'secondary',
};

export function ReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReturnStatus | 'all'>('all');

  async function loadReturns() {
    setLoading(true);
    const data = await getReturns();
    setReturns(data);
    setLoading(false);
  }

  useEffect(() => {
    loadReturns();
  }, []);

  const filtered = filter === 'all'
    ? returns
    : returns.filter((r) => r.status === filter);

  async function handleStatusUpdate(id: string, status: ReturnStatus) {
    try {
      await updateReturnStatus(id, status, 'Admin');
      toast.success(
        status === 'approved'
          ? 'Return approved'
          : status === 'rejected'
            ? 'Return rejected'
            : 'Marked as refunded',
      );
      loadReturns();
    } catch {
      toast.error('Failed to update return status');
    }
  }

  return (
    <StaffLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <RotateCcw className="w-5 h-5" />
          <h2 className="text-xl font-bold">
            Returns &amp; Refunds
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({filtered.length})
            </span>
          </h2>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
        {STATUS_FILTERS.map((sf) => (
          <Button
            key={sf.id}
            variant={filter === sf.id ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setFilter(sf.id)}
            className="text-xs shrink-0"
          >
            {sf.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          No returns found.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ret) => (
            <Card key={ret.id}>
              <CardContent className="p-4 space-y-3">
                {/* Header row: order number, customer, status badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-sm font-medium">
                      {ret.orderNumber}
                    </span>
                    <span className="mx-2 text-muted-foreground">-</span>
                    <span className="text-sm">{ret.customerName}</span>
                  </div>
                  <Badge variant={STATUS_BADGE_VARIANT[ret.status]}>
                    {ret.status.charAt(0).toUpperCase() + ret.status.slice(1)}
                  </Badge>
                </div>

                {/* Items list */}
                <div className="text-sm text-muted-foreground">
                  {ret.items.map((item, idx) => (
                    <span key={idx}>
                      {item.menuItemName} &times; {item.quantity}
                      {idx < ret.items.length - 1 && ', '}
                    </span>
                  ))}
                </div>

                {/* Reason */}
                <p className="text-sm italic text-muted-foreground">
                  {ret.reason}
                </p>

                {/* Refund amount */}
                <div className="text-sm font-medium">
                  Refund: &#2547;{ret.refundAmount.toLocaleString()}
                </div>

                {/* Processed info */}
                {ret.processedBy && (
                  <p className="text-xs text-muted-foreground">
                    Processed by {ret.processedBy}
                    {ret.processedAt && (
                      <>
                        {' '}on{' '}
                        {new Date(ret.processedAt).toLocaleDateString()}
                      </>
                    )}
                  </p>
                )}

                {/* Action buttons */}
                {ret.status === 'requested' && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleStatusUpdate(ret.id, 'approved')}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1.5"
                      onClick={() => handleStatusUpdate(ret.id, 'rejected')}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                )}
                {ret.status === 'approved' && (
                  <div className="pt-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1.5"
                      onClick={() => handleStatusUpdate(ret.id, 'refunded')}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Mark Refunded
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </StaffLayout>
  );
}
