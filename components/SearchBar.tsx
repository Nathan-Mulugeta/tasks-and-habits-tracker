'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/useAppStore';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useAppStore();

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-muted-foreground" />
      </div>
      <Input
        type="text"
        placeholder="Search habits or categories..."
        className="pl-10 pr-10 bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {/* The Clear Button (Only shows if there is text) */}
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
