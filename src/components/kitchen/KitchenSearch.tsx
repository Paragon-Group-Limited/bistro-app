import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface KitchenSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function KitchenSearch({ value, onChange, placeholder = 'Search by order #...' }: KitchenSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="pl-9 pr-8"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
          onClick={() => onChange('')}
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
