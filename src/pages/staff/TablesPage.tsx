import { useState, useEffect } from 'react';
import { Plus, Users, LayoutGrid, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { StaffLayout } from '@/components/staff/StaffLayout';
import {
  getTables,
  addTable,
  editTable,
  updateTableStatus,
  deleteTable,
  getReservations,
  addReservation,
  cancelReservation,
} from '@/data/api';
import type { RestaurantTable, TableStatus, Reservation } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SubTab = 'floor-plan' | 'reservations';

const subTabs: { id: SubTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'floor-plan', label: 'Floor Plan', icon: LayoutGrid },
  { id: 'reservations', label: 'Reservations', icon: CalendarDays },
];

const floors = ['All', 'Ground', 'Rooftop'] as const;

const statusColors: Record<TableStatus, string> = {
  available: 'border-green-500/50',
  occupied: 'border-red-500/50',
  reserved: 'border-yellow-500/50',
  cleaning: 'border-muted-foreground/30',
};

const statusBadgeVariant: Record<TableStatus, { className: string; label: string }> = {
  available: { className: 'border-green-500 text-green-600 bg-green-500/10', label: 'Available' },
  occupied: { className: 'bg-red-500 text-white border-red-500', label: 'Occupied' },
  reserved: { className: 'bg-yellow-500 text-white border-yellow-500', label: 'Reserved' },
  cleaning: { className: 'bg-muted text-muted-foreground border-muted', label: 'Cleaning' },
};

// ---- Floor Plan Tab ----

