import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { RecaptchaService } from '../../../../shared/services/recaptcha.service';

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
  private recaptchaService = inject(RecaptchaService);

  isLoading = signal<boolean>(false);

  registerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    agreeTerms: [false, [Validators.requiredTrue]]
  }, { validators: passwordMatchValidator });

  async onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);

      try {
        const recaptchaToken = await this.recaptchaService.execute('register');

        const { firstName, lastName, phone, password } = this.registerForm.value;
        const registrationData = {
          phone,
          password,
          firstName,
          lastName,
          recaptchaToken
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
      } catch (error) {
        this.isLoading.set(false);
        this.toast.error(this.translate.instant('AUTH.VALIDATION.RECAPTCHA_ERROR'));
        console.error('reCAPTCHA error', error);
      }
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
