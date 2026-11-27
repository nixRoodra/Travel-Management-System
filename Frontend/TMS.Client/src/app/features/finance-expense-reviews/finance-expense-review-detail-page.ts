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
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { ApprovalDecisionDialog } from '../../shared/components/approval-decision-dialog/approval-decision-dialog';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { ReceiptViewerDialog } from '../../shared/components/receipt-viewer-dialog/receipt-viewer-dialog';
import { StatusChip } from '../../shared/components/status-chip/status-chip';
import {
  ExpenseClaimStatus,
  mapExpenseClaimStatus,
  mapExpenseReviewDecision,
} from '../../shared/models/tms-enums.model';
import { formatInr } from '../../shared/utilities/currency.util';
import { triggerBlobDownload } from '../../shared/utilities/file-download.util';
import { extractApiErrorMessage } from '../../shared/utilities/http-error.util';
import {
  ExpenseClaimReviewHistoryDto,
  FinanceExpenseClaimDetailDto,
  FinanceExpenseItemDto,
  FinanceExpenseReceiptDto,
} from './finance-expense-reviews.models';
import { FinanceExpenseReviewsService } from './finance-expense-reviews.service';

@Component({
  selector: 'app-finance-expense-review-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatTooltipModule,
    PageHeader,
    StatusChip,
    EmptyState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './finance-expense-review-detail-page.html',
  styleUrl: './finance-expense-review-detail-page.scss',
})
export class FinanceExpenseReviewDetailPage implements OnInit {
  private readonly reviewsService = inject(FinanceExpenseReviewsService);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly isLoading = signal(false);
  protected readonly isSubmittingDecision = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly claim = signal<FinanceExpenseClaimDetailDto | null>(null);
  protected readonly reviewHistory = signal<ExpenseClaimReviewHistoryDto[]>([]);

  protected readonly toClaimStatus = mapExpenseClaimStatus;
  protected readonly toReviewDecisionStatus = mapExpenseReviewDecision;

  protected readonly canReview = computed(
    () => this.claim()?.status === ExpenseClaimStatus.Submitted,
  );

  protected readonly itemColumns = ['expenseDate', 'description', 'amount', 'receipts'];

  ngOnInit(): void {
    this.loadClaimData();
  }

  protected loadClaimData(): void {
    const claimId = Number(this.id());
    if (!Number.isInteger(claimId) || claimId <= 0) {
      this.errorMessage.set('Invalid expense claim ID.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      claim: this.reviewsService.getClaimDetail(claimId),
      history: this.reviewsService.getReviewHistory(claimId),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ claim, history }) => {
          this.claim.set(claim);
          this.reviewHistory.set(history);
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            extractApiErrorMessage(error, 'Unable to load expense claim details.'),
          );
        },
      });
  }

  protected openApproveDialog(): void {
    const current = this.claim();
    if (!current || !this.canReview()) return;

    const dialogRef = this.dialog.open(ApprovalDecisionDialog, {
      width: '440px',
      data: {
        title: 'Approve Expense Claim',
        subtitle: `Approve Claim #${current.expenseClaimId} for ${current.employeeName} totaling ${formatInr(current.totalClaimedAmount)}? This creates a reimbursement record.`,
        confirmLabel: 'Approve Claim',
        confirmColor: 'primary',
        commentsRequired: false,
        commentsLabel: 'Review Comments (Optional)',
      },
    });

    dialogRef.afterClosed().subscribe((comments) => {
      if (comments === null || comments === undefined) return;
      this.executeDecision('approve', comments);
    });
  }

  protected openResubmissionDialog(): void {
    const current = this.claim();
    if (!current || !this.canReview()) return;

    const dialogRef = this.dialog.open(ApprovalDecisionDialog, {
      width: '440px',
      data: {
        title: 'Request Resubmission',
        subtitle: `Send Claim #${current.expenseClaimId} back to ${current.employeeName} for corrections.`,
        confirmLabel: 'Request Resubmission',
        confirmColor: 'primary',
        commentsRequired: true,
        commentsLabel: 'Required Corrections',
        commentsPlaceholder: 'Specify missing receipts or items that need updates...',
      },
    });

    dialogRef.afterClosed().subscribe((comments) => {
      if (!comments) return;
      this.executeDecision('resubmission', comments);
    });
  }

  protected openRejectDialog(): void {
    const current = this.claim();
    if (!current || !this.canReview()) return;

    const dialogRef = this.dialog.open(ApprovalDecisionDialog, {
      width: '440px',
      data: {
        title: 'Reject Expense Claim',
        subtitle: `Reject Claim #${current.expenseClaimId} submitted by ${current.employeeName}.`,
        confirmLabel: 'Reject Claim',
        confirmColor: 'warn',
        commentsRequired: true,
        commentsLabel: 'Rejection Reason',
        commentsPlaceholder: 'Explain why this expense claim is rejected...',
      },
    });

    dialogRef.afterClosed().subscribe((comments) => {
      if (!comments) return;
      this.executeDecision('reject', comments);
    });
  }

  protected viewReceipt(item: FinanceExpenseItemDto, receipt: FinanceExpenseReceiptDto): void {
    const claimId = this.claim()?.expenseClaimId;
    if (!claimId) return;

    this.reviewsService.downloadReceipt(claimId, item.expenseItemId, receipt.receiptId).subscribe({
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

  protected downloadReceipt(item: FinanceExpenseItemDto, receipt: FinanceExpenseReceiptDto): void {
    const claimId = this.claim()?.expenseClaimId;
    if (!claimId) return;

    this.reviewsService.downloadReceipt(claimId, item.expenseItemId, receipt.receiptId).subscribe({
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
        this.notifications.error(extractApiErrorMessage(error, 'Failed to download receipt.'));
      },
    });
  }

  private executeDecision(
    action: 'approve' | 'reject' | 'resubmission',
    comments: string,
  ): void {
    const claimId = this.claim()?.expenseClaimId;
    if (!claimId) return;

    this.isSubmittingDecision.set(true);

    const request$ =
      action === 'approve'
        ? this.reviewsService.approve(claimId, comments)
        : action === 'reject'
          ? this.reviewsService.reject(claimId, comments)
          : this.reviewsService.requestResubmission(claimId, comments);

    request$.pipe(finalize(() => this.isSubmittingDecision.set(false))).subscribe({
      next: () => {
        const message =
          action === 'approve'
            ? 'Expense claim approved and reimbursement queued.'
            : action === 'reject'
              ? 'Expense claim rejected.'
              : 'Resubmission requested from employee.';
        this.notifications.success(message);
        void this.router.navigateByUrl('/finance/expense-reviews');
      },
      error: (error: unknown) => {
        this.notifications.error(
          extractApiErrorMessage(error, 'Failed to record review decision.'),
        );
      },
    });
  }
}
