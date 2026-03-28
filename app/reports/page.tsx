'use client';

import { TimeframeSelector } from '@/components/TimeframeSelector';
import { HabitSuccessMetric } from '@/components/HabitSuccessMetric';
import { CategoryBreakdown } from '@/components/CategoryBreakdown';
import { TaskExecutionFlow } from '@/components/TaskExecutionFlow';

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-3 py-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Analytics
          </h1>
          <div className="w-full sm:w-auto">
            <TimeframeSelector context="reports" />
          </div>
        </header>

        <div className="space-y-8 pt-2">
          {/* Section 1: Habits Overview */}
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <h2 className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/80">
                Habits Overview
              </h2>
              {/* Using the Pill variant here at the top instead of a card! */}
              <HabitSuccessMetric context="reports" variant="text" />
            </div>

            <div className="w-full">
              <CategoryBreakdown />
            </div>
          </section>

          {/* Section 2: Task Execution Engine */}
          <section className="space-y-3">
            <h2 className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/80 px-1">
              Task Execution Flow
            </h2>
            <TaskExecutionFlow />
          </section>
        </div>
      </div>
    </main>
  );
}
