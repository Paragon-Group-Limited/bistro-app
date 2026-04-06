import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { StaffLayout } from '@/components/staff/StaffLayout';
import {
  getExpenses,
  addExpense,
  editExpense,
  deleteExpense,
  getExpenseCategories,
  addExpenseCategory,
  editExpenseCategory,
} from '@/data/api';
import type { Expense, ExpenseCategory } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type SubTab = 'expenses' | 'categories' | 'summary';

const subTabs: { id: SubTab; label: string }[] = [
  { id: 'expenses', label: 'Expenses' },
  { id: 'categories', label: 'Categories' },
  { id: 'summary', label: 'Summary' },
];

const PIE_COLORS = [
  'hsl(var(--primary))',
  '#f59e0b',
  '#10b981',
  '#6366f1',
  '#ec4899',
  '#8b5cf6',
];

// ---- Expenses Tab ----

function ExpensesTab({
  expenses,
  categories,
  onRefresh,
}: {
  expenses: Expense[];
  categories: ExpenseCategory[];
  onRefresh: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const activeCategories = categories.filter((c) => c.isActive);

  function openAdd() {
    setEditing(null);
    setDate(new Date().toISOString().slice(0, 10));
    setCategoryId(activeCategories[0]?.id ?? '');
    setAmount('');
    setNote('');
    setDialogOpen(true);
  }

  function openEdit(exp: Expense) {
    setEditing(exp);
    setDate(exp.date);
    setCategoryId(exp.categoryId);
    setAmount(String(exp.amount));
    setNote(exp.note ?? '');
    setDialogOpen(true);
  }

  async function handleSave() {
    const catName =
      categories.find((c) => c.id === categoryId)?.name ?? '';

    if (editing) {
      await editExpense(editing.id, {
        date,
        categoryId,
        categoryName: catName,
        amount: Number(amount),
        note: note || undefined,
      });
      toast.success('Expense updated');
    } else {
      await addExpense({
        date,
        categoryId,
        categoryName: catName,
        amount: Number(amount),
        note: note || undefined,
        createdBy: 'Admin',
      });
      toast.success('Expense added');
    }
    setDialogOpen(false);
    onRefresh();
  }

  async function handleDelete(id: string) {
    await deleteExpense(id);
    toast.success('Expense deleted');
    onRefresh();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">All Expenses</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5" onClick={openAdd}>
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Edit Expense' : 'Add Expense'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="exp-date">Date (YYYY-MM-DD)</Label>
                <Input
                  id="exp-date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="YYYY-MM-DD"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp-category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="exp-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp-amount">Amount</Label>
                <Input
                  id="exp-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp-note">Note</Label>
                <Input
                  id="exp-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editing ? 'Save Changes' : 'Add Expense'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount (&#2547;)</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No expenses recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell>{exp.date}</TableCell>
                    <TableCell>{exp.categoryName}</TableCell>
                    <TableCell className="text-right font-medium">
                      &#2547;{exp.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {exp.note || '-'}
                    </TableCell>
                    <TableCell>{exp.createdBy}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(exp)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(exp.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

// ---- Categories Tab ----

function CategoriesTab({
  categories,
  onRefresh,
}: {
  categories: ExpenseCategory[];
  onRefresh: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseCategory | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  function openAdd() {
    setEditing(null);
    setCode('');
    setName('');
    setDialogOpen(true);
  }

  function openEdit(cat: ExpenseCategory) {
    setEditing(cat);
    setCode(cat.code);
    setName(cat.name);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (editing) {
      await editExpenseCategory(editing.id, { code, name });
      toast.success('Category updated');
    } else {
      await addExpenseCategory({ code, name, isActive: true });
      toast.success('Category added');
    }
    setDialogOpen(false);
    onRefresh();
  }

  async function handleToggleActive(cat: ExpenseCategory) {
    await editExpenseCategory(cat.id, { isActive: !cat.isActive });
    toast.success(
      cat.isActive ? 'Category deactivated' : 'Category activated',
    );
    onRefresh();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Expense Categories</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5" onClick={openAdd}>
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Edit Category' : 'Add Category'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="cat-code">Code</Label>
                <Input
                  id="cat-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. RENT"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-name">Name</Label>
                <Input
                  id="cat-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rent & Utilities"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editing ? 'Save Changes' : 'Add Category'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No categories yet.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-mono text-sm">
                      {cat.code}
                    </TableCell>
                    <TableCell>{cat.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={cat.isActive}
                          onCheckedChange={() => handleToggleActive(cat)}
                        />
                        <Badge
                          variant={cat.isActive ? 'default' : 'secondary'}
                        >
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(cat)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

// ---- Summary Tab ----

function SummaryTab({ expenses }: { expenses: Expense[] }) {
  const summaryData = useMemo(() => {
    const grouped: Record<
      string,
      { category: string; total: number; count: number }
    > = {};

    for (const exp of expenses) {
      if (!grouped[exp.categoryName]) {
        grouped[exp.categoryName] = {
          category: exp.categoryName,
          total: 0,
          count: 0,
        };
      }
      grouped[exp.categoryName].total += exp.amount;
      grouped[exp.categoryName].count += 1;
    }

    const entries = Object.values(grouped).sort((a, b) => b.total - a.total);
    const grandTotal = entries.reduce((sum, e) => sum + e.total, 0);

    return entries.map((entry) => ({
      ...entry,
      percentage:
        grandTotal > 0
          ? Number(((entry.total / grandTotal) * 100).toFixed(1))
          : 0,
    }));
  }, [expenses]);

  const grandTotal = summaryData.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {summaryData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No expense data to display.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summaryData}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ category, percentage }) =>
                      `${category} (${percentage}%)`
                    }
                  >
                    {summaryData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      `\u09F3${value.toLocaleString()}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary Table</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right"># of Entries</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryData.map((row, index) => (
                <TableRow key={row.category}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />
                      {row.category}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    &#2547;{row.total.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">{row.count}</TableCell>
                  <TableCell className="text-right">
                    {row.percentage}%
                  </TableCell>
                </TableRow>
              ))}
              {summaryData.length > 0 && (
                <TableRow className="font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    &#2547;{grandTotal.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {expenses.length}
                  </TableCell>
                  <TableCell className="text-right">100%</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Main Page ----

export function ExpensesPage() {
  const [activeTab, setActiveTab] = useState<SubTab>('expenses');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const [expData, catData] = await Promise.all([
      getExpenses(),
      getExpenseCategories(),
    ]);
    setExpenses(expData);
    setCategories(catData);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <StaffLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Receipt className="w-5 h-5" />
          <h2 className="text-xl font-bold">Expenses</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Track and manage restaurant expenses
        </p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
        {subTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="text-xs shrink-0"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Loading...
        </div>
      ) : (
        <>
          {activeTab === 'expenses' && (
            <ExpensesTab
              expenses={expenses}
              categories={categories}
              onRefresh={loadData}
            />
          )}
          {activeTab === 'categories' && (
            <CategoriesTab categories={categories} onRefresh={loadData} />
          )}
          {activeTab === 'summary' && <SummaryTab expenses={expenses} />}
        </>
      )}
    </StaffLayout>
  );
}
