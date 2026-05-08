'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();
  const syncWebhookUrl = process.env.NEXT_PUBLIC_SYNC_WEBHOOK_URL;

  const handleSync = async () => {
    if (!syncWebhookUrl) {
      console.error(
        'Missing NEXT_PUBLIC_SYNC_WEBHOOK_URL. Add it to your environment variables and redeploy.',
      );
      return;
    }

    setIsSyncing(true);

    try {
      // 1. Ping your Google Apps Script URL to trigger the sync
      // We use 'no-cors' so the browser doesn't block the request to Google's servers
      await fetch(syncWebhookUrl, {
        method: 'POST',
        mode: 'no-cors',
      });

      // 2. Wait 2 seconds to give the Apps Script time to finish writing to Supabase
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 3. Tell React Query to fetch the fresh data from Supabase!
      // This will instantly update your dashboard UI
      await queryClient.invalidateQueries();
    } catch (error) {
      console.error('Failed to trigger sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing || !syncWebhookUrl}
      className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground bg-card border border-border/40 rounded-md transition-all active:scale-95 disabled:opacity-50"
    >
      <RefreshCw
        className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-primary' : ''}`}
      />
      {isSyncing ? 'Syncing...' : 'Sync Tasks'}
    </button>
  );
}
