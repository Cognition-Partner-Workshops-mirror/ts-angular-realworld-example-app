import { ChangeDetectionStrategy, Component, computed, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Errors } from '../../core/models/errors.model';

@Component({
  selector: 'app-list-errors',
  templateUrl: './list-errors.component.html',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListErrorsComponent {
  /** Full list of flattened error strings from the API response */
  errorList = signal<string[]>([]);

  /** User-entered filter text for narrowing visible errors */
  filterText = signal('');

  /** Filtered errors: case-insensitive substring match against filterText */
  filteredErrors = computed(() => {
    const filter = this.filterText().toLowerCase();
    if (!filter) {
      return this.errorList();
    }
    return this.errorList().filter(err => err.toLowerCase().includes(filter));
  });

  /** Accept the Errors input and flatten it into the errorList signal.
   *  Values may be strings or string arrays (RealWorld API returns arrays),
   *  so each array entry becomes a separate list item. */
  @Input() set errors(errorList: Errors | null) {
    this.errorList.set(
      errorList
        ? Object.keys(errorList.errors || {}).flatMap(key => {
            const value = errorList.errors[key];
            const messages = Array.isArray(value) ? value : [value];
            return messages.map(msg => `${key} ${msg}`);
          })
        : [],
    );
    // Reset filter when a new set of errors arrives
    this.filterText.set('');
  }
}
