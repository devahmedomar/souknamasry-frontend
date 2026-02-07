import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../features/auth/services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);
    const token = authService.token();

    if (token) {
        const cloned = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });

        return next(cloned).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401 && isPlatformBrowser(platformId)) {
                    console.error('Authentication failed - token expired or invalid');
                    authService.clearAuthData();
                    router.navigate(['/auth/login']);
                }
                return throwError(() => error);
            })
        );
    }

    return next(req);
};
