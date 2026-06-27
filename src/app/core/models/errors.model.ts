/**
 * Severity levels for categorizing errors by impact.
 */
export type ErrorSeverity = 'error' | 'warning' | 'info';

/**
 * Rich error item with metadata for enhanced display, filtering, and sorting.
 */
export interface ErrorItem {
  field: string;
  message: string;
  severity: ErrorSeverity;
  code?: string;
  timestamp: Date;
}

/**
 * Sort field options for the error list.
 */
export type ErrorSortField = 'timestamp' | 'severity' | 'field';

/**
 * Sort direction for the error list.
 */
export type ErrorSortDirection = 'asc' | 'desc';

/**
 * Legacy error format from the API: { errors: { field: "message" } }
 */
export interface Errors {
  errors: { [key: string]: string };
}
