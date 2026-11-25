import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import {
  ApprovalStatus,
  ApprovalType,
  FlightClass,
  TravelMode,
  TravelRequestStatus,
} from '../../shared/models/tms-enums.model';
import { TravelApprovalItemDto } from '../../shared/models/travel-approval.model';
import { FinanceApprovalsPage } from './finance-approvals-page';
import { FinanceApprovalsService } from './finance-approvals.service';

describe('FinanceApprovalsPage', () => {
  const sampleItem: TravelApprovalItemDto = {
    id: 5,
    travelRequestId: 22,
    approvalType: ApprovalType.Finance,
    approvalStatus: ApprovalStatus.Pending,
    comments: null,
    createdAtUtc: '2026-11-25T10:00:00Z',
    actionDateUtc: null,
    employeeName: 'Robert Lee',
    employeeCode: 'EMP-205',
    travelRequest: {
      id: 22,
      employeeId: 12,
      destination: 'Singapore',
      purpose: 'APAC Summit',
      travelMode: TravelMode.Flight,
      flightClass: FlightClass.Economy,
      trainClass: null,
      departureDate: '2026-12-10',
      returnDate: '2026-12-14',
      estimatedCost: 2700,
      status: TravelRequestStatus.PendingFinanceApproval,
      createdAtUtc: '2026-11-25T08:00:00Z',
      submittedAtUtc: '2026-11-25T08:30:00Z',
    },
  };

  it('loads pending queue and rejects with required reason', async () => {
    const getPending = vi.fn().mockReturnValue(of([sampleItem]));
    const getHistory = vi.fn().mockReturnValue(of([]));
    const reject = vi
      .fn()
      .mockReturnValue(of({ ...sampleItem, approvalStatus: ApprovalStatus.Rejected }));

    TestBed.configureTestingModule({
      imports: [FinanceApprovalsPage],
      providers: [
        provideRouter([]),
        {
          provide: FinanceApprovalsService,
          useValue: { getPending, getHistory, approve: vi.fn(), reject },
        },
        {
          provide: MatDialog,
          useValue: { open: () => ({ afterClosed: () => of('Exceeds regional cap') }) },
        },
        {
          provide: NotificationService,
          useValue: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
        },
      ],
    });

    const fixture = TestBed.createComponent(FinanceApprovalsPage);
    await fixture.whenStable();

    const comp = fixture.componentInstance as unknown as {
      openRejectDialog: (item: TravelApprovalItemDto) => void;
    };
    comp.openRejectDialog(sampleItem);

    expect(reject).toHaveBeenCalledWith(22, 'Exceeds regional cap');
    expect(getPending).toHaveBeenCalledTimes(2);
  });
});
