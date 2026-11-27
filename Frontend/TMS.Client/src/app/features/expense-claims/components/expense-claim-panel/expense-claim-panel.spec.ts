import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { ExpenseClaimStatus, TravelRequestStatus } from '../../../../shared/models/tms-enums.model';
import { ExpenseClaimDto, ExpenseItemDto } from '../../expense-claim.models';
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
        receipts: [
          { id: 10, fileName: 'taxi-1.pdf', uploadedAtUtc: '2026-11-25T10:05:00Z' },
          { id: 11, fileName: 'taxi-2.png', uploadedAtUtc: '2026-11-25T10:06:00Z' },
        ],
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

  function setup(
    claim: ExpenseClaimDto | null = sampleClaim,
    dialogResult: unknown = undefined,
    refreshedClaim: ExpenseClaimDto | null = claim,
  ) {
    const createClaimSpy = vi.fn().mockReturnValue(of({ ...sampleClaim, expenseItems: [] }));
    const getClaimForTripSpy = vi.fn().mockReturnValue(of(refreshedClaim));
    const updateItemSpy = vi.fn().mockImplementation((_tripId, itemId, payload) =>
      of({ id: itemId, ...payload, receipts: [] } as ExpenseItemDto),
    );
    const deleteItemSpy = vi.fn().mockReturnValue(of(void 0));
    const deleteReceiptSpy = vi.fn().mockReturnValue(of(void 0));
    const dialogOpenSpy = vi.fn().mockReturnValue({ afterClosed: () => of(dialogResult) });

    TestBed.configureTestingModule({
      imports: [ExpenseClaimPanel],
      providers: [
        {
          provide: ExpenseClaimService,
          useValue: {
            getClaimForTrip: getClaimForTripSpy,
            getClaimForTripOptional: () => of(claim),
            createClaim: createClaimSpy,
            updateItem: updateItemSpy,
            deleteItem: deleteItemSpy,
            deleteReceipt: deleteReceiptSpy,
          },
        },
        { provide: MatDialog, useValue: { open: dialogOpenSpy } },
        {
          provide: NotificationService,
          useValue: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
        },
      ],
    });

    const fixture = TestBed.createComponent(ExpenseClaimPanel);
    fixture.componentRef.setInput('travelRequestId', 5);
    fixture.componentRef.setInput('tripStatus', TravelRequestStatus.Approved);
    return {
      fixture,
      createClaimSpy,
      getClaimForTripSpy,
      updateItemSpy,
      deleteItemSpy,
      deleteReceiptSpy,
      dialogOpenSpy,
    };
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

  it('edits an expense item and refreshes claim data', async () => {
    const updatedClaim: ExpenseClaimDto = {
      ...sampleClaim,
      expenseItems: sampleClaim.expenseItems.map((it) =>
        it.id === 1 ? { ...it, description: 'Cab to Airport', amount: 120 } : it,
      ),
    };
    const { fixture, updateItemSpy, getClaimForTripSpy, dialogOpenSpy } = setup(
      sampleClaim,
      { expenseDate: '2026-12-01', description: 'Cab to Airport', amount: 120 },
      updatedClaim,
    );
    await fixture.whenStable();

    const editBtn = fixture.nativeElement.querySelector(
      'button[aria-label="Edit expense item"]',
    ) as HTMLButtonElement;
    editBtn.click();

    expect(dialogOpenSpy).toHaveBeenCalled();
    expect(updateItemSpy).toHaveBeenCalledWith(5, 1, {
      expenseDate: '2026-12-01',
      description: 'Cab to Airport',
      amount: 120,
    });
    expect(getClaimForTripSpy).toHaveBeenCalledWith(5);
  });

  it('confirms deletion of an expense item with associated receipts warning and refreshes claim', async () => {
    const afterDeleteClaim: ExpenseClaimDto = {
      ...sampleClaim,
      expenseItems: sampleClaim.expenseItems.filter((it) => it.id !== 1),
    };
    const { fixture, deleteItemSpy, getClaimForTripSpy, dialogOpenSpy } = setup(
      sampleClaim,
      true,
      afterDeleteClaim,
    );
    await fixture.whenStable();

    const deleteBtn = fixture.nativeElement.querySelector(
      'button[aria-label="Delete expense item"]',
    ) as HTMLButtonElement;
    deleteBtn.click();

    const dialogConfig = dialogOpenSpy.mock.calls[0][1] as {
      data: { message: string };
    };
    expect(dialogConfig.data.message).toContain('2 associated receipt(s) will also be');
    expect(deleteItemSpy).toHaveBeenCalledWith(5, 1);
    expect(getClaimForTripSpy).toHaveBeenCalledWith(5);
  });

  it('deletes an individual receipt without removing the parent item or sibling receipts', async () => {
    const afterReceiptDeleteClaim: ExpenseClaimDto = {
      ...sampleClaim,
      expenseItems: sampleClaim.expenseItems.map((it) =>
        it.id === 1
          ? { ...it, receipts: it.receipts.filter((r) => r.id !== 10) }
          : it,
      ),
    };
    const { fixture, deleteReceiptSpy, getClaimForTripSpy } = setup(
      sampleClaim,
      true,
      afterReceiptDeleteClaim,
    );
    await fixture.whenStable();

    const deleteReceiptBtn = fixture.nativeElement.querySelector(
      'button[aria-label="Delete receipt taxi-1.pdf"]',
    ) as HTMLButtonElement;
    expect(deleteReceiptBtn).not.toBeNull();
    deleteReceiptBtn.click();
    await fixture.whenStable();

    expect(deleteReceiptSpy).toHaveBeenCalledWith(5, 1, 10);
    expect(getClaimForTripSpy).toHaveBeenCalledWith(5);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Airport Taxi');
    expect(text).toContain('taxi-2.png');
    expect(text).not.toContain('taxi-1.pdf');
  });

  it('hides edit, delete, and upload actions when claim is Submitted', async () => {
    const submittedClaim: ExpenseClaimDto = {
      ...sampleClaim,
      status: ExpenseClaimStatus.Submitted,
    };
    const { fixture } = setup(submittedClaim);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('button[aria-label="Edit expense item"]')).toBeNull();
    expect(el.querySelector('button[aria-label="Delete expense item"]')).toBeNull();
    expect(el.querySelector('button[aria-label="Delete receipt taxi-1.pdf"]')).toBeNull();
    expect(el.querySelector('input[type="file"]')).toBeNull();
    expect(el.querySelector('button[aria-label="View receipt"]')).not.toBeNull();
  });
});
