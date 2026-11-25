import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { finalize, forkJoin } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { ApprovalDecisionDialog } from '../../shared/components/approval-decision-dialog/approval-decision-dialog';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { TravelApprovalsQueue } from '../../shared/components/travel-approvals-queue/travel-approvals-queue';
import { TravelApprovalItemDto } from '../../shared/models/travel-approval.model';
import { extractApiErrorMessage } from '../../shared/utilities/http-error.util';
import { FinanceApprovalsService } from './finance-approvals.service';

@Component({
  selector: 'app-finance-approvals-page',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, PageHeader, TravelApprovalsQueue],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Finance Travel Approvals"
      subtitle="Perform final financial review on manager-approved travel requests."
      [breadcrumbs]="[{ label: 'Dashboard', route: '/dashboard' }, { label: 'Travel Approvals' }]"
    >
      <button mat-stroked-button type="button" [disabled]="isLoading()" (click)="loadApprovals()">
        <mat-icon>refresh</mat-icon>
        Refresh
      </button>
    </app-page-header>

    <app-travel-approvals-queue
      [pending]="pending()"
      [history]="history()"
      [isLoading]="isLoading()"
      [actingRequestId]="actingRequestId()"
      [errorMessage]="errorMessage()"
      emptyHistoryMessage="Completed finance travel decisions will appear here."
      (retry)="loadApprovals()"
      (approveClicked)="openApproveDialog($event)"
      (rejectClicked)="openRejectDialog($event)"
    />
  `,
})
export class FinanceApprovalsPage implements OnInit {
  private readonly approvalsService = inject(FinanceApprovalsService);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);

  protected readonly isLoading = signal(false);
  protected readonly actingRequestId = signal<number | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly pending = signal<TravelApprovalItemDto[]>([]);
  protected readonly history = signal<TravelApprovalItemDto[]>([]);

  ngOnInit(): void {
    this.loadApprovals();
  }

  protected loadApprovals(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      pending: this.approvalsService.getPending(),
      history: this.approvalsService.getHistory(),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ pending, history }) => {
          this.pending.set(pending);
          this.history.set(history);
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            extractApiErrorMessage(error, 'Unable to load finance approvals.'),
          );
        },
      });
  }

  protected openApproveDialog(item: TravelApprovalItemDto): void {
    const dialogRef = this.dialog.open(ApprovalDecisionDialog, {
      width: '440px',
      data: {
        title: 'Approve Travel Request (Finance)',
        subtitle: `${item.employeeName} (${item.employeeCode}) — ${item.travelRequest.destination} ($${item.travelRequest.estimatedCost.toFixed(2)})`,
        confirmLabel: 'Approve Travel',
        confirmColor: 'primary',
        commentsRequired: false,
        commentsLabel: 'Finance Comments (Optional)',
      },
    });

    dialogRef.afterClosed().subscribe((comments) => {
      if (comments === null || comments === undefined) {
        return;
      }
      this.submitDecision(item.travelRequestId, 'approve', comments);
    });
  }

  protected openRejectDialog(item: TravelApprovalItemDto): void {
    const dialogRef = this.dialog.open(ApprovalDecisionDialog, {
      width: '440px',
      data: {
        title: 'Reject Travel Request (Finance)',
        subtitle: `${item.employeeName} (${item.employeeCode}) — ${item.travelRequest.destination}`,
        confirmLabel: 'Reject Travel',
        confirmColor: 'warn',
        commentsRequired: true,
        commentsLabel: 'Rejection Reason',
        commentsPlaceholder: 'Explain why finance is rejecting this request...',
      },
    });

    dialogRef.afterClosed().subscribe((comments) => {
      if (!comments) {
        return;
      }
      this.submitDecision(item.travelRequestId, 'reject', comments);
    });
  }

  private submitDecision(
    travelRequestId: number,
    decision: 'approve' | 'reject',
    comments: string,
  ): void {
    this.actingRequestId.set(travelRequestId);

    const request$ =
      decision === 'approve'
        ? this.approvalsService.approve(travelRequestId, comments)
        : this.approvalsService.reject(travelRequestId, comments);

    request$.pipe(finalize(() => this.actingRequestId.set(null))).subscribe({
      next: () => {
        this.notifications.success(
          decision === 'approve'
            ? 'Travel request approved for employee travel.'
            : 'Travel request rejected by finance.',
        );
        this.loadApprovals();
      },
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 409) {
          this.notifications.error(
            'This approval was updated by another finance reviewer. Refreshing queue.',
          );
          this.loadApprovals();
          return;
        }
        this.notifications.error(
          extractApiErrorMessage(error, `Failed to ${decision} travel request.`),
        );
      },
    });
  }
}
