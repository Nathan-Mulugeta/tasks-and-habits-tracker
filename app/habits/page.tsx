'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function HabitsDirectory() {
  const { data: habitData, isLoading } = useQuery({
    queryKey: ['habits-directory'],
    queryFn: async () => {
      // 1. Fetch active habits
      const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      // 2. Fetch recent logs just to get the "Last Done" timestamps
      // We limit to 500 to keep it lightning fast without loading your entire history
      const { data: logs } = await supabase
        .from('habit_logs')
        .select('habit_id, completed_at')
        .order('completed_at', { ascending: false })
        .limit(500);

      return { habits, logs };
    },
  });

  if (isLoading)
    return (
      <div className="p-6 text-[10px] animate-pulse uppercase font-bold text-muted-foreground">
        Syncing Directory...
      </div>
    );

  const habits = habitData?.habits || [];
  const logs = habitData?.logs || [];
  const categories = [...new Set(habits.map((h) => h.category))];

  return (
    <main className="min-h-screen bg-background text-foreground px-3 py-2 sm:px-6 sm:py-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <header className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Habits
            </h1>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {habits.length} Total
          </p>
        </header>

        <div className="space-y-6 pt-2">
          {categories.map((category) => {
            const categoryHabits = habits.filter(
              (h) => h.category === category,
            );

            return (
              <section key={category} className="mb-4">
                {/* Category Banner */}
                <div className="flex items-center justify-between bg-muted/50 border border-border/50 px-3 py-2 rounded-md mb-1">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground">
                    {category}
                  </h2>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {categoryHabits.length}{' '}
                    {categoryHabits.length === 1 ? 'Habit' : 'Habits'}
                  </span>
                </div>

                {/* The Habit List */}
                <div className="flex flex-col">
                  {categoryHabits.map((habit) => {
                    // Find the absolute most recent log for this specific habit
                    const lastLog = logs.find((l) => l.habit_id === habit.id);

                    const timeAgo = lastLog
                      ? new Date(lastLog.completed_at).toLocaleDateString(
                          'en-US',
                          { month: 'short', day: 'numeric' },
                        )
                      : '—';

                    return (
                      <div
                        key={habit.id}
                        className="group flex flex-col py-2.5 px-2 border-b border-border/10 hover:bg-accent/30 transition-colors"
                      >
                        {/* Top Row: Title & Last Done */}
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <p className="text-sm font-semibold text-foreground/90 leading-tight">
                            {habit.title}
                          </p>
                          <div className="flex items-center gap-1 shrink-0 text-[11px] text-muted-foreground mt-0.5">
                            <span className="uppercase text-[9px] tracking-wider opacity-60">
                              Last:
                            </span>
                            <span className="font-medium text-foreground/70">
                              {timeAgo}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Row: The Static Goal Rules */}
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <span className="uppercase font-medium tracking-tight">
                              {habit.frequency}
                            </span>
                            <span className="text-border/60">•</span>
                            <span>
                              Target:{' '}
                              <span className="text-foreground/80 font-medium">
                                {habit.target_amount}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
