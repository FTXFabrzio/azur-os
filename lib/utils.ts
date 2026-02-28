import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSecureCode(name: string) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
  
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${initials}${randomChars}`;
}
