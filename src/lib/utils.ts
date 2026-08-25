import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateUz(dateInput: Date | string | undefined | null): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatMoneyUz(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return "0 so'm";
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
}
