import { format, differenceInMonths, isAfter, parseISO } from 'date-fns';

export interface CourseMonthResult {
  monthNumber: number;
  label: string; // e.g. "1-oy", "4-oy"
}

export const UZBEK_DAYS_MAP: Record<number, string> = {
  0: "Yakshanba",
  1: "Dushanba",
  2: "Seshanba",
  3: "Chorshanba",
  4: "Payshanba",
  5: "Juma",
  6: "Shanba",
};

/**
 * BUSINESS RULE 1 & SECTION 7:
 * Calculates current course month automatically based on joinedDate.
 */
export function calculateCourseMonth(joinedDateInput?: Date | string | null): CourseMonthResult {
  if (!joinedDateInput) {
    return { monthNumber: 1, label: "1-oy" };
  }
  const joinedDate = typeof joinedDateInput === 'string' ? new Date(joinedDateInput) : joinedDateInput;
  const today = new Date();

  if (isNaN(joinedDate.getTime())) {
    return { monthNumber: 1, label: "1-oy" };
  }

  let yearsDiff = today.getFullYear() - joinedDate.getFullYear();
  let monthsDiff = today.getMonth() - joinedDate.getMonth();
  let totalMonths = yearsDiff * 12 + monthsDiff;

  if (today.getDate() >= joinedDate.getDate()) {
    totalMonths += 1;
  }

  const monthNumber = Math.max(1, totalMonths);
  return {
    monthNumber,
    label: `${monthNumber}-oy`,
  };
}

export interface PaymentPeriodStatus {
  periodIndex: number; // 1, 2, 3...
  startDate: string;   // YYYY-MM-DD
  dueDate: string;     // YYYY-MM-DD
  amount: number;
  status: "PAID" | "OVERDUE" | "PENDING";
  statusText: string;
}

/**
 * BUSINESS RULES 8, 9, 10, 11 & SECTIONS 20, 21:
 * Payment periods calculation
 */
export function calculatePaymentPeriods(
  joinedDateInput?: Date | string | null,
  monthlyFee: number = 0,
  paymentDueDay: number = 5,
  totalAmountPaid: number = 0
): {
  periods: PaymentPeriodStatus[];
  totalDebt: number;
  paymentStatus: "PAID" | "OVERDUE" | "PARTIAL";
} {
  if (!joinedDateInput) {
    return {
      periods: [],
      totalDebt: 0,
      paymentStatus: "PAID",
    };
  }

  const joinedDate = typeof joinedDateInput === 'string' ? new Date(joinedDateInput) : joinedDateInput;
  if (isNaN(joinedDate.getTime())) {
    return {
      periods: [],
      totalDebt: 0,
      paymentStatus: "PAID",
    };
  }

  const currentMonthInfo = calculateCourseMonth(joinedDate);
  const currentMonthCount = currentMonthInfo.monthNumber;

  const periods: PaymentPeriodStatus[] = [];
  let remainingPaidAmount = totalAmountPaid || 0;
  let totalDebt = 0;
  let hasOverdue = false;

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  for (let i = 1; i <= Math.max(currentMonthCount, 1); i++) {
    const periodStart = new Date(joinedDate);
    periodStart.setMonth(periodStart.getMonth() + (i - 1));

    const dueYear = periodStart.getFullYear();
    const dueMonth = periodStart.getMonth();
    const maxDaysInMonth = new Date(dueYear, dueMonth + 1, 0).getDate();
    const actualDueDay = Math.min(Math.max(1, paymentDueDay || 5), maxDaysInMonth);
    const dueDateObj = new Date(dueYear, dueMonth, actualDueDay);
    const dueDateStr = format(dueDateObj, 'yyyy-MM-dd');

    let status: "PAID" | "OVERDUE" | "PENDING";
    let statusText: string;

    const daysSinceJoined = Math.floor((new Date().getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
    const isPastCompletedMonth = daysSinceJoined > 20 && i < currentMonthCount;

    if (remainingPaidAmount >= monthlyFee || isPastCompletedMonth) {
      status = "PAID";
      statusText = "To'langan";
      if (remainingPaidAmount >= monthlyFee) {
        remainingPaidAmount -= monthlyFee;
      }
    } else {
      if (todayStr >= dueDateStr) {
        status = "OVERDUE";
        statusText = "Qarzdor";
        totalDebt += (monthlyFee - remainingPaidAmount);
        remainingPaidAmount = 0;
        hasOverdue = true;
      } else {
        status = "PENDING";
        statusText = "Kutilmoqda";
        if (remainingPaidAmount > 0) {
          totalDebt += (monthlyFee - remainingPaidAmount);
          remainingPaidAmount = 0;
        }
      }
    }

    periods.push({
      periodIndex: i,
      startDate: format(periodStart, 'yyyy-MM-dd'),
      dueDate: dueDateStr,
      amount: monthlyFee,
      status,
      statusText,
    });
  }

  let paymentStatus: "PAID" | "OVERDUE" | "PARTIAL" = "PAID";
  if (hasOverdue) {
    paymentStatus = "OVERDUE";
  } else if (totalDebt > 0) {
    paymentStatus = "PARTIAL";
  }

  return {
    periods,
    totalDebt,
    paymentStatus,
  };
}

/**
 * BUSINESS RULE 2, 3, 16: Schedule matching for group lessons.
 */
export function isGroupScheduledOnDate(
  schedules?: { dayOfWeek: string; startTime: string; endTime: string }[] | null,
  targetDateInput?: Date | string | null
): boolean {
  if (!schedules || !Array.isArray(schedules) || schedules.length === 0) return false;
  if (!targetDateInput) return false;

  const targetDate = typeof targetDateInput === 'string' ? new Date(targetDateInput) : targetDateInput;
  if (isNaN(targetDate.getTime())) return false;

  const dayIndex = targetDate.getDay();
  const uzbekDayName = UZBEK_DAYS_MAP[dayIndex];
  if (!uzbekDayName) return false;

  return schedules.some((s) => s && s.dayOfWeek && s.dayOfWeek.toLowerCase() === uzbekDayName.toLowerCase());
}

export function isDateInFuture(dateStr: string): boolean {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  return dateStr > todayStr;
}

export function formatUZS(amount: number): string {
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
}
