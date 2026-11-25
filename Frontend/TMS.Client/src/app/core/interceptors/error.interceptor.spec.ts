import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from '../services/notification.service';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let errorSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    errorSpy = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        {
          provide: NotificationService,
          useValue: { success: vi.fn(), error: errorSpy, info: vi.fn() },
        },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('notifies user on 403 Forbidden responses', () => {
    let caughtStatus = 0;
    http.get('/api/finance/approvals/pending').subscribe({
      error: (err) => {
        caughtStatus = err.status;
      },
    });

    httpMock
      .expectOne('/api/finance/approvals/pending')
      .flush(null, { status: 403, statusText: 'Forbidden' });

    expect(caughtStatus).toBe(403);
    expect(errorSpy).toHaveBeenCalledWith(
      'You do not have permission to perform this action.',
    );
  });
});
