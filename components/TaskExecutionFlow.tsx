'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import {
  CheckCircle2,
  Circle,
  Clock,
  CalendarDays,
  AlertCircle,
  ArrowRightLeft,
  Target,
  ListTodo,
} from 'lucide-react';
import { getTimeframeDates, calculateExactExpectedGoal } from '@/lib/dateUtils';

type TabType =
  | 'all'
  | 'completed'
  | 'due'
  | 'created'
  | 'overdue'
  | 'pushed_out'
  | 'pulled_in'
  | null;

export function TaskExecutionFlow() {
  const { reportsTimeframe } = useAppStore();
  const { start, end } = getTimeframeDates(reportsTimeframe);
  const [activeTab, setActiveTab] = useState<TabType>(null);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks-execution', reportsTimeframe],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading)
    return (
      <div className="p-4 text-[10px] uppercase font-bold text-muted-foreground animate-pulse">
        Running Task Engine...
      </div>
    );

  const allTasks = tasks || [];
  const now = new Date();

  const metrics = {
    all: allTasks.filter(
      (t) =>
        (t.due_date &&
          new Date(t.due_date) >= start &&
          new Date(t.due_date) <= end) ||
        (t.created_at &&
          new Date(t.created_at) >= start &&
          new Date(t.created_at) <= end) ||
        (t.completed_at &&
          new Date(t.completed_at) >= start &&
          new Date(t.completed_at) <= end),
    ),
    completed: allTasks.filter(
      (t) =>
        t.status === 'completed' &&
        t.completed_at &&
        new Date(t.completed_at) >= start &&
        new Date(t.completed_at) <= end,
    ),
    created: allTasks.filter(
      (t) =>
        t.created_at &&
        new Date(t.created_at) >= start &&
        new Date(t.created_at) <= end,
    ),
    due: allTasks.filter(
      (t) =>
        t.due_date &&
        new Date(t.due_date) >= start &&
        new Date(t.due_date) <= end,
    ),
    overdue: allTasks.filter(
      (t) =>
        t.status === 'needsAction' &&
        t.due_date &&
        new Date(t.due_date) >= start &&
        new Date(t.due_date) <= end &&
        new Date(t.due_date) < now,
    ),
    pushed_out: allTasks.filter(
      (t) =>
        t.initial_due_date &&
        t.due_date &&
        new Date(t.initial_due_date) >= start &&
        new Date(t.initial_due_date) <= end &&
        new Date(t.due_date) > end,
    ),
    pulled_in: allTasks.filter(
      (t) =>
        t.initial_due_date &&
        t.due_date &&
        (new Date(t.initial_due_date) < start ||
          new Date(t.initial_due_date) > end) &&
        new Date(t.due_date) >= start &&
        new Date(t.due_date) <= end,
    ),
  };

  const activeList = activeTab ? metrics[activeTab] : [];

  const categoryGroups = activeList.reduce(
    (acc, task) => {
      const cat = task.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(task);
      return acc;
    },
    {} as Record<string, typeof activeList>,
  );

  const sortedCategories = Object.keys(categoryGroups).sort(
    (a, b) => categoryGroups[b].length - categoryGroups[a].length,
  );

  const tabTitles = {
    all: 'All Tasks',
    completed: 'Completed',
    due: 'Due',
    created: 'Created',
    overdue: 'Overdue',
    pushed_out: 'Pushed Out',
    pulled_in: 'Pulled In',
  };

  const themes = {
    all: {
      activeBg: 'bg-primary/10',
      activeBorder: 'border-primary',
      text: 'text-primary',
    },
    completed: {
      activeBg: 'bg-emerald-500/10',
      activeBorder: 'border-emerald-500',
      text: 'text-emerald-500',
    },
    due: {
      activeBg: 'bg-blue-500/10',
      activeBorder: 'border-blue-500',
      text: 'text-blue-500',
    },
    created: {
      activeBg: 'bg-purple-500/10',
      activeBorder: 'border-purple-500',
      text: 'text-purple-500',
    },
    overdue: {
      activeBg: 'bg-destructive/10',
      activeBorder: 'border-destructive',
      text: 'text-destructive',
    },
    pushed_out: {
      activeBg: 'bg-orange-500/10',
      activeBorder: 'border-orange-500',
      text: 'text-orange-500',
    },
    pulled_in: {
      activeBg: 'bg-teal-500/10',
      activeBorder: 'border-teal-500',
      text: 'text-teal-500',
    },
  };

  const MetricCard = ({
    title,
    count,
    icon: Icon,
    tab,
  }: {
    title: string;
    count: number;
    icon: any;
    tab: TabType;
  }) => {
    if (!tab) return null;
    const isActive = activeTab === tab;
    const theme = themes[tab];

    return (
      <button
        onClick={() => setActiveTab(isActive ? null : tab)}
        className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all duration-200 ${
          isActive
            ? `${theme.activeBorder} ${theme.activeBg} shadow-sm ring-1 ring-border/50`
            : 'border-border/60 bg-card hover:bg-accent/50 hover:border-border'
        }`}
      >
        <div
          className={`flex items-center gap-1.5 mb-2 ${isActive ? theme.text : 'text-muted-foreground'}`}
        >
          <Icon className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {title}
          </span>
        </div>
        <span
          className={`text-2xl font-black leading-none ${isActive ? theme.text : 'text-foreground'}`}
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <MetricCard
        title="All Tasks (In Timeframe)"
        count={metrics.all.length}
        icon={ListTodo}
        tab="all"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        <MetricCard
          title="Completed"
          count={metrics.completed.length}
          icon={CheckCircle2}
          tab="completed"
        />
        <MetricCard
          title="Due"
          count={metrics.due.length}
          icon={Target}
          tab="due"
        />
        <MetricCard
          title="Created"
          count={metrics.created.length}
          icon={CalendarDays}
          tab="created"
        />

        <MetricCard
          title="Overdue"
          count={metrics.overdue.length}
          icon={AlertCircle}
          tab="overdue"
        />
        <MetricCard
          title="Pushed Out"
          count={metrics.pushed_out.length}
          icon={ArrowRightLeft}
          tab="pushed_out"
        />
        <MetricCard
          title="Pulled In"
          count={metrics.pulled_in.length}
          icon={Clock}
          tab="pulled_in"
        />
      </div>

      {activeTab && (
        <div className="bg-card border border-border/60 rounded-lg overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="bg-muted/30 px-3 py-2 border-b border-border/50">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground">
              {tabTitles[activeTab]} • {activeList.length}{' '}
              {activeList.length === 1 ? 'Task' : 'Tasks'} Found
            </h4>

            {/* Layer 1: The Quick Tally Row (Now wrapping on mobile!) */}
            {activeList.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-2 pb-1">
                {sortedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="whitespace-nowrap text-[9px] font-bold uppercase tracking-wider bg-background border border-border/60 px-2 py-0.5 rounded text-muted-foreground"
                  >
                    {cat}:{' '}
                    <span className="text-foreground">
                      {categoryGroups[cat].length}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Removed max-h-72 and overflow-y-auto to allow unrestricted downward flow */}
          <div className="p-1.5 space-y-3">
            {activeList.length === 0 ? (
              <p className="text-xs text-muted-foreground italic p-4 text-center">
                No tasks match this filter.
              </p>
            ) : (
              sortedCategories.map((cat) => (
                <div key={cat} className="space-y-0.5">
                  {/* Layer 2: The Category Banner (Now includes the task count!) */}
                  <div className="flex items-center justify-between bg-muted/40 border border-border/40 px-2.5 py-1.5 rounded-sm mx-1">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/80">
                      {cat}
                    </h5>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {categoryGroups[cat].length}{' '}
                      {categoryGroups[cat].length === 1 ? 'Task' : 'Tasks'}
                    </span>
                  </div>

                  {/* The Grouped Tasks */}
                  <div className="flex flex-col">
                    {categoryGroups[cat].map((task: any) => {
                      const formattedDate = task.due_date
                        ? new Date(task.due_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'No Date';

                      return (
                        <div
                          key={task.google_task_id}
                          className="px-3 py-2 border-b border-border/10 last:border-0 hover:bg-accent/30 flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              {task.status === 'completed' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />
                              )}
                              <p
                                className={`text-sm font-medium truncate ${task.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                              >
                                {task.title}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
                              Due
                            </p>
                            <p className="text-[11px] font-medium text-foreground">
                              {formattedDate}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
