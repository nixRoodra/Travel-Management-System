import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { ExpenseClaimStatus, TravelRequestStatus } from '../../../../shared/models/tms-enums.model';
import { ExpenseClaimDto } from '../../expense-claim.models';
import { ExpenseClaimService } from '../../expense-claim.service';
import { ExpenseClaimPanel } from './expense-claim-panel';

describe('ExpenseClaimPanel', () => {
  const sampleClaim: ExpenseClaimDto = {
    id: 21,
    travelRequestId: 5,
    status: ExpenseClaimStatus.Draft,
    createdAtUtc: '2026-11-25T10:00:00Z',
    submittedAtUtc: null,
    expenseItems: [
      {
        id: 1,
        expenseDate: '2026-12-01',
        description: 'Airport Taxi',
        amount: 45,
        receipts: [],
      },
      {
        id: 2,
        expenseDate: '2026-12-01',
        description: 'Hotel Night 1',
        amount: 180,
        receipts: [],
      },
      {
        id: 3,
        expenseDate: '2026-12-02',
        description: 'Dinner',
        amount: 55,
        receipts: [],
      },
    ],
  };

  function setup(claim: ExpenseClaimDto | null = sampleClaim) {
    const createClaimSpy = vi.fn().mockReturnValue(of({ ...sampleClaim, expenseItems: [] }));

    TestBed.configureTestingModule({
      imports: [ExpenseClaimPanel],
      providers: [
        {
          provide: ExpenseClaimService,
          useValue: {
            getClaimForTripOptional: () => of(claim),
            createClaim: createClaimSpy,
          },
        },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        {
          provide: NotificationService,
          useValue: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
        },
      ],
    });

    const fixture = TestBed.createComponent(ExpenseClaimPanel);
    fixture.componentRef.setInput('travelRequestId', 5);
    fixture.componentRef.setInput('tripStatus', TravelRequestStatus.Approved);
    return { fixture, createClaimSpy };
  }

  it('computes overall total and daily totals from expense items', async () => {
    const { fixture } = setup(sampleClaim);
    await fixture.whenStable();

    const comp = fixture.componentInstance as unknown as {
      overallTotal: () => number;
      dailySummaries: () => { date: string; total: number; count: number }[];
    };

    expect(comp.overallTotal()).toBe(280);
    expect(comp.dailySummaries()).toEqual([
      { date: '2026-12-01', total: 225, count: 2 },
      { date: '2026-12-02', total: 55, count: 1 },
    ]);
  });

  it('offers Start Expense Claim when no claim exists for an Approved trip', async () => {
    const { fixture, createClaimSpy } = setup(null);
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.textContent).toContain('Start Expense Claim');
    button.click();

    expect(createClaimSpy).toHaveBeenCalledWith(5);
  });
});
