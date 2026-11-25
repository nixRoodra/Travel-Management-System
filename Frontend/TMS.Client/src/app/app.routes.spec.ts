import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { UserRole } from './shared/models/role.model';

describe('App Routing & Role Access', () => {
  let isAuthenticated = false;
  let currentRole: UserRole | null = null;
  let router: Router;

  beforeEach(() => {
    isAuthenticated = false;
    currentRole = null;

    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNativeDateAdapter(),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => isAuthenticated,
            userRole: () => currentRole,
            user: () =>
              isAuthenticated && currentRole
                ? {
                    userId: 1,
                    employeeId: 10,
                    fullName: 'Test User',
                    email: 'test@company.com',
                    role: currentRole,
                  }
                : null,
          },
        },
      ],
    });

    router = TestBed.inject(Router);
  });

  it('redirects unauthenticated users from / to /login', async () => {
    await router.navigateByUrl('/');
    expect(router.url).toBe('/login');
  });

  it('redirects unauthenticated users from protected route to /login with returnUrl', async () => {
    await router.navigateByUrl('/travel-requests');
    expect(router.url).toBe('/login?returnUrl=%2Ftravel-requests');
  });

  it('allows Employee on /travel-requests and blocks /finance/approvals and /admin/employees', async () => {
    isAuthenticated = true;
    currentRole = 'Employee';

    await router.navigateByUrl('/travel-requests');
    expect(router.url).toBe('/travel-requests');

    await router.navigateByUrl('/finance/approvals');
    expect(router.url).toBe('/forbidden');

    await router.navigateByUrl('/admin/employees');
    expect(router.url).toBe('/forbidden');
  });

  it('allows Manager on both /my-trips and /manager/approvals, blocks /finance/expense-reviews', async () => {
    isAuthenticated = true;
    currentRole = 'Manager';

    await router.navigateByUrl('/my-trips');
    expect(router.url).toBe('/my-trips');

    await router.navigateByUrl('/manager/approvals');
    expect(router.url).toBe('/manager/approvals');

    await router.navigateByUrl('/finance/expense-reviews');
    expect(router.url).toBe('/forbidden');
  });

  it('allows Finance on /finance/reimbursements and blocks /travel-requests', async () => {
    isAuthenticated = true;
    currentRole = 'Finance';

    await router.navigateByUrl('/finance/reimbursements');
    expect(router.url).toBe('/finance/reimbursements');

    await router.navigateByUrl('/travel-requests');
    expect(router.url).toBe('/forbidden');
  });

  it('allows Admin on /admin/employees and blocks /manager/approvals', async () => {
    isAuthenticated = true;
    currentRole = 'Admin';

    await router.navigateByUrl('/admin/employees');
    expect(router.url).toBe('/admin/employees');

    await router.navigateByUrl('/manager/approvals');
    expect(router.url).toBe('/forbidden');
  });
});
