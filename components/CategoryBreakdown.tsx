'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

import { getTimeframeDates, calculateExactExpectedGoal } from '@/lib/dateUtils';

const TrendIndicator = ({
  current,
  prev,
}: {
  current: number;
  prev: number;
}) => {
  const diff = current - prev;
  if (Math.abs(diff) < 0.5)
    return <Minus className="w-2.5 h-2.5 text-muted-foreground/50" />;
  if (diff > 0)
    return (
      <div className="flex items-center text-emerald-500">
        <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
        {diff.toFixed(0)}%
      </div>
    );
  return (
    <div className="flex items-center text-destructive">
      <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
      {Math.abs(diff).toFixed(0)}%
    </div>
  );
};

export function CategoryBreakdown() {
  const { reportsTimeframe } = useAppStore();
  const { start, end, prevStart, prevEnd } =
    getTimeframeDates(reportsTimeframe);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['category-breakdown', reportsTimeframe],
    queryFn: async () => {
      const { data: habits } = await supabase
        .from('habits')
        .select('id, title, category, frequency, target_amount')
        .eq('is_active', true);
      const { data: logs } = await supabase
        .from('habit_logs')
        .select('habit_id, actual_amount, completed_at')
        .gte('completed_at', prevStart.toISOString())
        .lte('completed_at', end.toISOString());

      if (!habits) return [];
      const categories = [...new Set(habits.map((h) => h.category))];

      const breakdown = categories.map((category) => {
        const catHabits = habits.filter((h) => h.category === category);

        let currentValidHabits = 0;
        let catTotalSuccess = 0;
        let prevValidHabits = 0;
        let catPrevTotalSuccess = 0;

        const habitDetails = catHabits.map((habit) => {
          const expected = calculateExactExpectedGoal(
            habit.frequency,
            habit.target_amount,
            start,
            end,
          );
          const prevExpected = calculateExactExpectedGoal(
            habit.frequency,
            habit.target_amount,
            prevStart,
            prevEnd,
          );

          let actual = 0,
            prevActual = 0;
          const habitLogs = logs?.filter((l) => l.habit_id === habit.id) || [];
          habitLogs.forEach((l) => {
            const d = new Date(l.completed_at);
            if (d >= start && d <= end) actual += l.actual_amount;
            if (d >= prevStart && d <= prevEnd) prevActual += l.actual_amount;
          });

          let success = 0,
            prevSuccess = 0;

          if (expected > 0 || actual > 0) {
            success =
              expected > 0 ? Math.min(100, (actual / expected) * 100) : 100;
            catTotalSuccess += success;
            currentValidHabits++;
          }
          if (prevExpected > 0 || prevActual > 0) {
            prevSuccess =
              prevExpected > 0
                ? Math.min(100, (prevActual / prevExpected) * 100)
                : 100;
            catPrevTotalSuccess += prevSuccess;
            prevValidHabits++;
          }

          return {
            id: habit.id,
            title: habit.title,
            frequency: habit.frequency,
            expected: Math.round(expected),
            actual,
            success,
            prevSuccess,
          };
        });

        const catSuccess =
          currentValidHabits > 0 ? catTotalSuccess / currentValidHabits : 0;
        const catPrevSuccess =
          prevValidHabits > 0 ? catPrevTotalSuccess / prevValidHabits : 0;

        return {
          category,
          success: catSuccess,
          prevSuccess: catPrevSuccess,
          habits: habitDetails.sort((a, b) => b.success - a.success),
        };
      });

      return breakdown.sort((a, b) => b.success - a.success);
    },
  });

  if (isLoading)
    return (
      <div className="p-4 text-[10px] uppercase font-bold text-muted-foreground animate-pulse">
        Calculating Categories...
      </div>
    );

  return (
    <div className="bg-card border border-border/60 rounded-lg shadow-sm h-full flex flex-col overflow-hidden">
      {/* Header section with its own padding */}
      <div className="px-3 pt-3 pb-2 border-b border-border/20">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Category Performance
        </h3>
      </div>

      {/* List section with no outer padding, allowing items to touch the edges */}
      <div className="flex flex-col w-full pb-1">
        {data?.map((cat) => (
          <div key={cat.category} className="w-full flex flex-col">
            {/* Edge-to-Edge Clickable Area */}
            <button
              onClick={() =>
                setExpandedCategory(
                  expandedCategory === cat.category ? null : cat.category,
                )
              }
              className="w-full text-left space-y-2 group focus:outline-none hover:bg-muted/50 px-3 py-3 transition-colors"
            >
              <div className="flex items-end justify-between text-[11px] font-bold">
                <span className="uppercase tracking-wider group-hover:text-primary transition-colors">
                  {cat.category}
                </span>
                <div className="flex items-center gap-2">
                  <div className="text-[9px] font-bold opacity-80">
                    <TrendIndicator
                      current={cat.success}
                      prev={cat.prevSuccess}
                    />
                  </div>
                  <span
                    className={
                      cat.success >= 100
                        ? 'text-emerald-500'
                        : 'text-foreground'
                    }
                  >
                    {cat.success.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-muted/60 overflow-hidden rounded-full">
                <div
                  className={`h-full transition-all duration-1000 ${cat.success >= 100 ? 'bg-emerald-500' : 'bg-foreground'}`}
                  style={{ width: `${Math.min(100, cat.success)}%` }}
                />
              </div>
            </button>

            {/* Expanded Habit List */}
            {expandedCategory === cat.category && (
              <div className="px-3 pb-3 pt-1 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                {cat.habits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex flex-col gap-0.5 bg-muted/20 px-2 py-1.5 rounded border border-border/40"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-medium text-foreground/90">
                        {habit.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="text-[9px] font-bold opacity-80">
                          <TrendIndicator
                            current={habit.success}
                            prev={habit.prevSuccess}
                          />
                        </div>
                        <span
                          className={`text-[10px] font-bold shrink-0 ${habit.success >= 100 ? 'text-emerald-500' : 'text-foreground'}`}
                        >
                          {habit.success.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground uppercase tracking-widest">
                      <span>{habit.frequency}</span>
                      <span className="text-border">•</span>
                      <span>
                        Done:{' '}
                        <span className="text-foreground/80 font-bold">
                          {habit.actual}
                        </span>{' '}
                        / {habit.expected}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
