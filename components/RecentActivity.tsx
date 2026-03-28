'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/card';

export function RecentActivity() {
  const { searchQuery } = useAppStore();

  // NEW: Debounce state so we don't spam the database on every single keystroke
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: logs,
    isLoading,
    error,
  } = useQuery({
    // The query key now depends on the debounced search word.
    // When the word changes, this query automatically re-runs!
    queryKey: ['recent-logs', debouncedQuery],
    queryFn: async () => {
      let baseQuery = supabase
        .from('habit_logs')
        .select(
          `id, habit_id, completed_at, actual_amount, habits ( title, category )`,
        )
        .order('completed_at', { ascending: false });

      if (debouncedQuery) {
        // STEP 1: If searching, find the habits that match the text first
        const { data: matchingHabits } = await supabase
          .from('habits')
          .select('id')
          .or(
            `title.ilike.%${debouncedQuery}%,category.ilike.%${debouncedQuery}%`,
          );

        const habitIds = matchingHabits?.map((h) => h.id) || [];

        // If no habits match the search, return nothing
        if (habitIds.length === 0) return [];

        // STEP 2: Fetch the top 50 logs for those specific habits from anywhere in history
        const { data, error } = await baseQuery
          .in('habit_id', habitIds)
          .limit(50);
        if (error) throw error;
        return data;
      } else {
        // STEP 3: If no search text, just show the normal 20 most recent logs globally
        const { data, error } = await baseQuery.limit(20);
        if (error) throw error;
        return data;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="text-[10px] uppercase font-bold text-muted-foreground animate-pulse ml-2 py-4">
        {debouncedQuery ? 'Searching history...' : 'Loading history...'}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-[10px] font-bold text-destructive ml-2 py-2">
        Failed to load history.
      </div>
    );
  }

  if (logs?.length === 0 && debouncedQuery) {
    return (
      <div className="text-xs text-muted-foreground italic ml-2 py-4">
        No logs found for "{debouncedQuery}"
      </div>
    );
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-1 mt-1">
      {/* Notice we are using 'logs' directly now, no more client-side filtering! */}
      {logs?.map((log: any) => (
        <Card
          key={log.id}
          className="bg-card shadow-none border-border/20 mb-1"
        >
          <CardContent className="px-3 py-1 flex items-center">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {log.habits?.title || 'Unknown Habit'}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground whitespace-nowrap overflow-hidden mt-0">
                <span>{formatTime(log.completed_at)}</span>
                <span className="text-border">•</span>
                <span className="truncate uppercase tracking-tight">
                  {log.habits?.category}
                </span>
                {log.actual_amount !== 1 && (
                  <span className="font-bold text-foreground/80 ml-auto text-[11px]">
                    x{log.actual_amount}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