function FloorPlanTab({
  tables,
  onRefresh,
}: {
  tables: RestaurantTable[];
  onRefresh: () => void;
}) {
  const [floorFilter, setFloorFilter] = useState<string>('All');
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Add table form state
  const [newNumber, setNewNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [newFloor, setNewFloor] = useState('Ground');
  const [newStatus, setNewStatus] = useState<TableStatus>('available');

  const filteredTables =
    floorFilter === 'All'
      ? tables
      : tables.filter((t) => t.floor === floorFilter);

  function openAddDialog() {
    setNewNumber('');
    setNewCapacity('');
    setNewFloor('Ground');
    setNewStatus('available');
    setAddDialogOpen(true);
  }

  async function handleAddTable() {
    if (!newNumber.trim() || !newCapacity.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    await addTable({
      number: newNumber.trim(),
      capacity: Number(newCapacity),
      floor: newFloor,
      status: newStatus,
    });
    toast.success('Table added');
    setAddDialogOpen(false);
    onRefresh();
  }

  async function handleStatusChange(table: RestaurantTable, status: TableStatus) {
    await updateTableStatus(table.id, status);
    toast.success(`Table ${table.number} marked as ${status}`);
    setSelectedTable(null);
    onRefresh();
  }

  return (
    <>
      {/* Floor filter + Add button */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-2">
          {floors.map((floor) => (
            <Button
              key={floor}
              variant={floorFilter === floor ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setFloorFilter(floor)}
              className="text-xs"
            >
              {floor}
            </Button>
          ))}
        </div>

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5" onClick={openAddDialog}>
              <Plus className="w-4 h-4" />
              Add Table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Table</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="tbl-number">Table Number</Label>
                <Input
                  id="tbl-number"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="e.g. T1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tbl-capacity">Capacity</Label>
                <Input
                  id="tbl-capacity"
                  type="number"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  placeholder="e.g. 4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tbl-floor">Floor</Label>
                <Select value={newFloor} onValueChange={setNewFloor}>
                  <SelectTrigger id="tbl-floor">
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ground">Ground</SelectItem>
                    <SelectItem value="Rooftop">Rooftop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tbl-status">Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as TableStatus)}
                >
                  <SelectTrigger id="tbl-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTable}>Add Table</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table cards grid */}
      {filteredTables.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          No tables found.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredTables.map((table) => {
            const isSelected = selectedTable?.id === table.id;
            const badgeInfo = statusBadgeVariant[table.status];

            return (
              <Card
                key={table.id}
                className={`border-2 cursor-pointer transition-colors ${statusColors[table.status]} ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() =>
                  setSelectedTable(isSelected ? null : table)
                }
              >
                <CardContent className="p-4 space-y-3">
                  {/* Header: table number + badge */}
                  <div className="flex items-start justify-between">
                    <span className="text-2xl font-bold">{table.number}</span>
                    <Badge variant="outline" className={badgeInfo.className}>
                      {badgeInfo.label}
                    </Badge>
                  </div>

                  {/* Info */}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {table.capacity} seats
                    </span>
                    <span>{table.floor}</span>
                  </div>

                  {/* Order ID if occupied */}
                  {table.status === 'occupied' && table.currentOrderId && (
                    <p className="text-xs text-muted-foreground">
                      Order: <span className="font-mono font-medium text-foreground">{table.currentOrderId}</span>
                    </p>
                  )}

                  {/* Quick status change buttons */}
                  {isSelected && (
                    <div className="pt-2 border-t space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">
                        Change status:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(
                          ['available', 'occupied', 'reserved', 'cleaning'] as TableStatus[]
                        ).map((status) => (
                          <Button
                            key={status}
                            size="sm"
                            variant={
                              table.status === status ? 'default' : 'outline'
                            }
                            className="text-xs h-7 capitalize"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(table, status);
                            }}
                          >
                            {status}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

// ---- Reservations Tab ----

function ReservationsTab({
  reservations,
  tables,
  onRefresh,
}: {
  reservations: Reservation[];
  tables: RestaurantTable[];
  onRefresh: () => void;
}) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [partySize, setPartySize] = useState('');
  const [tableId, setTableId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const availableTables = tables.filter((t) => t.status === 'available');

  function openAddDialog() {
    setCustomerName('');
    setCustomerPhone('');
    setPartySize('');
    setTableId('');
    setDate(new Date().toISOString().slice(0, 10));
    setTime('');
    setNotes('');
    setAddDialogOpen(true);
  }

  async function handleAddReservation() {
    if (!customerName.trim() || !customerPhone.trim() || !tableId || !date || !time) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedTable = tables.find((t) => t.id === tableId);
    if (!selectedTable) {
      toast.error('Selected table not found');
      return;
    }

    await addReservation({
      tableId,
      tableNumber: selectedTable.number,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      partySize: Number(partySize) || 1,
      date,
      time,
      notes: notes.trim() || undefined,
      status: 'confirmed',
    });
    toast.success('Reservation added');
    setAddDialogOpen(false);
    onRefresh();
  }

  async function handleCancel(id: string) {
    await cancelReservation(id);
    toast.success('Reservation cancelled');
    onRefresh();
  }

  const reservationBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Reservations</h3>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5" onClick={openAddDialog}>
              <Plus className="w-4 h-4" />
              Add Reservation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Reservation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="res-name">Customer Name</Label>
                <Input
                  id="res-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="res-phone">Phone</Label>
                <Input
                  id="res-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="res-party">Party Size</Label>
                <Input
                  id="res-party"
                  type="number"
                  value={partySize}
                  onChange={(e) => setPartySize(e.target.value)}
                  placeholder="e.g. 4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="res-table">Table</Label>
                <Select value={tableId} onValueChange={setTableId}>
                  <SelectTrigger id="res-table">
                    <SelectValue placeholder="Select a table" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTables.length === 0 ? (
                      <SelectItem value="_none" disabled>
                        No available tables
                      </SelectItem>
                    ) : (
                      availableTables.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.number} - {t.floor} ({t.capacity} seats)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="res-date">Date</Label>
                  <Input
                    id="res-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="res-time">Time</Label>
                  <Input
                    id="res-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="res-notes">Notes</Label>
                <Input
                  id="res-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddReservation}>Add Reservation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reservations list */}
      {reservations.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          No reservations yet.
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((res) => (
            <Card key={res.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{res.customerName}</span>
                      {reservationBadge(res.status)}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>{res.customerPhone}</span>
                      <span>Table {res.tableNumber}</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {res.partySize}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {res.date}
                      </span>
                      <span>{res.time}</span>
                    </div>
                    {res.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Notes: {res.notes}
                      </p>
                    )}
                  </div>

                  {res.status === 'confirmed' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="shrink-0"
                      onClick={() => handleCancel(res.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

// ---- Main Page ----

export function TablesPage() {
  const [activeTab, setActiveTab] = useState<SubTab>('floor-plan');
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const [tblData, resData] = await Promise.all([
      getTables(),
      getReservations(),
    ]);
    setTables(tblData);
    setReservations(resData);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <StaffLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <LayoutGrid className="w-5 h-5" />
          <h2 className="text-xl font-bold">Tables</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage tables, floor plan and reservations
        </p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="text-xs shrink-0 gap-1.5"
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Loading...
        </div>
      ) : (
        <>
          {activeTab === 'floor-plan' && (
            <FloorPlanTab tables={tables} onRefresh={loadData} />
          )}
          {activeTab === 'reservations' && (
            <ReservationsTab
              reservations={reservations}
              tables={tables}
              onRefresh={loadData}
            />
          )}
        </>
      )}
    </StaffLayout>
  );
}
