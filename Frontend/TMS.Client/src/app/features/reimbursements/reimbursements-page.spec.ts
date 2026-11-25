import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ReimbursementStatus } from '../../shared/models/tms-enums.model';
import { EmployeeReimbursementDto } from './reimbursement.models';
import { ReimbursementService } from './reimbursement.service';
import { ReimbursementsPage } from './reimbursements-page';

describe('ReimbursementsPage', () => {
  const sampleData: EmployeeReimbursementDto[] = [
    {
      reimbursementId: 1,
      expenseClaimId: 10,
      amount: 120.5,
      status: ReimbursementStatus.PendingPayment,
      createdAtUtc: '2026-11-24T10:00:00Z',
      paidAtUtc: null,
      paymentReference: null,
      destination: 'London',
      purpose: 'Workshop',
    },
    {
      reimbursementId: 2,
      expenseClaimId: 11,
      amount: 340,
      status: ReimbursementStatus.Paid,
      createdAtUtc: '2026-11-20T10:00:00Z',
      paidAtUtc: '2026-11-22T14:30:00Z',
      paymentReference: 'ACH-9981',
      destination: 'Berlin',
      purpose: 'Summit',
    },
  ];

  it('computes pending and paid totals and filters by status', async () => {
    TestBed.configureTestingModule({
      imports: [ReimbursementsPage],
      providers: [
        provideRouter([]),
        {
          provide: ReimbursementService,
          useValue: { getMyReimbursements: () => of(sampleData) },
        },
      ],
    });

    const fixture = TestBed.createComponent(ReimbursementsPage);
    await fixture.whenStable();

    const comp = fixture.componentInstance as unknown as {
      totalPendingAmount: () => number;
      totalPaidAmount: () => number;
      onFilterChange: (f: 'ALL' | ReimbursementStatus) => void;
      filteredReimbursements: () => EmployeeReimbursementDto[];
    };

    expect(comp.totalPendingAmount()).toBe(120.5);
    expect(comp.totalPaidAmount()).toBe(340);

    comp.onFilterChange(ReimbursementStatus.Paid);
    expect(comp.filteredReimbursements().map((r) => r.reimbursementId)).toEqual([2]);
  });
});
