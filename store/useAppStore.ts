import { create } from 'zustand';

export type Timeframe =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'next_month'
  | 'this_year'
  | 'last_year';

interface AppState {
  // Independent Timeframes
  homeTimeframe: Timeframe;
  setHomeTimeframe: (timeframe: Timeframe) => void;

  reportsTimeframe: Timeframe;
  setReportsTimeframe: (timeframe: Timeframe) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  homeTimeframe: 'today', // Home defaults to Today
  setHomeTimeframe: (timeframe) => set({ homeTimeframe: timeframe }),

  reportsTimeframe: 'this_month', // Reports default to This Month
  setReportsTimeframe: (timeframe) => set({ reportsTimeframe: timeframe }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
