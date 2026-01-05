import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  return password && confirmPassword && password.value !== confirmPassword.value
    ? { passwordMismatch: true }
    : null;
};

@Component({
  selector: 'app-register',
  imports: [RouterLink, TranslateModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);

  isLoading = signal<boolean>(false);

  registerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    agreeTerms: [false, [Validators.requiredTrue]]
  }, { validators: passwordMatchValidator });

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);

      const { firstName, lastName, email, password } = this.registerForm.value;
      const registrationData = {
        firstName,
        lastName,
        email,
        password,
        role: 'customer',
        isActive: true
      };

      this.authService.register(registrationData).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.toast.successT('AUTH.MESSAGES.REGISTER_SUCCESS');
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.isLoading.set(false);
          let detail = this.translate.instant('AUTH.MESSAGES.REGISTER_ERROR');

          if (err.error?.data) {
            const errorMessages = Object.values(err.error.data).flat();
            if (errorMessages.length > 0) {
              detail = errorMessages.join('. ');
            }
          } else if (err.error?.message) {
            detail = err.error.message;
          }

          this.toast.error(detail);
          console.error('Registration error', err);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
