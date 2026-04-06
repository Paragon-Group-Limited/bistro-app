import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { getRolePermissions, updateRolePermissions } from '@/data/api';
import type { RolePermissions, StaffRole, PermissionModule } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

const MODULE_LABELS: Record<PermissionModule, string> = {
  dashboard: 'Dashboard',
  orders: 'Orders',
  menu: 'Menu',
  tables: 'Tables',
  customers: 'Customers',
  team: 'Team',
  reports: 'Reports',
  expenses: 'Expenses',
  inventory: 'Inventory',
  suppliers: 'Suppliers',
  purchases: 'Purchases',
  quotes: 'Quotes',
  'gift-cards': 'Gift Cards',
  promotions: 'Promotions',
  calendar: 'Calendar',
  returns: 'Returns',
  settings: 'Settings',
};

const ROLES: StaffRole[] = ['admin', 'manager', 'kitchen', 'waiter'];
const ACTIONS = ['canView', 'canCreate', 'canEdit', 'canDelete'] as const;

export function PermissionSettings() {
  const [permData, setPermData] = useState<RolePermissions[]>([]);
  const [selectedRole, setSelectedRole] = useState<StaffRole>('manager');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getRolePermissions().then(setPermData);
  }, []);

  const currentRolePerms = permData.find(rp => rp.role === selectedRole);

  const togglePermission = (module: PermissionModule, action: typeof ACTIONS[number]) => {
    setPermData(prev =>
      prev.map(rp => {
        if (rp.role !== selectedRole) return rp;
        return {
          ...rp,
          permissions: rp.permissions.map(p => {
            if (p.module !== module) return p;
            return { ...p, [action]: !p[action] };
          }),
        };
      })
    );
  };

  const handleSave = async () => {
    if (!currentRolePerms) return;
    setSaving(true);
    await updateRolePermissions(selectedRole, currentRolePerms.permissions);
    setSaving(false);
    toast.success(`${selectedRole} permissions updated`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Role Permissions</h3>
          <p className="text-xs text-muted-foreground">Configure what each role can do</p>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving || selectedRole === 'admin'}>
          <Save className="w-4 h-4 mr-1" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <div className="flex gap-2">
        {ROLES.map(role => (
          <Button
            key={role}
            variant={selectedRole === role ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setSelectedRole(role)}
            className="capitalize text-xs"
          >
            {role}
          </Button>
        ))}
      </div>

      {selectedRole === 'admin' && (
        <p className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
          Admin has full access to all modules. Permissions cannot be modified.
        </p>
      )}

      {currentRolePerms && (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Module</TableHead>
                <TableHead className="text-center w-20">View</TableHead>
                <TableHead className="text-center w-20">Create</TableHead>
                <TableHead className="text-center w-20">Edit</TableHead>
                <TableHead className="text-center w-20">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRolePerms.permissions.map(perm => (
                <TableRow key={perm.module}>
                  <TableCell className="text-sm font-medium">{MODULE_LABELS[perm.module]}</TableCell>
                  {ACTIONS.map(action => (
                    <TableCell key={action} className="text-center">
                      <Checkbox
                        checked={perm[action]}
                        onCheckedChange={() => togglePermission(perm.module, action)}
                        disabled={selectedRole === 'admin'}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
