"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface FilterValues {
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

interface AdvancedFiltersProps {
  onApply: (filters: FilterValues) => void;
  statusOptions?: { value: string; label: string }[];
  activeFiltersCount?: number;
}

export function AdvancedFilters({ 
  onApply, 
  statusOptions = [],
  activeFiltersCount = 0 
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({});

  const handleApply = () => {
    onApply(filters);
    setOpen(false);
  };

  const handleClear = () => {
    setFilters({});
    onApply({});
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge 
              variant="destructive" 
              className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Filter your data by various criteria
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by ID, name, etc..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          {/* Status Filter */}
          {statusOptions.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => 
                  setFilters({ ...filters, status: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Amount Range */}
          <div className="space-y-2">
            <Label>Amount Range (KSh)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount || ''}
                  onChange={(e) => 
                    setFilters({ 
                      ...filters, 
                      minAmount: e.target.value ? Number(e.target.value) : undefined 
                    })
                  }
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount || ''}
                  onChange={(e) => 
                    setFilters({ 
                      ...filters, 
                      maxAmount: e.target.value ? Number(e.target.value) : undefined 
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {Object.keys(filters).length > 0 && (
            <div className="space-y-2">
              <Label>Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {filters.status && (
                  <Badge variant="secondary">
                    Status: {filters.status}
                    <button
                      onClick={() => setFilters({ ...filters, status: undefined })}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.minAmount && (
                  <Badge variant="secondary">
                    Min: KSh {filters.minAmount}
                    <button
                      onClick={() => setFilters({ ...filters, minAmount: undefined })}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.maxAmount && (
                  <Badge variant="secondary">
                    Max: KSh {filters.maxAmount}
                    <button
                      onClick={() => setFilters({ ...filters, maxAmount: undefined })}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.search && (
                  <Badge variant="secondary">
                    Search: {filters.search}
                    <button
                      onClick={() => setFilters({ ...filters, search: undefined })}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={handleClear}>
            Clear All
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
