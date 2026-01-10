import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../features/auth/services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Skip guard during SSR - let browser handle it
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = authService.token();
  const user = authService.currentUser();

  // First check if user is authenticated
  if (!token || !user) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  // Then check if user has admin role
  if (user.role !== 'admin') {
    // Redirect non-admin users (including customers) to home
    router.navigate(['/']);
    return false;
  }

  return true;
};
