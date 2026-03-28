// lib/dateUtils.ts

export function getTimeframeDates(timeframe: string) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  const prevStart = new Date(now);
  const prevEnd = new Date(now);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  prevStart.setHours(0, 0, 0, 0);
  prevEnd.setHours(23, 59, 59, 999);

  if (timeframe === 'today') {
    prevStart.setDate(start.getDate() - 1);
    prevEnd.setDate(end.getDate() - 1);
  } else if (timeframe === 'yesterday') {
    start.setDate(now.getDate() - 1);
    end.setDate(now.getDate() - 1);
    prevStart.setDate(now.getDate() - 2);
    prevEnd.setDate(now.getDate() - 2);
  } else if (timeframe === 'this_week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    end.setDate(diff + 6);
    prevStart.setDate(diff - 7);
    prevEnd.setDate(diff - 1);
  } else if (timeframe === 'last_week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) - 7;
    start.setDate(diff);
    end.setDate(diff + 6);
    prevStart.setDate(diff - 7);
    prevEnd.setDate(diff - 1);
  } else if (timeframe === 'this_month') {
    start.setDate(1);
    end.setMonth(now.getMonth() + 1, 0);
    prevStart.setMonth(now.getMonth() - 1, 1);
    prevEnd.setMonth(now.getMonth(), 0);
  } else if (timeframe === 'last_month') {
    start.setMonth(now.getMonth() - 1, 1);
    end.setMonth(now.getMonth(), 0);
    prevStart.setMonth(now.getMonth() - 2, 1);
    prevEnd.setMonth(now.getMonth() - 1, 0);
  } else if (timeframe === 'next_month') {
    start.setMonth(now.getMonth() + 1, 1);
    end.setMonth(now.getMonth() + 2, 0);
    prevStart.setDate(1);
    prevEnd.setMonth(now.getMonth() + 1, 0);
  } else if (timeframe === 'this_year') {
    start.setMonth(0, 1);
    end.setFullYear(now.getFullYear(), 11, 31);
    prevStart.setFullYear(now.getFullYear() - 1, 0, 1);
    prevEnd.setFullYear(now.getFullYear() - 1, 11, 31);
  } else if (timeframe === 'last_year') {
    start.setFullYear(now.getFullYear() - 1, 0, 1);
    end.setFullYear(now.getFullYear() - 1, 11, 31);
    prevStart.setFullYear(now.getFullYear() - 2, 0, 1);
    prevEnd.setFullYear(now.getFullYear() - 2, 11, 31);
  }

  return { start, end, prevStart, prevEnd };
}

export function calculateExactExpectedGoal(
  frequency: string,
  target: number,
  start: Date,
  end: Date,
): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / msPerDay),
  );

  switch (frequency) {
    case 'Daily':
      return target * totalDays;
    case 'Weekdays': {
      let weekdaysCount = 0;
      let currentDate = new Date(start);
      currentDate.setHours(0, 0, 0, 0);
      const endDate = new Date(end);
      endDate.setHours(0, 0, 0, 0);
      while (currentDate <= endDate) {
        const day = currentDate.getDay();
        if (day !== 0 && day !== 6) weekdaysCount++;
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return target * weekdaysCount;
    }
    case 'Weekly':
      return target * (totalDays / 7);
    case 'Every 2 weeks':
      return target * (totalDays / 14);
    case 'Monthly': {
      const daysInMonth = new Date(
        start.getFullYear(),
        start.getMonth() + 1,
        0,
      ).getDate();
      return target * (totalDays / daysInMonth);
    }
    default:
      return target;
  }
}
