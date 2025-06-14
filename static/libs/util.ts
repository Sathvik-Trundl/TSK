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
