import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ReimbursementStatus } from '../../shared/models/tms-enums.model';
import { EmployeeReimbursementDto } from './reimbursement.models';
import { ReimbursementService } from './reimbursement.service';

describe('ReimbursementService', () => {
  let service: ReimbursementService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReimbursementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches employee reimbursements', () => {
    const mockData: EmployeeReimbursementDto[] = [
      {
        reimbursementId: 1,
        expenseClaimId: 7,
        amount: 340.5,
        status: ReimbursementStatus.PendingPayment,
        createdAtUtc: '2026-11-25T10:00:00Z',
        paidAtUtc: null,
        paymentReference: null,
        destination: 'London',
        purpose: 'Client workshop',
      },
    ];

    let result: EmployeeReimbursementDto[] = [];
    service.getMyReimbursements().subscribe((res) => (result = res));

    const req = httpMock.expectOne('/api/reimbursements/my-reimbursements');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);

    expect(result).toEqual(mockData);
  });
});
