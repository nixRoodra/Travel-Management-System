import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { authGuard, guestGuard } from './auth.guard';
import { roleGuard } from './role.guard';

describe('Route Guards', () => {
  const mockState = { url: '/manager/approvals' } as RouterStateSnapshot;

  function configure(isAuthenticated: boolean, role: 'Employee' | 'Manager' | 'Finance' | 'Admin' = 'Employee') {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => isAuthenticated,
            userRole: () => (isAuthenticated ? role : null),
          },
        },
      ],
    });
  }

  it('authGuard redirects unauthenticated users to /login with returnUrl', () => {
    configure(false);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, mockState),
    );
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/login?returnUrl=%2Fmanager%2Fapprovals');
  });

  it('authGuard allows authenticated users', () => {
    configure(true, 'Employee');
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, mockState),
    );
    expect(result).toBe(true);
  });

  it('guestGuard redirects authenticated users to /dashboard', () => {
    configure(true, 'Employee');
    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, mockState),
    );
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/dashboard');
  });

  it('roleGuard redirects to /forbidden when role is not allowed', () => {
    configure(true, 'Employee');
    const route = { data: { roles: ['Finance'] } } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => roleGuard(route, mockState));
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/forbidden');
  });

  it('roleGuard allows access when role matches', () => {
    configure(true, 'Finance');
    const route = { data: { roles: ['Finance'] } } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => roleGuard(route, mockState));
    expect(result).toBe(true);
  });
});
