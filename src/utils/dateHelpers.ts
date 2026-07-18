/**
 * Safe parsing of YYYY-MM-DD to local midnight to avoid timezone shifts.
 */
export const parseLocalDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day, 0, 0, 0, 0);
  }
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Calculates the exact anniversary date by adding/subtracting months.
 * Handles month-end boundaries gracefully (e.g., Jan 31 + 1 month = Feb 28).
 */
export const getAnniversaryDate = (startDate: Date, monthsToAdd: number): Date => {
  const d = new Date(startDate.getTime());
  d.setMonth(d.getMonth() + monthsToAdd);
  
  // Account for month overflows (e.g. January 31 + 1 month rolls to March 3).
  // If so, set to the last day of the target month.
  const expectedMonth = (startDate.getMonth() + monthsToAdd) % 12;
  if (d.getMonth() !== expectedMonth) {
    d.setDate(0); // Sets to the last day of the previous month
  }
  return d;
};

export interface MonthCycleInfo {
  monthsCount: number;         // Which month is currently running (1, 2, 3...)
  currentCycleStart: string;   // YYYY-MM-DD
  currentCycleEnd: string;     // YYYY-MM-DD
  daysPassedInCycle: number;   // How many days have elapsed in the current cycle (1, 2...)
  totalDaysInCycle: number;     // Total days in the current cycle (e.g., 30, 31, 28)
}

/**
 * Calculates the exact monthly cycle information starting from the admission date.
 */
export const getMonthCycleInfo = (startDateStr: string, endDateStr?: string): MonthCycleInfo => {
  const start = parseLocalDate(startDateStr);
  const end = endDateStr ? parseLocalDate(endDateStr) : new Date();
  end.setHours(0, 0, 0, 0);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      monthsCount: 1,
      currentCycleStart: startDateStr,
      currentCycleEnd: startDateStr,
      daysPassedInCycle: 1,
      totalDaysInCycle: 30
    };
  }

  // Find the largest monthsToAdd such that anniversaryDate <= end
  let monthsToAdd = 0;
  while (true) {
    const nextAnniversary = getAnniversaryDate(start, monthsToAdd + 1);
    if (nextAnniversary.getTime() <= end.getTime()) {
      monthsToAdd++;
    } else {
      break;
    }
  }

  const cycleStart = getAnniversaryDate(start, monthsToAdd);
  const nextCycleStart = getAnniversaryDate(start, monthsToAdd + 1);
  
  const cycleEnd = new Date(nextCycleStart.getTime());
  cycleEnd.setDate(cycleEnd.getDate() - 1);

  // Calculate day-of-cycle (1-indexed)
  const diffMs = end.getTime() - cycleStart.getTime();
  const daysPassedInCycle = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  // Calculate total days in this specific cycle
  const totalDaysMs = nextCycleStart.getTime() - cycleStart.getTime();
  const totalDaysInCycle = Math.round(totalDaysMs / (1000 * 60 * 60 * 24));

  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return {
    monthsCount: monthsToAdd + 1,
    currentCycleStart: formatDate(cycleStart),
    currentCycleEnd: formatDate(cycleEnd),
    daysPassedInCycle: Math.max(daysPassedInCycle, 1),
    totalDaysInCycle: totalDaysInCycle > 0 ? totalDaysInCycle : 30
  };
};

/**
 * Replaces the old function with the precise anniversary-based count.
 * Returns the number of billing months due.
 */
export const getMonthsDifference = (startDateStr: string, endDateStr?: string): number => {
  if (!startDateStr) return 1;
  const info = getMonthCycleInfo(startDateStr, endDateStr);
  return info.monthsCount;
};

/**
 * Checks if a given date string (YYYY-MM-DD) is a Friday.
 */
export const isFriday = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return d.getDay() === 5;
  }
  return false;
};

