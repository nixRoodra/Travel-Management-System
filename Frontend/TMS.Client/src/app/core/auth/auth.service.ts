import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  finalize,
  map,
  of,
  shareReplay,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { isUserRole } from '../../shared/models/role.model';
import { AuthUser, LoginRequest, LoginResponse, RefreshTokenRequest } from './auth.models';

const SESSION_STORAGE_KEY = 'tms_auth_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly sessionSignal = signal<LoginResponse | null>(this.loadSessionFromStorage());
  private refreshInFlight$: Observable<string> | null = null;

  readonly user = computed<AuthUser | null>(() => {
    const session = this.sessionSignal();
    if (!session || !isUserRole(session.role)) {
      return null;
    }
    return {
      userId: session.userId,
      employeeId: session.employeeId,
      fullName: session.fullName,
      email: session.email,
      role: session.role,
    };
  });

  readonly userRole = computed(() => this.user()?.role ?? null);

  readonly isAuthenticated = computed(() => {
    const session = this.sessionSignal();
    if (!session || !this.user()) {
      return false;
    }
    return !this.isTimestampExpired(session.refreshTokenExpiresAtUtc, 0);
  });

  login(credentials: LoginRequest): Observable<AuthUser> {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => this.saveSession(response)),
        map((response) => this.toAuthUser(response)),
      );
  }

  refreshToken(): Observable<string> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const currentRefreshToken = this.getRefreshToken();
    if (!currentRefreshToken) {
      this.clearSession();
      return throwError(() => new Error('No refresh token available.'));
    }

    const payload: RefreshTokenRequest = { refreshToken: currentRefreshToken };

    this.refreshInFlight$ = this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/auth/refresh`, payload)
      .pipe(
        tap((response) => this.saveSession(response)),
        map((response) => response.accessToken),
        catchError((error) => {
          this.clearSession();
          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshInFlight$ = null;
        }),
        shareReplay(1),
      );

    return this.refreshInFlight$;
  }

  logout(redirectToLogin = true): Observable<void> {
    const refreshToken = this.getRefreshToken();
    this.clearSession();

    const revoke$ = refreshToken
      ? this.http
          .post<void>(`${environment.apiBaseUrl}/auth/logout`, {
            refreshToken,
          } satisfies RefreshTokenRequest)
          .pipe(catchError(() => of(void 0)))
      : of(void 0);

    return revoke$.pipe(
      tap(() => {
        if (redirectToLogin) {
          void this.router.navigateByUrl('/login');
        }
      }),
    );
  }

  getAccessToken(): string | null {
    return this.sessionSignal()?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return this.sessionSignal()?.refreshToken ?? null;
  }

  isAccessTokenExpired(skewSeconds = 15): boolean {
    const session = this.sessionSignal();
    if (!session) {
      return true;
    }
    return this.isTimestampExpired(session.accessTokenExpiresAtUtc, skewSeconds);
  }

  clearSession(): void {
    this.sessionSignal.set(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage access errors in restricted environments
    }
  }

  private saveSession(response: LoginResponse): void {
    if (!isUserRole(response.role)) {
      throw new Error(`Unsupported role received from server: ${response.role}`);
    }
    this.sessionSignal.set(response);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(response));
    } catch {
      // Ignore storage quota/access errors
    }
  }

  private loadSessionFromStorage(): LoginResponse | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as Partial<LoginResponse>;
      if (
        !parsed ||
        typeof parsed.accessToken !== 'string' ||
        typeof parsed.refreshToken !== 'string' ||
        typeof parsed.role !== 'string' ||
        !isUserRole(parsed.role) ||
        typeof parsed.refreshTokenExpiresAtUtc !== 'string' ||
        this.isTimestampExpired(parsed.refreshTokenExpiresAtUtc, 0)
      ) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }
      return parsed as LoginResponse;
    } catch {
      return null;
    }
  }

  private toAuthUser(response: LoginResponse): AuthUser {
    if (!isUserRole(response.role)) {
      throw new Error(`Unsupported role received from server: ${response.role}`);
    }
    return {
      userId: response.userId,
      employeeId: response.employeeId,
      fullName: response.fullName,
      email: response.email,
      role: response.role,
    };
  }

  private isTimestampExpired(isoUtc: string, skewSeconds: number): boolean {
    const expiresAtMs = Date.parse(isoUtc);
    if (Number.isNaN(expiresAtMs)) {
      return true;
    }
    return Date.now() >= expiresAtMs - skewSeconds * 1000;
  }
}
