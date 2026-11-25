import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { LoginResponse } from '../auth/auth.models';
import { AuthService } from '../auth/auth.service';
import { jwtInterceptor } from './jwt.interceptor';

function createSession(overrides: Partial<LoginResponse> = {}): LoginResponse {
  return {
    accessToken: 'valid-access-token',
    refreshToken: 'valid-refresh-token',
    accessTokenExpiresAtUtc: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    refreshTokenExpiresAtUtc: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 1,
    employeeId: 10,
    fullName: 'Test User',
    email: 'test@company.com',
    role: 'Employee',
    ...overrides,
  };
}

describe('jwtInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('attaches Bearer token to protected API requests', () => {
    authService.login({ email: 'test@company.com', password: 'pw' }).subscribe();
    httpMock.expectOne('/api/auth/login').flush(createSession());

    http.get('/api/travelrequests/my-requests').subscribe();

    const req = httpMock.expectOne('/api/travelrequests/my-requests');
    expect(req.request.headers.get('Authorization')).toBe('Bearer valid-access-token');
    req.flush([]);
  });

  it('does not attach Authorization header to /api/auth/login', () => {
    localStorage.setItem('tms_auth_session', JSON.stringify(createSession()));

    http.post('/api/auth/login', { email: 'a@b.com', password: 'pw' }).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush(createSession());
  });

  it('refreshes token on 401 and retries the original request once', () => {
    authService.login({ email: 'test@company.com', password: 'pw' }).subscribe();
    httpMock.expectOne('/api/auth/login').flush(createSession());

    let responseBody: unknown;
    http.get('/api/travelrequests/my-requests').subscribe((res) => {
      responseBody = res;
    });

    const initialReq = httpMock.expectOne('/api/travelrequests/my-requests');
    initialReq.flush({ detail: 'Expired' }, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne('/api/auth/refresh');
    refreshReq.flush(
      createSession({
        accessToken: 'refreshed-access-token',
        refreshToken: 'refreshed-refresh-token',
      }),
    );

    const retriedReq = httpMock.expectOne('/api/travelrequests/my-requests');
    expect(retriedReq.request.headers.get('Authorization')).toBe('Bearer refreshed-access-token');
    retriedReq.flush([{ id: 42 }]);

    expect(responseBody).toEqual([{ id: 42 }]);
  });

  it('clears session and redirects to /login when refresh fails', () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    authService.login({ email: 'test@company.com', password: 'pw' }).subscribe();
    httpMock.expectOne('/api/auth/login').flush(createSession());

    let errored = false;
    http.get('/api/travelrequests/my-requests').subscribe({
      error: () => {
        errored = true;
      },
    });

    httpMock
      .expectOne('/api/travelrequests/my-requests')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    httpMock
      .expectOne('/api/auth/refresh')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(errored).toBe(true);
    expect(authService.isAuthenticated()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });
});
