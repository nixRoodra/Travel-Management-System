import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { ReimbursementStatus } from '../../shared/models/tms-enums.model';
import { FinanceReimbursementDto } from './finance-reimbursements.models';
import { FinanceReimbursementsPage } from './finance-reimbursements-page';
import { FinanceReimbursementsService } from './finance-reimbursements.service';

describe('FinanceReimbursementsPage', () => {
  const samplePending: FinanceReimbursementDto[] = [
    {
      reimbursementId: 4,
      expenseClaimId: 12,
      amount: 420.75,
      status: ReimbursementStatus.PendingPayment,
      createdAtUtc: '2026-11-24T12:00:00Z',
      employeeName: 'Jane Doe',
      employeeCode: 'EMP-102',
      destination: 'London',
      purpose: 'Client Workshop',
    },
  ];

  it('computes pending payout total and records payment with reference', async () => {
    const getPending = vi.fn().mockReturnValue(of(samplePending));
    const recordPayment = vi
      .fn()
      .mockReturnValue(of({ ...samplePending[0], status: ReimbursementStatus.Paid }));

    TestBed.configureTestingModule({
      imports: [FinanceReimbursementsPage],
      providers: [
        provideRouter([]),
        {
          provide: FinanceReimbursementsService,
          useValue: { getPending, recordPayment },
        },
        {
          provide: MatDialog,
          useValue: { open: () => ({ afterClosed: () => of('ACH-9001') }) },
        },
        {
          provide: NotificationService,
          useValue: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
        },
      ],
    });

    const fixture = TestBed.createComponent(FinanceReimbursementsPage);
    await fixture.whenStable();

    const comp = fixture.componentInstance as unknown as {
      totalPendingAmount: () => number;
      openRecordPaymentDialog: (item: FinanceReimbursementDto) => void;
    };

    expect(comp.totalPendingAmount()).toBe(420.75);
    comp.openRecordPaymentDialog(samplePending[0]);

    expect(recordPayment).toHaveBeenCalledWith(4, 'ACH-9001');
    expect(getPending).toHaveBeenCalledTimes(2);
  });
});
