"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  from: Date;
  to: Date;
  onDateChange: (from: Date, to: Date) => void;
}

export function DateRangePicker({ from, to, onDateChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 14 Days', days: 14 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
    { label: 'This Month', days: 'month' as const },
    { label: 'Last Month', days: 'lastMonth' as const },
  ];

  const handlePreset = (days: number | 'month' | 'lastMonth') => {
    const today = new Date();
    let newFrom: Date;
    let newTo: Date = today;

    if (days === 'month') {
      newFrom = new Date(today.getFullYear(), today.getMonth(), 1);
      newTo = today;
    } else if (days === 'lastMonth') {
      newFrom = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      newTo = new Date(today.getFullYear(), today.getMonth(), 0);
    } else {
      newFrom = new Date();
      newFrom.setDate(today.getDate() - days);
    }

    onDateChange(newFrom, newTo);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !from && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {from && to ? (
            <>
              {format(from, "LLL dd, y")} - {format(to, "LLL dd, y")}
            </>
          ) : (
            <span>Pick a date range</span>
          )}
          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Presets */}
          <div className="border-r p-3 space-y-1">
            <div className="text-sm font-semibold mb-2">Quick Select</div>
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handlePreset(preset.days)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Calendar - Custom range (future enhancement) */}
          <div className="p-3">
            <div className="text-sm text-muted-foreground text-center">
              Custom range coming soon!
            </div>
            <div className="text-xs text-muted-foreground text-center mt-2">
              Use quick select for now
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
