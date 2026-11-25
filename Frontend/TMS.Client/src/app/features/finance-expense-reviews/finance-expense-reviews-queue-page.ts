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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatusChip } from '../../shared/components/status-chip/status-chip';
import { mapExpenseClaimStatus } from '../../shared/models/tms-enums.model';
import { extractApiErrorMessage } from '../../shared/utilities/http-error.util';
import { FinanceExpenseClaimQueueDto } from './finance-expense-reviews.models';
import { FinanceExpenseReviewsService } from './finance-expense-reviews.service';

@Component({
  selector: 'app-finance-expense-reviews-queue-page',
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
  templateUrl: './finance-expense-reviews-queue-page.html',
  styleUrl: './finance-expense-reviews-queue-page.scss',
})
export class FinanceExpenseReviewsQueuePage implements OnInit {
  private readonly reviewsService = inject(FinanceExpenseReviewsService);
  private readonly paginator = viewChild(MatPaginator);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly queue = signal<FinanceExpenseClaimQueueDto[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);

  protected readonly toClaimStatus = mapExpenseClaimStatus;

  protected readonly filteredQueue = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) {
      return this.queue();
    }
    return this.queue().filter(
      (item) =>
        item.employeeName.toLowerCase().includes(query) ||
        item.employeeCode.toLowerCase().includes(query) ||
        item.destination.toLowerCase().includes(query) ||
        item.purpose.toLowerCase().includes(query),
    );
  });

  protected readonly pagedQueue = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredQueue().slice(start, start + this.pageSize());
  });

  protected readonly displayedColumns = [
    'claimId',
    'employee',
    'trip',
    'dates',
    'items',
    'total',
    'submitted',
    'status',
    'actions',
  ];

  ngOnInit(): void {
    this.loadQueue();
  }

  protected loadQueue(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.reviewsService
      .getSubmittedQueue()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.queue.set(data),
        error: (error: unknown) => {
          this.errorMessage.set(
            extractApiErrorMessage(error, 'Unable to load submitted expense claims.'),
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
}
