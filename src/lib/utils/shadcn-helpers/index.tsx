import { twMerge } from 'tailwind-merge';
import { ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
  const v = clsx(inputs);
  return twMerge(v);
}
