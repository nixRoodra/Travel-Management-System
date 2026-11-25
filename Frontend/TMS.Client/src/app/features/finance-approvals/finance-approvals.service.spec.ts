import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FinanceApprovalsService } from './finance-approvals.service';

describe('FinanceApprovalsService', () => {
  let service: FinanceApprovalsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FinanceApprovalsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('calls pending, history, approve, and reject finance approval endpoints', () => {
    service.getPending().subscribe();
    expect(httpMock.expectOne('/api/finance/approvals/pending').request.method).toBe('GET');

    service.getHistory().subscribe();
    expect(httpMock.expectOne('/api/finance/approvals/history').request.method).toBe('GET');

    service.approve(8, 'Approved').subscribe();
    const approveReq = httpMock.expectOne('/api/finance/approvals/8/approve');
    expect(approveReq.request.method).toBe('POST');
    expect(approveReq.request.body).toEqual({ comments: 'Approved' });
    approveReq.flush({});

    service.reject(8, 'Exceeds cap').subscribe();
    const rejectReq = httpMock.expectOne('/api/finance/approvals/8/reject');
    expect(rejectReq.request.method).toBe('POST');
    expect(rejectReq.request.body).toEqual({ comments: 'Exceeds cap' });
    rejectReq.flush({});
  });
});
