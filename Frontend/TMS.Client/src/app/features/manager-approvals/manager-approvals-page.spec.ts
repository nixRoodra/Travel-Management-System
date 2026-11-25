import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import {
  ApprovalStatus,
  ApprovalType,
  FlightClass,
  TravelMode,
  TravelRequestStatus,
} from '../../shared/models/tms-enums.model';
import { TravelApprovalItemDto } from '../../shared/models/travel-approval.model';
import { ManagerApprovalsPage } from './manager-approvals-page';
import { ManagerApprovalsService } from './manager-approvals.service';

describe('ManagerApprovalsPage', () => {
  const sampleItem: TravelApprovalItemDto = {
    id: 1,
    travelRequestId: 14,
    approvalType: ApprovalType.Manager,
    approvalStatus: ApprovalStatus.Pending,
    comments: null,
    createdAtUtc: '2026-11-25T09:00:00Z',
    actionDateUtc: null,
    employeeName: 'Jane Doe',
    employeeCode: 'EMP-102',
    travelRequest: {
      id: 14,
      employeeId: 10,
      destination: 'London',
      purpose: 'Client Workshop',
      travelMode: TravelMode.Flight,
      flightClass: FlightClass.Economy,
      trainClass: null,
      departureDate: '2026-12-01',
      returnDate: '2026-12-04',
      estimatedCost: 1600,
      status: TravelRequestStatus.PendingManagerApproval,
      createdAtUtc: '2026-11-25T08:00:00Z',
      submittedAtUtc: '2026-11-25T09:00:00Z',
    },
  };

  function setup(approveObs = of({ ...sampleItem, approvalStatus: ApprovalStatus.Approved })) {
    const getPending = vi.fn().mockReturnValue(of([sampleItem]));
    const getHistory = vi.fn().mockReturnValue(of([]));
    const approve = vi.fn().mockReturnValue(approveObs);
    const notifySuccess = vi.fn();
    const notifyError = vi.fn();

    TestBed.configureTestingModule({
      imports: [ManagerApprovalsPage],
      providers: [
        provideRouter([]),
        {
          provide: ManagerApprovalsService,
          useValue: { getPending, getHistory, approve, reject: vi.fn() },
        },
        {
          provide: MatDialog,
          useValue: { open: () => ({ afterClosed: () => of('Approved for QBR') }) },
        },
        {
          provide: NotificationService,
          useValue: { success: notifySuccess, error: notifyError, info: vi.fn() },
        },
      ],
    });

    return {
      fixture: TestBed.createComponent(ManagerApprovalsPage),
      getPending,
      approve,
      notifySuccess,
      notifyError,
    };
  }

  it('loads pending queue and approves with dialog comments', async () => {
    const { fixture, approve, notifySuccess, getPending } = setup();
    await fixture.whenStable();

    const comp = fixture.componentInstance as unknown as {
      openApproveDialog: (item: TravelApprovalItemDto) => void;
    };
    comp.openApproveDialog(sampleItem);

    expect(approve).toHaveBeenCalledWith(14, 'Approved for QBR');
    expect(notifySuccess).toHaveBeenCalled();
    expect(getPending).toHaveBeenCalledTimes(2);
  });

  it('handles 409 Conflict by notifying and refreshing queue', async () => {
    const { fixture, notifyError, getPending } = setup(
      throwError(() => new HttpErrorResponse({ status: 409, statusText: 'Conflict' })),
    );
    await fixture.whenStable();

    const comp = fixture.componentInstance as unknown as {
      openApproveDialog: (item: TravelApprovalItemDto) => void;
    };
    comp.openApproveDialog(sampleItem);

    expect(notifyError).toHaveBeenCalledWith(
      'This approval was updated by another session. Refreshing queue.',
    );
    expect(getPending).toHaveBeenCalledTimes(2);
  });
});
