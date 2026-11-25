import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

const RETRIED_WITH_REFRESH = new HttpContextToken<boolean>(() => false);

function isApiRequest(url: string): boolean {
  return url.startsWith(environment.apiBaseUrl);
}

function isAuthEndpoint(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout')
  );
}

function withBearerToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isApiRequest(req.url) || isAuthEndpoint(req.url)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  const accessToken = authService.getAccessToken();
  const hasValidAccessToken = !!accessToken && !authService.isAccessTokenExpired();

  const handle401 = (error: unknown) => {
    if (
      !(error instanceof HttpErrorResponse) ||
      error.status !== 401 ||
      req.context.get(RETRIED_WITH_REFRESH)
    ) {
      return throwError(() => error);
    }

    if (!authService.getRefreshToken()) {
      authService.clearSession();
      void router.navigateByUrl('/login');
      return throwError(() => error);
    }

    return authService.refreshToken().pipe(
      switchMap((newToken) => {
        const retried = withBearerToken(req, newToken).clone({
          context: req.context.set(RETRIED_WITH_REFRESH, true),
        });
        return next(retried);
      }),
      catchError((refreshErr) => {
        authService.clearSession();
        void router.navigateByUrl('/login');
        return throwError(() => refreshErr);
      }),
    );
  };

  if (hasValidAccessToken) {
    return next(withBearerToken(req, accessToken)).pipe(catchError(handle401));
  }

  if (authService.isAuthenticated()) {
    return authService.refreshToken().pipe(
      switchMap((newToken) => {
        const authed = withBearerToken(req, newToken).clone({
          context: req.context.set(RETRIED_WITH_REFRESH, true),
        });
        return next(authed);
      }),
      catchError((refreshErr) => {
        authService.clearSession();
        void router.navigateByUrl('/login');
        return throwError(() => refreshErr);
      }),
    );
  }

  return next(req).pipe(catchError(handle401));
};
