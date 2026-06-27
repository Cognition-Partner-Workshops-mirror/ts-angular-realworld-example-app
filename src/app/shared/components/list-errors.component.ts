import { ChangeDetectionStrategy, Component, computed, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Errors, ErrorItem, ErrorSeverity, ErrorSortField, ErrorSortDirection } from '../../core/models/errors.model';

/**
 * Rich UI component for displaying a list of errors with filter and sort.
 *
 * Accepts both legacy `Errors` format (from API responses) and rich `ErrorItem[]`.
 * Provides text-based filtering, severity filtering, and multi-field sorting.
 */
@Component({
  selector: 'app-list-errors',
  templateUrl: './list-errors.component.html',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListErrorsComponent {
  /** Internal signal holding the parsed error items */
  errorItems = signal<ErrorItem[]>([]);

  /** Filter text input bound to the search field */
  filterText = signal<string>('');

  /** Active severity filter (null = show all) */
  filterSeverity = signal<ErrorSeverity | null>(null);

  /** Current sort field */
  sortField = signal<ErrorSortField>('timestamp');

  /** Current sort direction */
  sortDirection = signal<ErrorSortDirection>('desc');

  /**
   * Accepts legacy Errors object and converts to rich ErrorItem[].
   * Each key in errors.errors becomes an ErrorItem with 'error' severity.
   */
  @Input() set errors(errorObj: Errors | null) {
    if (!errorObj || !errorObj.errors) {
      this.errorItems.set([]);
      return;
    }
    // Convert legacy { field: "message" } format to ErrorItem[]
    const items: ErrorItem[] = Object.keys(errorObj.errors).map(key => ({
      field: key,
      message: Array.isArray(errorObj.errors[key])
        ? (errorObj.errors[key] as unknown as string[]).join(', ')
        : errorObj.errors[key],
      severity: 'error' as ErrorSeverity,
      timestamp: new Date(),
    }));
    this.errorItems.set(items);
  }

  /**
   * Accepts rich ErrorItem[] directly for full-featured error display.
   */
  @Input() set richErrors(items: ErrorItem[] | null) {
    this.errorItems.set(items ?? []);
  }

  /** Computed: filtered and sorted error list for display */
  displayErrors = computed(() => {
    let items = this.errorItems();

    // Apply text filter (searches field, message, and code)
    const text = this.filterText().toLowerCase().trim();
    if (text) {
      items = items.filter(
        item =>
          item.field.toLowerCase().includes(text) ||
          item.message.toLowerCase().includes(text) ||
          (item.code && item.code.toLowerCase().includes(text)),
      );
    }

    // Apply severity filter
    const severity = this.filterSeverity();
    if (severity) {
      items = items.filter(item => item.severity === severity);
    }

    // Apply sort
    const field = this.sortField();
    const direction = this.sortDirection();
    const multiplier = direction === 'asc' ? 1 : -1;

    items = [...items].sort((a, b) => {
      switch (field) {
        case 'timestamp':
          return multiplier * (a.timestamp.getTime() - b.timestamp.getTime());
        case 'severity':
          return multiplier * (this.severityWeight(a.severity) - this.severityWeight(b.severity));
        case 'field':
          return multiplier * a.field.localeCompare(b.field);
        default:
          return 0;
      }
    });

    return items;
  });

  /** Count of active filters for UI badge */
  activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterText().trim()) count++;
    if (this.filterSeverity()) count++;
    return count;
  });

  /** Updates the text filter value */
  onFilterTextChange(value: string): void {
    this.filterText.set(value);
  }

  /** Toggles severity filter (clicking same severity again clears it) */
  toggleSeverityFilter(severity: ErrorSeverity): void {
    this.filterSeverity.set(this.filterSeverity() === severity ? null : severity);
  }

  /** Clears all active filters */
  clearFilters(): void {
    this.filterText.set('');
    this.filterSeverity.set(null);
  }

  /** Updates sort field; toggles direction if same field is selected again */
  updateSort(field: ErrorSortField): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('desc');
    }
  }

  /** Returns numeric weight for severity ordering (higher = more severe) */
  private severityWeight(severity: ErrorSeverity): number {
    switch (severity) {
      case 'error':
        return 3;
      case 'warning':
        return 2;
      case 'info':
        return 1;
      default:
        return 0;
    }
  }
}
