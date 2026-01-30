import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { RecaptchaService } from '../../../../shared/services/recaptcha.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, TranslateModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private recaptchaService = inject(RecaptchaService);

  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  loginForm: FormGroup = this.fb.group({
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      try {
        const recaptchaToken = await this.recaptchaService.execute('login');

        const loginData = {
          ...this.loginForm.value,
          recaptchaToken
        };

        this.authService.login(loginData).subscribe({
          next: (response) => {
            this.isLoading.set(false);
            this.authService.saveAuthData(response.data.token, response.data.user);
            this.toast.successT('AUTH.MESSAGES.LOGIN_SUCCESS');
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.isLoading.set(false);
            this.errorMessage.set(err.error?.message || this.translate.instant('AUTH.MESSAGES.LOGIN_ERROR'));
            console.error('Login error', err);
          }
        });
      } catch (error) {
        this.isLoading.set(false);
        this.toast.error(this.translate.instant('AUTH.VALIDATION.RECAPTCHA_ERROR'));
        console.error('reCAPTCHA error', error);
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
