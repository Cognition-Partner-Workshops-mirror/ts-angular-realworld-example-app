import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Errors } from '../../core/models/errors.model';

/** Represents a single error entry with field name and message for tabular display */
export interface ErrorEntry {
  field: string;
  message: string;
}

@Component({
  selector: 'app-list-errors',
  templateUrl: './list-errors.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListErrorsComponent {
  /** Parsed error entries displayed as rows in the error table */
  errorEntries: ErrorEntry[] = [];

  @Input() set errors(errorList: Errors | null) {
    // Parse the errors object into field/message pairs for tabular display
    this.errorEntries = errorList
      ? Object.keys(errorList.errors || {}).map(key => ({
          field: key,
          message: Array.isArray(errorList.errors[key])
            ? (errorList.errors[key] as unknown as string[]).join(', ')
            : String(errorList.errors[key]),
        }))
      : [];
  }
}
