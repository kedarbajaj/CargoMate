
import { format, formatDistance, parseISO } from 'date-fns';

/**
 * Format currency in INR
 * @param amount Amount to format
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a date string
 * @param dateString Date string to format
 * @param formatString Format string to use
 */
export const formatDateString = (dateString: string, formatString: string = 'PPP'): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format a date relative to now
 * @param dateString Date string to format
 */
export const formatRelativeDate = (dateString: string): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return formatDistance(date, new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return dateString;
  }
};

/**
 * Format a date
 * @param dateString Date string to format
 * @param formatStr Optional format string
 */
export const formatDate = (dateString: string, formatStr: string = 'PPP'): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date(dateString).toLocaleDateString();
  }
};
