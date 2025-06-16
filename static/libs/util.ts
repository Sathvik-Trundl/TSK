import { view } from "@forge/bridge";
import { useQuery } from "@tanstack/react-query";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const useProductContext = () => {
  return useQuery({
    queryKey: ["getProductContext"],
    queryFn: () => view.getContext(),
  });
};

// utils/formatDateTime.ts

export function formatDateTime(dateTime?: string, timeZone?: string): string {
  if (!dateTime) return "-";
  try {
    // Convert to Date object (supports both ISO and most standard formats)
    const date = new Date(dateTime);

    // If invalid, return as-is (could be unexpected format)
    if (isNaN(date.getTime())) return dateTime;

    // Use toLocaleString for nice formatting
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timeZone || "UTC",
    });
  } catch {
    // Fallback in case of any error
    return dateTime;
  }
}
