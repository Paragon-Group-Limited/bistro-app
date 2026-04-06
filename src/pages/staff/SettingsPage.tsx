import { useState } from 'react';
import { Settings, Receipt, Building2, Coins, Shield, Bell } from 'lucide-react';
import { StaffLayout } from '@/components/staff/StaffLayout';
import { GeneralSettings } from '@/components/staff/settings/GeneralSettings';
import { TaxRateSettings } from '@/components/staff/settings/TaxRateSettings';
import { BillerSettings } from '@/components/staff/settings/BillerSettings';
import { CurrencySettings } from '@/components/staff/settings/CurrencySettings';
import { PermissionSettings } from '@/components/staff/settings/PermissionSettings';
import { NotificationSettings } from '@/components/staff/settings/NotificationSettings';
import { Button } from '@/components/ui/button';

type SettingsTab = 'general' | 'tax' | 'billers' | 'currencies' | 'permissions' | 'notifications';

const settingsTabs: { id: SettingsTab; label: string; icon: typeof Settings }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'tax', label: 'Tax Rates', icon: Receipt },
  { id: 'billers', label: 'Billers', icon: Building2 },
  { id: 'currencies', label: 'Currencies', icon: Coins },
  { id: 'permissions', label: 'Permissions', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export function SettingsPage() {
  const [activeSubTab, setActiveSubTab] = useState<SettingsTab>('general');

  return (
    <StaffLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage restaurant configuration</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
        {settingsTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeSubTab === tab.id ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveSubTab(tab.id)}
              className="text-xs shrink-0 gap-1.5"
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {activeSubTab === 'general' && <GeneralSettings />}
      {activeSubTab === 'tax' && <TaxRateSettings />}
      {activeSubTab === 'billers' && <BillerSettings />}
      {activeSubTab === 'currencies' && <CurrencySettings />}
      {activeSubTab === 'permissions' && <PermissionSettings />}
      {activeSubTab === 'notifications' && <NotificationSettings />}
    </StaffLayout>
  );
}
