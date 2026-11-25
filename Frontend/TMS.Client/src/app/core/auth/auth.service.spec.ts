import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { LoginResponse } from './auth.models';
import { AuthService } from './auth.service';

function createMockLoginResponse(overrides: Partial<LoginResponse> = {}): LoginResponse {
  const futureAccess = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const futureRefresh = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  return {
    accessToken: 'access-token-1',
    refreshToken: 'refresh-token-1',
    accessTokenExpiresAtUtc: futureAccess,
    refreshTokenExpiresAtUtc: futureRefresh,
    userId: 10,
    employeeId: 101,
    fullName: 'Jane Doe',
    email: 'jane.doe@company.com',
    role: 'Employee',
    ...overrides,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('stores session and updates signals on login', () => {
    const mockResponse = createMockLoginResponse();
    let loggedInEmail = '';

    service.login({ email: 'jane.doe@company.com', password: 'secret' }).subscribe((user) => {
      loggedInEmail = user.email;
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(loggedInEmail).toBe('jane.doe@company.com');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.userRole()).toBe('Employee');
    expect(service.getAccessToken()).toBe('access-token-1');
  });

  it('deduplicates concurrent refreshToken calls into a single HTTP request', () => {
    // Seed initial session
    service.login({ email: 'jane.doe@company.com', password: 'secret' }).subscribe();
    httpMock.expectOne('/api/auth/login').flush(createMockLoginResponse());

    const results: string[] = [];
    service.refreshToken().subscribe((token) => results.push(token));
    service.refreshToken().subscribe((token) => results.push(token));

    const refreshReqs = httpMock.match('/api/auth/refresh');
    expect(refreshReqs.length).toBe(1);
    expect(refreshReqs[0].request.body).toEqual({ refreshToken: 'refresh-token-1' });

    refreshReqs[0].flush(
      createMockLoginResponse({
        accessToken: 'access-token-2',
        refreshToken: 'refresh-token-2',
      }),
    );

    expect(results).toEqual(['access-token-2', 'access-token-2']);
    expect(service.getRefreshToken()).toBe('refresh-token-2');
  });

  it('clears session and navigates to /login on logout', () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    service.login({ email: 'jane.doe@company.com', password: 'secret' }).subscribe();
    httpMock.expectOne('/api/auth/login').flush(createMockLoginResponse());

    let completed = false;
    service.logout().subscribe(() => {
      completed = true;
    });

    const req = httpMock.expectOne('/api/auth/logout');
    expect(req.request.body).toEqual({ refreshToken: 'refresh-token-1' });
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(completed).toBe(true);
    expect(service.isAuthenticated()).toBe(false);
    expect(service.getAccessToken()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });
});
