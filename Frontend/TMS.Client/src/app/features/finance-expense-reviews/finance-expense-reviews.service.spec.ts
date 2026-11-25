import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FinanceExpenseReviewsService } from './finance-expense-reviews.service';

describe('FinanceExpenseReviewsService', () => {
  let service: FinanceExpenseReviewsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FinanceExpenseReviewsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('calls queue, detail, history, decision, and receipt download endpoints', () => {
    service.getSubmittedQueue().subscribe();
    expect(httpMock.expectOne('/api/finance/expense-claims').request.method).toBe('GET');

    service.getClaimDetail(5).subscribe();
    expect(httpMock.expectOne('/api/finance/expense-claims/5').request.method).toBe('GET');

    service.getReviewHistory(5).subscribe();
    expect(httpMock.expectOne('/api/finance/expense-claims/5/review-history').request.method).toBe('GET');

    service.approve(5, null).subscribe();
    const approveReq = httpMock.expectOne('/api/finance/expense-claims/5/approve');
    expect(approveReq.request.body).toEqual({ comments: null });
    approveReq.flush({});

    service.reject(5, 'Missing receipt').subscribe();
    const rejectReq = httpMock.expectOne('/api/finance/expense-claims/5/reject');
    expect(rejectReq.request.body).toEqual({ comments: 'Missing receipt' });
    rejectReq.flush({});

    service.requestResubmission(5, 'Re-upload legible PDF').subscribe();
    const resubReq = httpMock.expectOne('/api/finance/expense-claims/5/request-resubmission');
    expect(resubReq.request.body).toEqual({ comments: 'Re-upload legible PDF' });
    resubReq.flush({});

    service.downloadReceipt(5, 9, 12).subscribe();
    const dlReq = httpMock.expectOne('/api/finance/expense-claims/5/items/9/receipts/12');
    expect(dlReq.request.responseType).toBe('blob');
    dlReq.flush(new Blob(['pdf']));
  });
});
