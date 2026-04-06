import { useState, useEffect } from 'react';
import { Bell, CheckCheck, ShoppingBag, Package, Monitor, Users } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/data/api';
import type { Notification, NotificationType } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string }> = {
  order: { icon: ShoppingBag, color: 'text-blue-500' },
  inventory: { icon: Package, color: 'text-orange-500' },
  system: { icon: Monitor, color: 'text-green-500' },
  staff: { icon: Users, color: 'text-purple-500' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationSettings() {
  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    getNotifications().then(setNotifs);
  }, []);

  const unreadCount = notifs.filter(n => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    const updated = await markNotificationRead(id);
    setNotifs(prev => prev.map(n => n.id === id ? updated : n));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="default" className="text-[10px]">{unreadCount} unread</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifs.map(notif => {
          const config = typeConfig[notif.type];
          const Icon = config.icon;
          return (
            <Card
              key={notif.id}
              className={`cursor-pointer transition-colors ${!notif.isRead ? 'border-primary/30 bg-primary/5' : ''}`}
              onClick={() => !notif.isRead && handleMarkRead(notif.id)}
            >
              <CardContent className="flex items-start gap-3 py-3 px-4">
                <div className={`mt-0.5 ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${!notif.isRead ? 'font-medium' : ''}`}>{notif.title}</p>
                    {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(notif.createdAt)}</span>
              </CardContent>
            </Card>
          );
        })}

        {notifs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
