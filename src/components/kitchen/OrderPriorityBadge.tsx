import { AlertCircle, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OrderPriorityBadgeProps {
  createdAt: string;
  threshold?: {
    urgent: number; // minutes
    warning: number; // minutes
  };
}

export function OrderPriorityBadge({
  createdAt,
  threshold = { urgent: 10, warning: 5 },
}: OrderPriorityBadgeProps) {
  const now = new Date();
  const created = new Date(createdAt);
  const ageMinutes = (now.getTime() - created.getTime()) / (1000 * 60);

  if (ageMinutes >= threshold.urgent) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="w-3 h-3" />
        Urgent
      </Badge>
    );
  }

  if (ageMinutes >= threshold.warning) {
    return (
      <Badge variant="secondary" className="gap-1 bg-amber-500/20 text-amber-700 dark:text-amber-500">
        <Zap className="w-3 h-3" />
        Rush
      </Badge>
    );
  }

  return null;
}
