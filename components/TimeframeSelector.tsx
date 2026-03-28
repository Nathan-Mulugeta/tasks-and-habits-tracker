'use client';

import { useAppStore } from '@/store/useAppStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMemo } from 'react';

type Timeframe =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'next_month'
  | 'this_year'
  | 'last_year';

export function TimeframeSelector({
  context,
}: {
  context: 'home' | 'reports';
}) {
  const {
    homeTimeframe,
    setHomeTimeframe,
    reportsTimeframe,
    setReportsTimeframe,
  } = useAppStore();

  const value = context === 'home' ? homeTimeframe : reportsTimeframe;
  const setValue = context === 'home' ? setHomeTimeframe : setReportsTimeframe;

  const { thisMonth, lastMonth, nextMonth, thisYear, lastYear } =
    useMemo(() => {
      const now = new Date();

      const thisM = now.toLocaleString('en-US', { month: 'short' });
      const lastMDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastM = lastMDate.toLocaleString('en-US', { month: 'short' });
      const nextMDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const nextM = nextMDate.toLocaleString('en-US', { month: 'short' });

      return {
        thisMonth: thisM,
        lastMonth: lastM,
        nextMonth: nextM,
        thisYear: now.getFullYear(),
        lastYear: now.getFullYear() - 1,
      };
    }, []);

  return (
    <Select value={value} onValueChange={(val) => setValue(val as Timeframe)}>
      <SelectTrigger className="w-full sm:w-[190px] bg-transparent border-border/40 text-[11px] font-bold uppercase tracking-wider h-8 shadow-none focus:ring-0">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent className="border-border/60">
        <SelectItem value="today" className="text-[11px] uppercase font-bold">
          Today
        </SelectItem>
        <SelectItem
          value="yesterday"
          className="text-[11px] uppercase font-bold"
        >
          Yesterday
        </SelectItem>
        <SelectItem
          value="this_week"
          className="text-[11px] uppercase font-bold"
        >
          This Week
        </SelectItem>
        <SelectItem
          value="last_week"
          className="text-[11px] uppercase font-bold"
        >
          Last Week
        </SelectItem>
        <SelectItem
          value="this_month"
          className="text-[11px] uppercase font-bold"
        >
          This Month ({thisMonth})
        </SelectItem>
        <SelectItem
          value="last_month"
          className="text-[11px] uppercase font-bold"
        >
          Last Month ({lastMonth})
        </SelectItem>
        <SelectItem
          value="next_month"
          className="text-[11px] uppercase font-bold"
        >
          Next Month ({nextMonth})
        </SelectItem>
        <SelectItem
          value="this_year"
          className="text-[11px] uppercase font-bold"
        >
          This Year ({thisYear})
        </SelectItem>
        <SelectItem
          value="last_year"
          className="text-[11px] uppercase font-bold"
        >
          Last Year ({lastYear})
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
