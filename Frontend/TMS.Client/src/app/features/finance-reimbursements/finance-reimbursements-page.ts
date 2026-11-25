import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatusChip } from '../../shared/components/status-chip/status-chip';
import { mapReimbursementStatus } from '../../shared/models/tms-enums.model';
import { extractApiErrorMessage } from '../../shared/utilities/http-error.util';
import { RecordPaymentDialog } from './components/record-payment-dialog/record-payment-dialog';
import { FinanceReimbursementDto } from './finance-reimbursements.models';
import { FinanceReimbursementsService } from './finance-reimbursements.service';

@Component({
  selector: 'app-finance-reimbursements-page',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatTableModule,
    PageHeader,
    StatusChip,
    EmptyState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './finance-reimbursements-page.html',
  styleUrl: './finance-reimbursements-page.scss',
})
export class FinanceReimbursementsPage implements OnInit {
  private readonly reimbursementsService = inject(FinanceReimbursementsService);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly paginator = viewChild(MatPaginator);

  protected readonly isLoading = signal(false);
  protected readonly payingId = signal<number | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly pending = signal<FinanceReimbursementDto[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly lookupId = signal('');
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);

  protected readonly toStatus = mapReimbursementStatus;

  protected readonly totalPendingAmount = computed(() =>
    this.pending().reduce((sum, item) => sum + item.amount, 0),
  );

  protected readonly filteredPending = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) {
      return this.pending();
    }
    return this.pending().filter(
      (item) =>
        item.employeeName.toLowerCase().includes(query) ||
        item.employeeCode.toLowerCase().includes(query) ||
        item.destination.toLowerCase().includes(query) ||
        item.purpose.toLowerCase().includes(query),
    );
  });

  protected readonly pagedPending = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredPending().slice(start, start + this.pageSize());
  });

  protected readonly displayedColumns = [
    'reimbursementId',
    'employee',
    'trip',
    'amount',
    'status',
    'createdAtUtc',
    'actions',
  ];

  ngOnInit(): void {
    this.loadPending();
  }

  protected loadPending(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.reimbursementsService
      .getPending()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.pending.set(data),
        error: (error: unknown) => {
          this.errorMessage.set(
            extractApiErrorMessage(error, 'Unable to load pending reimbursements.'),
          );
        },
      });
  }

  protected onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.pageIndex.set(0);
    this.paginator()?.firstPage();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected lookupById(): void {
    const parsed = Number(this.lookupId().trim());
    if (!Number.isInteger(parsed) || parsed <= 0) {
      this.notifications.error('Enter a valid positive reimbursement ID.');
      return;
    }
    void this.router.navigate(['/finance/reimbursements', parsed]);
  }

  protected openRecordPaymentDialog(item: FinanceReimbursementDto): void {
    const dialogRef = this.dialog.open(RecordPaymentDialog, {
      width: '440px',
      data: {
        reimbursementId: item.reimbursementId,
        employeeName: item.employeeName,
        destination: item.destination,
        amount: item.amount,
      },
    });

    dialogRef.afterClosed().subscribe((reference) => {
      if (reference === null || reference === undefined) {
        return;
      }
      this.recordPayment(item.reimbursementId, reference);
    });
  }

  private recordPayment(reimbursementId: number, paymentReference: string): void {
    this.payingId.set(reimbursementId);

    this.reimbursementsService
      .recordPayment(reimbursementId, paymentReference)
      .pipe(finalize(() => this.payingId.set(null)))
      .subscribe({
        next: () => {
          this.notifications.success(`Payment recorded for Reimbursement #${reimbursementId}.`);
          this.loadPending();
        },
        error: (error: unknown) => {
          this.notifications.error(
            extractApiErrorMessage(error, 'Failed to record reimbursement payment.'),
          );
        },
      });
  }
}
