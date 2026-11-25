import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApprovalStatus, ApprovalType } from '../../shared/models/tms-enums.model';
import { ManagerApprovalsService } from './manager-approvals.service';

describe('ManagerApprovalsService', () => {
  let service: ManagerApprovalsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ManagerApprovalsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches pending and history manager approvals', () => {
    service.getPending().subscribe();
    const pendingReq = httpMock.expectOne('/api/manager/approvals/pending');
    expect(pendingReq.request.method).toBe('GET');
    pendingReq.flush([]);

    service.getHistory().subscribe();
    const historyReq = httpMock.expectOne('/api/manager/approvals/history');
    expect(historyReq.request.method).toBe('GET');
    historyReq.flush([]);
  });

  it('posts approve and reject decisions with trimmed comments', () => {
    service.approve(14, '  Looks good  ').subscribe();
    const approveReq = httpMock.expectOne('/api/manager/approvals/14/approve');
    expect(approveReq.request.method).toBe('POST');
    expect(approveReq.request.body).toEqual({ comments: 'Looks good' });
    approveReq.flush({
      id: 1,
      travelRequestId: 14,
      approvalType: ApprovalType.Manager,
      approvalStatus: ApprovalStatus.Approved,
    });

    service.reject(14, '  Over budget  ').subscribe();
    const rejectReq = httpMock.expectOne('/api/manager/approvals/14/reject');
    expect(rejectReq.request.method).toBe('POST');
    expect(rejectReq.request.body).toEqual({ comments: 'Over budget' });
    rejectReq.flush({
      id: 1,
      travelRequestId: 14,
      approvalType: ApprovalType.Manager,
      approvalStatus: ApprovalStatus.Rejected,
    });
  });
});
