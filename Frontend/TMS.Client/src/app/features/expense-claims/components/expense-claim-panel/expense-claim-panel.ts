import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ReceiptViewerDialog } from '../../../../shared/components/receipt-viewer-dialog/receipt-viewer-dialog';
import { StatusChip } from '../../../../shared/components/status-chip/status-chip';
import {
  ExpenseClaimStatus,
  TravelRequestStatus,
  mapExpenseClaimStatus,
} from '../../../../shared/models/tms-enums.model';
import { formatInr } from '../../../../shared/utilities/currency.util';
import { triggerBlobDownload } from '../../../../shared/utilities/file-download.util';
import { extractApiErrorMessage } from '../../../../shared/utilities/http-error.util';
import {
  ExpenseClaimDto,
  ExpenseItemDto,
  ExpenseReceiptDto,
} from '../../expense-claim.models';
import { ExpenseClaimService } from '../../expense-claim.service';
import { ExpenseItemDialog } from '../expense-item-dialog/expense-item-dialog';

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

export interface DailyExpenseSummary {
  date: string;
  total: number;
  count: number;
}

@Component({
  selector: 'app-expense-claim-panel',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatTooltipModule,
    StatusChip,
    EmptyState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './expense-claim-panel.html',
  styleUrl: './expense-claim-panel.scss',
})
export class ExpenseClaimPanel {
  private readonly expenseClaimService = inject(ExpenseClaimService);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);

  readonly travelRequestId = input.required<number>();
  readonly tripStatus = input.required<TravelRequestStatus>();
  readonly departureDate = input<string | undefined>(undefined);
  readonly returnDate = input<string | undefined>(undefined);
  readonly claimChanged = output<ExpenseClaimDto | null>();

  protected readonly isLoading = signal(false);
  protected readonly isBusy = signal(false);
  protected readonly uploadingItemId = signal<number | null>(null);
  protected readonly deletingReceiptId = signal<number | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly claim = signal<ExpenseClaimDto | null>(null);

  protected readonly toClaimStatus = mapExpenseClaimStatus;

  protected readonly canCreateClaim = computed(
    () => this.tripStatus() === TravelRequestStatus.Approved && this.claim() === null,
  );

  protected readonly isEditable = computed(() => {
    const status = this.claim()?.status;
    return (
      status === ExpenseClaimStatus.Draft ||
      status === ExpenseClaimStatus.ResubmissionRequested
    );
  });

  protected readonly canSubmit = computed(
    () => this.isEditable() && (this.claim()?.expenseItems.length ?? 0) > 0,
  );

  protected readonly overallTotal = computed(() =>
    (this.claim()?.expenseItems ?? []).reduce((sum, item) => sum + item.amount, 0),
  );

  protected readonly dailySummaries = computed<DailyExpenseSummary[]>(() => {
    const grouped = new Map<string, { total: number; count: number }>();
    for (const item of this.claim()?.expenseItems ?? []) {
      const current = grouped.get(item.expenseDate) ?? { total: 0, count: 0 };
      grouped.set(item.expenseDate, {
        total: current.total + item.amount,
        count: current.count + 1,
      });
    }
    return Array.from(grouped.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, stats]) => ({ date, ...stats }));
  });

  protected readonly displayedColumns = [
    'expenseDate',
    'description',
    'amount',
    'receipts',
    'actions',
  ];

  constructor() {
    effect(() => {
      const tripId = this.travelRequestId();
      if (tripId > 0) {
        this.loadClaim(tripId);
      }
    });
  }

  protected loadClaim(tripId = this.travelRequestId()): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.expenseClaimService
      .getClaimForTripOptional(tripId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.claim.set(data);
          this.claimChanged.emit(data);
        },
        error: (error: unknown) => {
          this.claim.set(null);
          this.errorMessage.set(
            extractApiErrorMessage(error, 'Unable to load expense claim.'),
          );
        },
      });
  }

  protected createClaim(): void {
    this.isBusy.set(true);
    this.expenseClaimService
      .createClaim(this.travelRequestId())
      .pipe(finalize(() => this.isBusy.set(false)))
      .subscribe({
        next: (created) => {
          this.claim.set(created);
          this.claimChanged.emit(created);
          this.notifications.success('Draft expense claim created.');
        },
        error: (error: unknown) => {
          this.notifications.error(
            extractApiErrorMessage(error, 'Could not create expense claim.'),
          );
        },
      });
  }

  protected openAddItemDialog(): void {
    if (!this.isEditable()) {
      return;
    }

    const dialogRef = this.dialog.open(ExpenseItemDialog, {
      width: '440px',
      data: {
        mode: 'add',
        minDate: this.departureDate(),
        maxDate: this.returnDate(),
      },
    });

    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.isBusy.set(true);
      this.expenseClaimService
        .addItem(this.travelRequestId(), payload)
        .pipe(finalize(() => this.isBusy.set(false)))
        .subscribe({
          next: (item) => {
            this.applyAndRefreshClaim('Expense item added.', (current) => ({
              ...current,
              expenseItems: [...current.expenseItems, item],
            }));
          },
          error: (error: unknown) => {
            this.notifications.error(
              extractApiErrorMessage(error, 'Failed to add expense item.'),
            );
          },
        });
    });
  }

  protected openEditItemDialog(item: ExpenseItemDto): void {
    if (!this.isEditable()) {
      return;
    }

    const dialogRef = this.dialog.open(ExpenseItemDialog, {
      width: '440px',
      data: {
        mode: 'edit',
        item,
        minDate: this.departureDate(),
        maxDate: this.returnDate(),
      },
    });

    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) return;
      this.isBusy.set(true);
      this.expenseClaimService
        .updateItem(this.travelRequestId(), item.id, payload)
        .pipe(finalize(() => this.isBusy.set(false)))
        .subscribe({
          next: (updated) => {
            this.applyAndRefreshClaim('Expense item updated.', (current) => ({
              ...current,
              expenseItems: current.expenseItems.map((it) =>
                it.id === updated.id ? { ...updated, receipts: it.receipts } : it,
              ),
            }));
          },
          error: (error: unknown) => {
            this.notifications.error(
              extractApiErrorMessage(error, 'Failed to update expense item.'),
            );
          },
        });
    });
  }

  protected confirmDeleteItem(item: ExpenseItemDto): void {
    if (!this.isEditable()) {
      return;
    }

    const receiptCount = item.receipts.length;
    const receiptNote =
      receiptCount > 0
        ? `All ${receiptCount} associated receipt(s) will also be permanently deleted.`
        : 'All associated receipts will also be deleted.';

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Delete Expense Item',
        message: `Delete "${item.description}"? ${receiptNote}`,
        confirmLabel: 'Delete Item',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.isBusy.set(true);
      this.expenseClaimService
        .deleteItem(this.travelRequestId(), item.id)
        .pipe(finalize(() => this.isBusy.set(false)))
        .subscribe({
          next: () => {
            this.applyAndRefreshClaim('Expense item deleted.', (current) => ({
              ...current,
              expenseItems: current.expenseItems.filter((it) => it.id !== item.id),
            }));
          },
          error: (error: unknown) => {
            this.notifications.error(
              extractApiErrorMessage(error, 'Failed to delete expense item.'),
            );
          },
        });
    });
  }

  protected confirmDeleteReceipt(item: ExpenseItemDto, receipt: ExpenseReceiptDto): void {
    if (!this.isEditable()) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Delete Receipt',
        message: `Delete receipt "${receipt.fileName}" from "${item.description}"? The expense item and its other receipts will not be affected.`,
        confirmLabel: 'Delete Receipt',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.deletingReceiptId.set(receipt.id);
      this.expenseClaimService
        .deleteReceipt(this.travelRequestId(), item.id, receipt.id)
        .pipe(finalize(() => this.deletingReceiptId.set(null)))
        .subscribe({
          next: () => {
            this.applyAndRefreshClaim(`Deleted "${receipt.fileName}".`, (current) => ({
              ...current,
              expenseItems: current.expenseItems.map((it) =>
                it.id === item.id
                  ? { ...it, receipts: it.receipts.filter((r) => r.id !== receipt.id) }
                  : it,
              ),
            }));
          },
          error: (error: unknown) => {
            this.notifications.error(
              extractApiErrorMessage(error, 'Failed to delete receipt.'),
            );
          },
        });
    });
  }

  protected onReceiptFileSelected(item: ExpenseItemDto, event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    inputEl.value = '';
    if (!file || !this.isEditable()) {
      return;
    }

    const lowerName = file.name.toLowerCase();
    const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    if (!hasAllowedExt) {
      this.notifications.error('Only JPG, JPEG, PNG, and PDF files are allowed.');
      return;
    }

    if (file.size <= 0 || file.size > MAX_RECEIPT_BYTES) {
      this.notifications.error('Receipt file must be between 1 byte and 5 MB.');
      return;
    }

    this.uploadingItemId.set(item.id);
    this.expenseClaimService
      .uploadReceipt(this.travelRequestId(), item.id, file)
      .pipe(finalize(() => this.uploadingItemId.set(null)))
      .subscribe({
        next: (receipt) => {
          this.applyAndRefreshClaim(`Uploaded "${receipt.fileName}".`, (current) => ({
            ...current,
            expenseItems: current.expenseItems.map((it) =>
              it.id === item.id ? { ...it, receipts: [...it.receipts, receipt] } : it,
            ),
          }));
        },
        error: (error: unknown) => {
          this.notifications.error(
            extractApiErrorMessage(error, 'Failed to upload receipt.'),
          );
        },
      });
  }

  protected viewReceipt(item: ExpenseItemDto, receipt: ExpenseReceiptDto): void {
    this.expenseClaimService
      .downloadReceipt(this.travelRequestId(), item.id, receipt.id)
      .subscribe({
        next: (response) => {
          if (!response.body) {
            this.notifications.error('Receipt file was empty.');
            return;
          }
          this.dialog.open(ReceiptViewerDialog, {
            width: '90vw',
            maxWidth: '850px',
            data: {
              fileName: receipt.fileName,
              blob: response.body,
            },
          });
        },
        error: (error: unknown) => {
          this.notifications.error(
            extractApiErrorMessage(error, 'Failed to load receipt for viewing.'),
          );
        },
      });
  }

  protected downloadReceipt(item: ExpenseItemDto, receipt: ExpenseReceiptDto): void {
    this.expenseClaimService
      .downloadReceipt(this.travelRequestId(), item.id, receipt.id)
      .subscribe({
        next: (response) => {
          if (!response.body) {
            this.notifications.error('Receipt file was empty.');
            return;
          }
          triggerBlobDownload(
            response.body,
            receipt.fileName,
            response.headers.get('content-disposition'),
          );
        },
        error: (error: unknown) => {
          this.notifications.error(
            extractApiErrorMessage(error, 'Failed to download receipt.'),
          );
        },
      });
  }

  protected confirmSubmitClaim(): void {
    const current = this.claim();
    if (!current || !this.canSubmit()) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Submit Expense Claim',
        message: `Submit ${current.expenseItems.length} expense item(s) totaling ${formatInr(this.overallTotal())} for finance review?`,
        confirmLabel: 'Submit Claim',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.isBusy.set(true);
      this.expenseClaimService
        .submitClaim(this.travelRequestId())
        .pipe(finalize(() => this.isBusy.set(false)))
        .subscribe({
          next: (submitted) => {
            this.claim.set(submitted);
            this.claimChanged.emit(submitted);
            this.notifications.success('Expense claim submitted for finance review.');
          },
          error: (error: unknown) => {
            this.notifications.error(
              extractApiErrorMessage(error, 'Failed to submit expense claim.'),
            );
          },
        });
    });
  }

  private applyAndRefreshClaim(
    successMessage: string,
    updateFn: (current: ExpenseClaimDto) => ExpenseClaimDto,
  ): void {
    this.claim.update((current) => (current ? updateFn(current) : current));
    this.claimChanged.emit(this.claim());
    this.notifications.success(successMessage);
    this.refreshClaim();
  }

  private refreshClaim(): void {
    const tripId = this.travelRequestId();
    if (tripId <= 0) {
      return;
    }

    this.expenseClaimService.getClaimForTrip(tripId).subscribe({
      next: (fresh) => {
        this.claim.set(fresh);
        this.claimChanged.emit(fresh);
      },
      error: (error: unknown) => {
        this.notifications.error(
          extractApiErrorMessage(error, 'Failed to refresh expense claim.'),
        );
      },
    });
  }
}
