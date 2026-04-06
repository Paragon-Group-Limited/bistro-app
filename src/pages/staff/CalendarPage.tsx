import { useState, useEffect, useMemo } from 'react';
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { StaffLayout } from '@/components/staff/StaffLayout';
import {
  getCalendarEvents,
  addCalendarEvent,
  editCalendarEvent,
  deleteCalendarEvent,
} from '@/data/api';
import type { CalendarEvent, CalendarEventType } from '@/data/types';
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
import { Switch } from '@/components/ui/switch';

// ---- Constants ----

const EVENT_TYPES: CalendarEventType[] = ['shift', 'meeting', 'reservation', 'reminder', 'holiday', 'custom'];

const TYPE_BADGE_CLASSES: Record<CalendarEventType, string> = {
  shift: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  meeting: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  reservation: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  reminder: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  holiday: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  custom: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
};

const TYPE_COLOR_MAP: Record<CalendarEventType, string> = {
  shift: '#3b82f6',
  meeting: '#f59e0b',
  reservation: '#10b981',
  reminder: '#ec4899',
  holiday: '#ef4444',
  custom: '#6366f1',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ---- Helpers ----

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseEventDate(dateStr: string): Date {
  // Handles both "2026-04-05" and "2026-04-05T14:00"
  return new Date(dateStr);
}

function formatTime(dateStr: string): string {
  const d = parseEventDate(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/** Map events to date keys. An event spanning multiple days appears under each day. */
function buildEventMap(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();

  for (const evt of events) {
    const start = parseEventDate(evt.startDate);
    const end = parseEventDate(evt.endDate);

    // Normalize to date boundaries
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    const cursor = new Date(startDay);
    while (cursor <= endDay) {
      const key = toDateKey(cursor);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(evt);
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return map;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---- Component ----

export function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(toDateKey(today));
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<CalendarEventType>('shift');
  const [formStartDate, setFormStartDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndDate, setFormEndDate] = useState('');
  const [formEndTime, setFormEndTime] = useState('17:00');
  const [formAllDay, setFormAllDay] = useState(false);
  const [formDescription, setFormDescription] = useState('');
  const [formStaffName, setFormStaffName] = useState('');

  // ---- Data Loading ----

  async function loadEvents() {
    setLoading(true);
    const data = await getCalendarEvents();
    setEvents(data);
    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  // ---- Calendar Computation ----

  const eventMap = useMemo(() => buildEventMap(events), [events]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);

  // Build grid cells: leading blanks + days of month
  const calendarCells: (number | null)[] = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [firstDayOfWeek, daysInMonth]);

  const todayKey = toDateKey(today);

  // Events for the selected date
  const selectedDayEvents = useMemo(() => {
    const dayEvents = eventMap.get(selectedDate) || [];
    return [...dayEvents].sort((a, b) => {
      // All-day events first, then by start time
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }, [selectedDate, eventMap]);

  // ---- Navigation ----

  function goToPrevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function goToNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  function goToToday() {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(toDateKey(today));
  }

  // ---- Add Event ----

  function resetForm() {
    setFormTitle('');
    setFormType('shift');
    setFormStartDate(selectedDate);
    setFormStartTime('09:00');
    setFormEndDate(selectedDate);
    setFormEndTime('17:00');
    setFormAllDay(false);
    setFormDescription('');
    setFormStaffName('');
  }

  function openAddDialog() {
    resetForm();
    setDialogOpen(true);
  }

  async function handleSaveEvent() {
    if (!formTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formStartDate || !formEndDate) {
      toast.error('Please fill in the dates');
      return;
    }

    const startDate = formAllDay ? formStartDate : `${formStartDate}T${formStartTime}`;
    const endDate = formAllDay ? formEndDate : `${formEndDate}T${formEndTime}`;

    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date/time cannot be before start');
      return;
    }

    await addCalendarEvent({
      title: formTitle.trim(),
      type: formType,
      startDate,
      endDate,
      allDay: formAllDay,
      color: TYPE_COLOR_MAP[formType],
      description: formDescription.trim() || undefined,
      staffName: formStaffName.trim() || undefined,
      staffId: undefined,
      createdBy: 'Staff',
    });

    toast.success('Event added');
    setDialogOpen(false);
    loadEvents();
  }

  // ---- Delete Event ----

  async function handleDeleteEvent(id: string) {
    await deleteCalendarEvent(id);
    toast.success('Event deleted');
    loadEvents();
  }

  // ---- Render ----

  return (
    <StaffLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            <h2 className="text-xl font-bold">Calendar</h2>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5" onClick={openAddDialog}>
                  <Plus className="w-4 h-4" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="evt-title">Title</Label>
                    <Input
                      id="evt-title"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Morning Shift"
                    />
                  </div>

                  {/* Type */}
                  <div className="space-y-2">
                    <Label htmlFor="evt-type">Type</Label>
                    <Select value={formType} onValueChange={(v) => setFormType(v as CalendarEventType)}>
                      <SelectTrigger id="evt-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {capitalize(t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Date / Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="evt-start-date">Start Date</Label>
                      <Input
                        id="evt-start-date"
                        type="date"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                      />
                    </div>
                    {!formAllDay && (
                      <div className="space-y-2">
                        <Label htmlFor="evt-start-time">Start Time</Label>
                        <Input
                          id="evt-start-time"
                          type="time"
                          value={formStartTime}
                          onChange={(e) => setFormStartTime(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {/* End Date / Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="evt-end-date">End Date</Label>
                      <Input
                        id="evt-end-date"
                        type="date"
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                      />
                    </div>
                    {!formAllDay && (
                      <div className="space-y-2">
                        <Label htmlFor="evt-end-time">End Time</Label>
                        <Input
                          id="evt-end-time"
                          type="time"
                          value={formEndTime}
                          onChange={(e) => setFormEndTime(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {/* All Day Toggle */}
                  <div className="flex items-center gap-3">
                    <Switch
                      id="evt-all-day"
                      checked={formAllDay}
                      onCheckedChange={setFormAllDay}
                    />
                    <Label htmlFor="evt-all-day">All Day</Label>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="evt-description">Description</Label>
                    <Input
                      id="evt-description"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>

                  {/* Staff Name */}
                  <div className="space-y-2">
                    <Label htmlFor="evt-staff">Staff Name</Label>
                    <Input
                      id="evt-staff"
                      value={formStaffName}
                      onChange={(e) => setFormStaffName(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>

                  {/* Color (auto from type) */}
                  <div className="flex items-center gap-3">
                    <Label>Color</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full border"
                        style={{ backgroundColor: TYPE_COLOR_MAP[formType] }}
                      />
                      <span className="text-sm text-muted-foreground">
                        Auto-assigned from type
                      </span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEvent}>
                    Add Event
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Manage shifts, meetings, reservations, and more
        </p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h3 className="text-lg font-semibold">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h3>
        <Button variant="ghost" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Loading...
        </div>
      ) : (
        <>
          {/* Calendar Grid */}
          <Card className="mb-6">
            <CardContent className="p-2 sm:p-4">
              {/* Day name headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAY_NAMES.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 auto-rows-[minmax(72px,1fr)] border-t border-l">
                {calendarCells.map((day, idx) => {
                  if (day === null) {
                    return (
                      <div
                        key={`blank-${idx}`}
                        className="border-r border-b bg-muted/30"
                      />
                    );
                  }

                  const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isToday = dateKey === todayKey;
                  const isSelected = dateKey === selectedDate;
                  const dayEvents = eventMap.get(dateKey) || [];

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => setSelectedDate(dateKey)}
                      className={`
                        border-r border-b p-1 text-left transition-colors relative
                        hover:bg-accent/50 focus:outline-none focus:ring-1 focus:ring-primary
                        ${isSelected ? 'bg-accent' : ''}
                      `}
                    >
                      <span
                        className={`
                          inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full
                          ${isToday ? 'bg-primary text-primary-foreground' : ''}
                        `}
                      >
                        {day}
                      </span>

                      {/* Event dots / chips */}
                      {dayEvents.length > 0 && (
                        <div className="mt-0.5 flex flex-wrap gap-0.5">
                          {dayEvents.slice(0, 3).map((evt) => (
                            <div
                              key={evt.id}
                              className="h-1.5 w-1.5 rounded-full shrink-0 sm:h-auto sm:w-auto sm:rounded sm:px-1 sm:py-0.5 sm:text-[10px] sm:leading-tight sm:truncate sm:max-w-full"
                              style={{ backgroundColor: evt.color }}
                              title={evt.title}
                            >
                              <span className="hidden sm:inline text-white">
                                {evt.title.length > 12 ? evt.title.slice(0, 12) + '...' : evt.title}
                              </span>
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[10px] text-muted-foreground leading-tight">
                              +{dayEvents.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Day Event List */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Events for{' '}
              {new Date(selectedDate + 'T00:00').toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </h4>

            {selectedDayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <CalendarDays className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm">No events on this day</p>
              </div>
            ) : (
              selectedDayEvents.map((evt) => (
                <Card key={evt.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        {/* Title + type badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: evt.color }}
                          />
                          <span className="font-medium">{evt.title}</span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${TYPE_BADGE_CLASSES[evt.type]}`}
                          >
                            {capitalize(evt.type)}
                          </span>
                        </div>

                        {/* Time range */}
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {evt.allDay ? (
                            <span>All day</span>
                          ) : (
                            <span>
                              {formatTime(evt.startDate)} &ndash; {formatTime(evt.endDate)}
                            </span>
                          )}
                        </div>

                        {/* Staff name */}
                        {evt.staffName && (
                          <p className="text-sm text-muted-foreground">
                            Staff: {evt.staffName}
                          </p>
                        )}

                        {/* Description */}
                        {evt.description && (
                          <p className="text-sm text-muted-foreground">
                            {evt.description}
                          </p>
                        )}
                      </div>

                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive"
                        onClick={() => handleDeleteEvent(evt.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </StaffLayout>
  );
}
