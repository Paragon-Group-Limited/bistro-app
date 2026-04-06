import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface OrderTimerProps {
  createdAt: string;
  statusChangedAt?: string;
  compact?: boolean;
}

export function OrderTimer({
  createdAt,
  statusChangedAt,
  compact = false,
}: OrderTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const base = statusChangedAt ? new Date(statusChangedAt) : new Date(createdAt);
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - base.getTime()) / 1000);
      setElapsed(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt, statusChangedAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (compact) {
      return mins > 0 ? `${mins}m` : `${secs}s`;
    }
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="w-3 h-3" />
      <span>{formatTime(elapsed)}</span>
    </div>
  );
}
