import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { getRestaurantSettings, updateRestaurantSettings } from '@/data/api';
import type { RestaurantSettings } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export function GeneralSettings() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getRestaurantSettings().then(setSettings);
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    await updateRestaurantSettings(settings);
    setSaving(false);
    toast.success('Settings saved');
  };

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Restaurant Information</CardTitle>
          <CardDescription>Basic details about your restaurant</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Restaurant Name</Label>
              <Input value={settings.restaurantName} onChange={e => setSettings({ ...settings, restaurantName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input value={settings.tagline} onChange={e => setSettings({ ...settings, tagline: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address</Label>
              <Input value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={settings.city} onChange={e => setSettings({ ...settings, city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={settings.country} onChange={e => setSettings({ ...settings, country: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input value={settings.timezone} onChange={e => setSettings({ ...settings, timezone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Order Prefix</Label>
              <Input value={settings.orderPrefix} onChange={e => setSettings({ ...settings, orderPrefix: e.target.value })} className="w-20" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature Toggles</CardTitle>
          <CardDescription>Enable or disable major features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delivery Orders</p>
              <p className="text-xs text-muted-foreground">Allow customers to place delivery orders</p>
            </div>
            <Switch checked={settings.enableDelivery} onCheckedChange={v => setSettings({ ...settings, enableDelivery: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Table Ordering</p>
              <p className="text-xs text-muted-foreground">Enable QR code table ordering</p>
            </div>
            <Switch checked={settings.enableTableOrdering} onCheckedChange={v => setSettings({ ...settings, enableTableOrdering: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Online Payment</p>
              <p className="text-xs text-muted-foreground">Accept online payments via gateway</p>
            </div>
            <Switch checked={settings.enableOnlinePayment} onCheckedChange={v => setSettings({ ...settings, enableOnlinePayment: v })} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
