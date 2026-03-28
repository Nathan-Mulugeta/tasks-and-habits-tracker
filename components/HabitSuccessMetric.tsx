'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getTimeframeDates, calculateExactExpectedGoal } from '@/lib/dateUtils';

export function HabitSuccessMetric({
  context,
  variant = 'card',
}: {
  context: 'home' | 'reports';
  variant?: 'card' | 'text';
}) {
  const { homeTimeframe, reportsTimeframe } = useAppStore();
  const activeTimeframe = context === 'home' ? homeTimeframe : reportsTimeframe;
  const { start, end, prevStart, prevEnd } = getTimeframeDates(activeTimeframe);

  const { data, isLoading } = useQuery({
    queryKey: ['habit-success', activeTimeframe],
    queryFn: async () => {
      const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('is_active', true);
      const { data: logs } = await supabase
        .from('habit_logs')
        .select('habit_id, actual_amount, completed_at')
        .gte('completed_at', prevStart.toISOString())
        .lte('completed_at', end.toISOString());

      if (!habits || habits.length === 0)
        return { currentSuccess: 0, prevSuccess: 0 };

      let currentValidHabits = 0;
      let totalCurrentSuccess = 0;
      let prevValidHabits = 0;
      let totalPrevSuccess = 0;

      habits.forEach((habit) => {
        const currExpected = calculateExactExpectedGoal(
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

        let currActual = 0,
          prevActual = 0;
        const habitLogs = logs?.filter((l) => l.habit_id === habit.id) || [];
        habitLogs.forEach((l) => {
          const logDate = new Date(l.completed_at);
          if (logDate >= start && logDate <= end) currActual += l.actual_amount;
          if (logDate >= prevStart && logDate <= prevEnd)
            prevActual += l.actual_amount;
        });

        // Current Math (Equal Vote & Overshoot Capping)
        if (currExpected > 0 || currActual > 0) {
          const score =
            currExpected > 0
              ? Math.min(100, (currActual / currExpected) * 100)
              : 100;
          totalCurrentSuccess += score;
          currentValidHabits++;
        }

        // Previous Math
        if (prevExpected > 0 || prevActual > 0) {
          const score =
            prevExpected > 0
              ? Math.min(100, (prevActual / prevExpected) * 100)
              : 100;
          totalPrevSuccess += score;
          prevValidHabits++;
        }
      });

      return {
        currentSuccess:
          currentValidHabits > 0 ? totalCurrentSuccess / currentValidHabits : 0,
        prevSuccess:
          prevValidHabits > 0 ? totalPrevSuccess / prevValidHabits : 0,
      };
    },
  });

  if (isLoading)
    return (
      <div className="text-[10px] uppercase font-bold text-muted-foreground animate-pulse ml-2 py-4">
        Calculating...
      </div>
    );

  const success = data?.currentSuccess || 0;
  const difference = success - (data?.prevSuccess || 0);
  const isPositive = difference > 0.5;
  const isNegative = difference < -0.5;

  if (variant === 'text') {
    return (
      <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 w-full sm:w-fit py-3 sm:py-2 sm:px-3 bg-transparent sm:bg-card border-none sm:border sm:border-solid sm:border-border/60 shadow-none sm:shadow-sm sm:rounded-lg">
        <span className="text-xs sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Habit Success:
        </span>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-3xl sm:text-xl font-black text-foreground leading-none tracking-tighter sm:tracking-normal">
            {success.toFixed(0)}%
          </span>
          <span className="hidden sm:block text-border/60 leading-none">•</span>
          <span
            className={`flex items-center gap-0.5 text-sm sm:text-xs font-bold ${isPositive ? 'text-emerald-500' : isNegative ? 'text-destructive' : 'text-muted-foreground'}`}
          >
            {isPositive && <TrendingUp className="w-4 h-4 sm:w-3.5 sm:h-3.5" />}
            {isNegative && (
              <TrendingDown className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            )}
            {!isPositive && !isNegative && (
              <Minus className="w-4 h-4 sm:w-3 sm:h-3" />
            )}
            {Math.abs(difference).toFixed(1)}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-border/40 shadow-none bg-card overflow-hidden relative">
      <CardHeader className="p-2 pb-0 sm:p-3 sm:pb-0">
        <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Habit Success
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0 sm:p-3 sm:pt-0">
        <div className="flex items-baseline justify-between">
          <span className="text-7xl font-bold tracking-tighter text-foreground leading-none">
            {success.toFixed(0)}
            <span className="text-2xl text-muted-foreground/30">%</span>
          </span>
          <div className="flex items-center gap-1 text-[11px] font-bold self-end mb-1">
            {isPositive && <TrendingUp className="w-3 h-3 text-emerald-500" />}
            {isNegative && (
              <TrendingDown className="w-3 h-3 text-destructive" />
            )}
            <span
              className={
                isPositive
                  ? 'text-emerald-500'
                  : isNegative
                    ? 'text-destructive'
                    : 'text-muted-foreground'
              }
            >
              {Math.abs(difference).toFixed(1)}%{' '}
              {isPositive ? 'UP' : isNegative ? 'DOWN' : ''}
            </span>
          </div>
        </div>
      </CardContent>
      <div className="absolute bottom-0 left-0 h-1 bg-muted w-full">
        <div
          className="h-full bg-foreground transition-all duration-500"
          style={{ width: `${success}%` }}
        />
      </div>
    </Card>
  );
}
