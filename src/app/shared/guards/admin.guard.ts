import { inject, PLATFORM_ID } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../features/auth/services/auth.service';

export const adminGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Skip guard during SSR - let browser handle it
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // AuthService loads from localStorage in its constructor, which is synchronous
  // By the time the guard runs, the data should be available
  const token = authService.token();
  const user = authService.currentUser();

  console.log('Admin Guard - Token:', !!token, 'User:', !!user, 'Role:', user?.role);

  // First check if user is authenticated
  if (!token || !user) {
    console.log('Admin Guard - No auth, redirecting to login');
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  // Then check if user has admin role
  if (user.role !== 'admin') {
    console.log('Admin Guard - Not admin, redirecting to home');
    return router.createUrlTree(['/']);
  }

  console.log('Admin Guard - Access granted');
  return true;
};
