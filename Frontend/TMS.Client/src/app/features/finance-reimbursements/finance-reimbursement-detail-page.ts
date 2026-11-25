import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatusChip } from '../../shared/components/status-chip/status-chip';
import {
  ReimbursementStatus,
  mapReimbursementStatus,
} from '../../shared/models/tms-enums.model';
import { extractApiErrorMessage } from '../../shared/utilities/http-error.util';
import { RecordPaymentDialog } from './components/record-payment-dialog/record-payment-dialog';
import { ReimbursementDetailDto } from './finance-reimbursements.models';
import { FinanceReimbursementsService } from './finance-reimbursements.service';

@Component({
  selector: 'app-finance-reimbursement-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatDividerModule,
    MatProgressBarModule,
    PageHeader,
    StatusChip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      [title]="detail() ? 'Reimbursement #' + detail()!.reimbursementId : 'Reimbursement Details'"
      [subtitle]="detail() ? detail()!.employeeName + ' — ' + detail()!.destination : ''"
      [breadcrumbs]="[
        { label: 'Dashboard', route: '/dashboard' },
        { label: 'Reimbursements', route: '/finance/reimbursements' },
        { label: detail() ? '#' + detail()!.reimbursementId : 'Details' }
      ]"
    >
      <a mat-button routerLink="/finance/reimbursements">Back to Queue</a>
      @if (canRecordPayment()) {
        <button
          mat-flat-button
          color="primary"
          type="button"
          [disabled]="isPaying()"
          (click)="openRecordPaymentDialog()"
        >
          {{ isPaying() ? 'Recording...' : 'Record Payment' }}
        </button>
      }
    </app-page-header>

    @if (isLoading()) {
      <mat-progress-bar mode="indeterminate" aria-label="Loading reimbursement details" />
    }

    @if (errorMessage()) {
      <div class="error-panel tms-card" role="alert">
        <span>{{ errorMessage() }}</span>
        <button mat-stroked-button type="button" (click)="loadDetail()">Retry</button>
      </div>
    }

    @if (detail(); as reimb) {
      <section class="tms-card detail-card">
        <div class="detail-top">
          <div>
            <span class="kicker">Expense Claim #{{ reimb.expenseClaimId }}</span>
            <h2 class="amount-heading">
              {{ reimb.amount | currency: 'INR' : 'symbol' : '1.2-2' }}
            </h2>
          </div>
          <app-status-chip [status]="toStatus(reimb.status)" />
        </div>

        <mat-divider />

        <dl class="detail-grid">
          <div>
            <dt>Employee</dt>
            <dd>{{ reimb.employeeName }} ({{ reimb.employeeCode }})</dd>
          </div>
          <div>
            <dt>Trip</dt>
            <dd>{{ reimb.destination }} — {{ reimb.purpose }}</dd>
          </div>
          <div>
            <dt>Queued At</dt>
            <dd>{{ reimb.createdAtUtc | date: 'medium' }}</dd>
          </div>
          <div>
            <dt>Paid At</dt>
            <dd>{{ reimb.paidAtUtc ? (reimb.paidAtUtc | date: 'medium') : 'Pending payment' }}</dd>
          </div>
          <div>
            <dt>Paid By</dt>
            <dd>{{ reimb.paidByEmployeeName || '—' }}</dd>
          </div>
          <div>
            <dt>Payment Reference</dt>
            <dd>{{ reimb.paymentReference || '—' }}</dd>
          </div>
        </dl>
      </section>
    }
  `,
  styles: `
    .error-panel {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--tms-space-4);
      margin-bottom: var(--tms-space-4);
      background-color: var(--tms-status-rejected-bg);
      border-color: var(--tms-status-rejected-border);
      color: var(--tms-status-rejected-fg);
    }

    .detail-card {
      padding: var(--tms-space-6);
      max-width: 820px;
    }

    .detail-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--tms-space-4);
      padding-bottom: var(--tms-space-4);
    }

    .kicker {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--tms-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .amount-heading {
      margin: 4px 0 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--tms-text-primary);
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--tms-space-4);
      margin: var(--tms-space-5) 0 0;

      @media (max-width: 599.98px) {
        grid-template-columns: 1fr;
      }

      dt {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--tms-text-muted);
        margin-bottom: 2px;
      }

      dd {
        margin: 0;
        font-size: 0.9375rem;
        color: var(--tms-text-primary);
      }
    }
  `,
})
export class FinanceReimbursementDetailPage implements OnInit {
  private readonly reimbursementsService = inject(FinanceReimbursementsService);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);

  readonly id = input.required<string>();

  protected readonly isLoading = signal(false);
  protected readonly isPaying = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly detail = signal<ReimbursementDetailDto | null>(null);

  protected readonly toStatus = mapReimbursementStatus;
  protected readonly canRecordPayment = computed(
    () => this.detail()?.status === ReimbursementStatus.PendingPayment,
  );

  ngOnInit(): void {
    this.loadDetail();
  }

  protected loadDetail(): void {
    const reimbursementId = Number(this.id());
    if (!Number.isInteger(reimbursementId) || reimbursementId <= 0) {
      this.errorMessage.set('Invalid reimbursement identifier.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.reimbursementsService
      .getById(reimbursementId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.detail.set(data),
        error: (error: unknown) => {
          this.errorMessage.set(
            extractApiErrorMessage(error, 'Unable to load reimbursement details.'),
          );
        },
      });
  }

  protected openRecordPaymentDialog(): void {
    const current = this.detail();
    if (!current || !this.canRecordPayment()) return;

    const dialogRef = this.dialog.open(RecordPaymentDialog, {
      width: '440px',
      data: {
        reimbursementId: current.reimbursementId,
        employeeName: current.employeeName,
        destination: current.destination,
        amount: current.amount,
      },
    });

    dialogRef.afterClosed().subscribe((reference) => {
      if (reference === null || reference === undefined) return;
      this.isPaying.set(true);
      this.reimbursementsService
        .recordPayment(current.reimbursementId, reference)
        .pipe(finalize(() => this.isPaying.set(false)))
        .subscribe({
          next: () => {
            this.notifications.success('Payment recorded.');
            this.loadDetail();
          },
          error: (error: unknown) => {
            this.notifications.error(
              extractApiErrorMessage(error, 'Failed to record payment.'),
            );
          },
        });
    });
  }
}
