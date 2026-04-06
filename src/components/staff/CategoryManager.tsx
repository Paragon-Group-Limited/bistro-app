import { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import type { Category } from '@/data/types';
import { addCategory, editCategory, deleteCategory } from '@/data/api';

interface CategoryManagerProps {
  categories: Category[];
  onUpdate: (categories: Category[]) => void;
  menuItemCounts: Record<string, number>;
}

function AddCategoryDialog({ onAdd }: { onAdd: (data: { name: string; description?: string }) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }
    onAdd({ name: name.trim(), description: description.trim() || undefined });
    setName('');
    setDescription('');
    setOpen(false);
    toast.success(`${name} category added`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Soups"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Warm and comforting"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Category</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditCategoryDialog({ category, onEdit }: { category: Category; onEdit: (id: string, updates: Partial<Category>) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description || '');

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }
    onEdit(category.id, { name: name.trim(), description: description.trim() || undefined });
    setOpen(false);
    toast.success('Category updated');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {category.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CategoryManager({ categories, onUpdate, menuItemCounts }: CategoryManagerProps) {
  const [open, setOpen] = useState(false);

  const handleAdd = async (data: { name: string; description?: string }) => {
    const cat = await addCategory(data);
    onUpdate([...categories, cat]);
  };

  const handleEdit = async (id: string, updates: Partial<Category>) => {
    const updated = await editCategory(id, updates);
    onUpdate(categories.map(c => c.id === id ? updated : c));
  };

  const handleToggleActive = async (cat: Category) => {
    const updated = await editCategory(cat.id, { isActive: !cat.isActive });
    onUpdate(categories.map(c => c.id === cat.id ? updated : c));
  };

  const handleDelete = async (id: string) => {
    const count = menuItemCounts[id] || 0;
    if (count > 0) {
      toast.error(`Cannot delete — ${count} menu item${count !== 1 ? 's' : ''} still in this category`);
      return;
    }
    await deleteCategory(id);
    onUpdate(categories.filter(c => c.id !== id));
    toast.success('Category deleted');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="secondary">
          <GripVertical className="w-4 h-4 mr-1" />
          Categories ({categories.length})
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Manage Categories</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex justify-end">
            <AddCategoryDialog onAdd={handleAdd} />
          </div>

          <div className="space-y-2">
            {categories
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map(cat => {
                const count = menuItemCounts[cat.id] || 0;
                return (
                  <Card key={cat.id} className={`transition-opacity ${!cat.isActive ? 'opacity-50' : ''}`}>
                    <CardContent className="flex items-center gap-3 py-3 px-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{cat.name}</span>
                          <Badge variant="secondary" className="text-[10px] font-mono">
                            {count} item{count !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        {cat.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{cat.description}</p>
                        )}
                      </div>
                      <EditCategoryDialog category={cat} onEdit={handleEdit} />
                      <Switch
                        checked={cat.isActive}
                        onCheckedChange={() => handleToggleActive(cat)}
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {cat.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {count > 0
                                ? `This category has ${count} menu item${count !== 1 ? 's' : ''}. Remove or reassign them first.`
                                : 'This will permanently delete this category. This action cannot be undone.'
                              }
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(cat.id)}
                              disabled={count > 0}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
