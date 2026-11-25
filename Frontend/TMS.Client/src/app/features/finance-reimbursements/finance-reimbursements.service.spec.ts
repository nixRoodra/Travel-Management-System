import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FinanceReimbursementsService } from './finance-reimbursements.service';

describe('FinanceReimbursementsService', () => {
  let service: FinanceReimbursementsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FinanceReimbursementsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('calls pending, detail, and record-payment endpoints', () => {
    service.getPending().subscribe();
    expect(httpMock.expectOne('/api/finance/reimbursements/pending').request.method).toBe('GET');

    service.getById(3).subscribe();
    expect(httpMock.expectOne('/api/finance/reimbursements/3').request.method).toBe('GET');

    service.recordPayment(3, '  WIRE-2026-01  ').subscribe();
    const payReq = httpMock.expectOne('/api/finance/reimbursements/3/record-payment');
    expect(payReq.request.method).toBe('POST');
    expect(payReq.request.body).toEqual({ paymentReference: 'WIRE-2026-01' });
    payReq.flush({});
  });
});
