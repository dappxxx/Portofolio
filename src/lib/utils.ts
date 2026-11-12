import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "3" -> "03" */
export function pad2(value: number) {
  return String(value).padStart(2, "0");
}
