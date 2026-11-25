import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import {
  ExpenseClaimReviewDecision,
  ExpenseClaimStatus,
} from '../../shared/models/tms-enums.model';
import { FinanceExpenseReviewDetailPage } from './finance-expense-review-detail-page';
import { FinanceExpenseClaimDetailDto } from './finance-expense-reviews.models';
import { FinanceExpenseReviewsService } from './finance-expense-reviews.service';

describe('FinanceExpenseReviewDetailPage', () => {
  const sampleDetail: FinanceExpenseClaimDetailDto = {
    expenseClaimId: 7,
    status: ExpenseClaimStatus.Submitted,
    submittedAtUtc: '2026-11-25T10:00:00Z',
    employeeName: 'Jane Doe',
    employeeCode: 'EMP-102',
    destination: 'London',
    purpose: 'Client Workshop',
    departureDate: '2026-12-01',
    returnDate: '2026-12-04',
    totalClaimedAmount: 325,
    expenseItems: [
      {
        expenseItemId: 11,
        expenseDate: '2026-12-02',
        description: 'Hotel Night 1',
        amount: 325,
        receipts: [
          { receiptId: 101, fileName: 'hotel.pdf', uploadedAtUtc: '2026-11-25T09:50:00Z' },
        ],
      },
    ],
  };

  it('loads claim detail + review history and submits resubmission request', async () => {
    const getClaimDetail = vi.fn().mockReturnValue(of(sampleDetail));
    const getReviewHistory = vi.fn().mockReturnValue(
      of([
        {
          reviewId: 1,
          financeEmployeeName: 'Finance Reviewer',
          decision: ExpenseClaimReviewDecision.ResubmissionRequested,
          comments: 'Please attach itemized folio',
          reviewedAtUtc: '2026-11-24T15:00:00Z',
        },
      ]),
    );
    const requestResubmission = vi.fn().mockReturnValue(
      of({ ...sampleDetail, status: ExpenseClaimStatus.ResubmissionRequested }),
    );

    TestBed.configureTestingModule({
      imports: [FinanceExpenseReviewDetailPage],
      providers: [
        provideRouter([]),
        {
          provide: FinanceExpenseReviewsService,
          useValue: {
            getClaimDetail,
            getReviewHistory,
            approve: vi.fn(),
            reject: vi.fn(),
            requestResubmission,
            downloadReceipt: vi.fn(),
          },
        },
        {
          provide: MatDialog,
          useValue: { open: () => ({ afterClosed: () => of('Need itemized receipt') }) },
        },
        {
          provide: NotificationService,
          useValue: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
        },
      ],
    });

    const fixture = TestBed.createComponent(FinanceExpenseReviewDetailPage);
    fixture.componentRef.setInput('id', '7');
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Jane Doe');
    expect(text).toContain('hotel.pdf');
    expect(text).toContain('Please attach itemized folio');

    const comp = fixture.componentInstance as unknown as {
      openResubmissionDialog: () => void;
    };
    comp.openResubmissionDialog();

    expect(requestResubmission).toHaveBeenCalledWith(7, 'Need itemized receipt');
    expect(getClaimDetail).toHaveBeenCalledTimes(2);
  });
});
