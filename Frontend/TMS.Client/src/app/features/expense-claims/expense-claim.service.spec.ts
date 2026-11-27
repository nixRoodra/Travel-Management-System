import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ExpenseClaimStatus } from '../../shared/models/tms-enums.model';
import { ExpenseClaimDto } from './expense-claim.models';
import { ExpenseClaimService } from './expense-claim.service';

describe('ExpenseClaimService', () => {
  let service: ExpenseClaimService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ExpenseClaimService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('returns null from getClaimForTripOptional when backend returns 404', () => {
    let result: ExpenseClaimDto | null | undefined;
    service.getClaimForTripOptional(12).subscribe((res) => (result = res));

    const req = httpMock.expectOne('/api/trips/12/expense-claim');
    expect(req.request.method).toBe('GET');
    req.flush(null, { status: 404, statusText: 'Not Found' });

    expect(result).toBeNull();
  });

  it('uploads receipt using FormData and downloads as blob', () => {
    const file = new File(['%PDF-1.4'], 'hotel.pdf', { type: 'application/pdf' });
    service.uploadReceipt(12, 3, file).subscribe();

    const uploadReq = httpMock.expectOne('/api/trips/12/expense-claim/items/3/receipts');
    expect(uploadReq.request.method).toBe('POST');
    expect(uploadReq.request.body instanceof FormData).toBe(true);
    uploadReq.flush({ id: 9, fileName: 'hotel.pdf', uploadedAtUtc: '2026-11-25T10:00:00Z' });

    service.downloadReceipt(12, 3, 9).subscribe();
    const downloadReq = httpMock.expectOne('/api/trips/12/expense-claim/items/3/receipts/9');
    expect(downloadReq.request.method).toBe('GET');
    expect(downloadReq.request.responseType).toBe('blob');
    downloadReq.flush(new Blob(['%PDF-1.4'], { type: 'application/pdf' }));
  });

  it('submits expense claim', () => {
    let status: ExpenseClaimStatus | undefined;
    service.submitClaim(12).subscribe((claim) => (status = claim.status));

    const req = httpMock.expectOne('/api/trips/12/expense-claim/submit');
    expect(req.request.method).toBe('POST');
    req.flush({
      id: 7,
      travelRequestId: 12,
      status: ExpenseClaimStatus.Submitted,
      createdAtUtc: '2026-11-25T10:00:00Z',
      submittedAtUtc: '2026-11-25T11:00:00Z',
      expenseItems: [],
    });

    expect(status).toBe(ExpenseClaimStatus.Submitted);
  });

  it('updates and deletes expense items and deletes individual receipts', () => {
    service
      .updateItem(12, 3, {
        expenseDate: '2026-12-01',
        description: 'Updated Taxi',
        amount: 650,
      })
      .subscribe();

    const updateReq = httpMock.expectOne('/api/trips/12/expense-claim/items/3');
    expect(updateReq.request.method).toBe('PUT');
    expect(updateReq.request.body).toEqual({
      expenseDate: '2026-12-01',
      description: 'Updated Taxi',
      amount: 650,
    });
    updateReq.flush({
      id: 3,
      expenseDate: '2026-12-01',
      description: 'Updated Taxi',
      amount: 650,
      receipts: [],
    });

    service.deleteItem(12, 3).subscribe();
    const deleteItemReq = httpMock.expectOne('/api/trips/12/expense-claim/items/3');
    expect(deleteItemReq.request.method).toBe('DELETE');
    deleteItemReq.flush(null, { status: 204, statusText: 'No Content' });

    service.deleteReceipt(12, 3, 9).subscribe();
    const deleteReceiptReq = httpMock.expectOne('/api/trips/12/expense-claim/items/3/receipts/9');
    expect(deleteReceiptReq.request.method).toBe('DELETE');
    deleteReceiptReq.flush(null, { status: 204, statusText: 'No Content' });
  });
});
