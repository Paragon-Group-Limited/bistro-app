import { useState, useRef } from 'react';
import { Plus, ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Category } from '@/data/types';

interface AddMenuItemDialogProps {
  categories: Category[];
  onAdd: (item: {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    prepTimeMinutes: number;
    image?: string;
  }) => void;
}

export function AddMenuItemDialog({ categories, onAdd }: AddMenuItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [prepTime, setPrepTime] = useState('10');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!name.trim() || !description.trim() || !price || !categoryId) {
      toast.error('Fill in all required fields');
      return;
    }

    onAdd({
      name: name.trim(),
      description: description.trim(),
      price: parseInt(price),
      categoryId,
      prepTimeMinutes: parseInt(prepTime) || 10,
      image: imagePreview || undefined,
    });

    // Reset form
    setName('');
    setDescription('');
    setPrice('');
    setCategoryId('');
    setPrepTime('10');
    setImagePreview(null);
    setOpen(false);
    toast.success(`${name} added to menu`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Menu Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Image</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative w-full h-36 rounded-lg overflow-hidden border">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-36 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
              >
                <ImagePlus className="w-8 h-8" />
                <span className="text-xs">Click to upload image</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Chicken Shawarma"
            />
          </div>

          <div className="space-y-2">
            <Label>Description *</Label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tender chicken with garlic sauce..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Price (৳) *</Label>
              <Input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="450"
              />
            </div>
            <div className="space-y-2">
              <Label>Prep Time (min)</Label>
              <Input
                type="number"
                value={prepTime}
                onChange={e => setPrepTime(e.target.value)}
                placeholder="10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category *</Label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
