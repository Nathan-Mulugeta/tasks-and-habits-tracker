import { SearchBar } from '@/components/SearchBar';
import { RecentActivity } from '@/components/RecentActivity';
import { SyncButton } from '@/components/SyncButton';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground px-3 py-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header - No back buttons, just controls */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
          <div className="w-full sm:w-64">
            <SearchBar />
          </div>
          <SyncButton />
        </header>

        <section className="pt-2">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 ml-1">
            Recent Activity
          </h2>
          <RecentActivity />
        </section>
      </div>
    </main>
  );
}
