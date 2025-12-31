import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * @param path
 * Ex: `/login` -> `login`
 */
export const normalizePath = (path: string): string => {
  return path.startsWith('/') ? path.slice(1) : path;
};
