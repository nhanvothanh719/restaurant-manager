import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UseFormSetError } from 'react-hook-form';
import { UnprocessableEntityError } from '@/lib/http';
import { toast } from 'sonner';

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

/**
 *
 * @param param0
 */
export const handleApiError = ({
  error,
  setError,
  toastDuration,
}: {
  error: any;
  setError?: UseFormSetError<any>;
  toastDuration?: number;
}) => {
  console.error(error);

  if (error instanceof UnprocessableEntityError && setError) {
    error.payload.errors.forEach((err) => {
      setError(err.field, {
        type: 'server',
        message: err.message,
      });
    });
  } else {
    toast.error(`${error.payload.message}`, { duration: toastDuration });
  }
};
