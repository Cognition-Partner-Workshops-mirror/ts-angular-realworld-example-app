import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ListErrorsComponent } from '../../shared/components/list-errors.component';
import { Errors } from '../../core/models/errors.model';
import { UserService } from '../../core/auth/services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/** Reactive form interface for the sign-up form fields */
interface SignupForm {
  username: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup.component.html',
  imports: [RouterLink, ListErrorsComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SignupComponent {
  errors = signal<Errors>({ errors: {} });
  isSubmitting = signal(false);
  /** Tracks whether passwords match for display in the template */
  passwordMismatch = signal(false);
  destroyRef = inject(DestroyRef);

  /** Sign-up form with username, email, password, and confirm password fields */
  signupForm = new FormGroup<SignupForm>({
    username: new FormControl('', {
      validators: [Validators.required, Validators.minLength(3)],
      nonNullable: true,
    }),
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(8)],
      nonNullable: true,
    }),
    confirmPassword: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
  ) {}

  /** Validates that password and confirmPassword fields match */
  checkPasswordMatch(): void {
    const password = this.signupForm.controls.password.value;
    const confirmPassword = this.signupForm.controls.confirmPassword.value;
    this.passwordMismatch.set(password !== confirmPassword && confirmPassword.length > 0);
  }

  /** Submits the sign-up form after validating passwords match */
  submitForm(): void {
    this.checkPasswordMatch();

    if (this.passwordMismatch()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errors.set({ errors: {} });

    const { username, email, password } = this.signupForm.getRawValue();

    this.userService
      .register({ username, email, password })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => void this.router.navigate(['/']),
        error: err => {
          this.errors.set(err);
          this.isSubmitting.set(false);
        },
      });
  }
}
