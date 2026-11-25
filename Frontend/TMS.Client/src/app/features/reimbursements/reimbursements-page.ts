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
import { MatChipsModule } from '@angular/material/chips';
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
import {
  ReimbursementStatus,
  mapReimbursementStatus,
} from '../../shared/models/tms-enums.model';
import { extractApiErrorMessage } from '../../shared/utilities/http-error.util';
import { EmployeeReimbursementDto } from './reimbursement.models';
import { ReimbursementService } from './reimbursement.service';

type ReimbursementFilter = 'ALL' | ReimbursementStatus;

@Component({
  selector: 'app-reimbursements-page',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatChipsModule,
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
  templateUrl: './reimbursements-page.html',
  styleUrl: './reimbursements-page.scss',
})
export class ReimbursementsPage implements OnInit {
  private readonly reimbursementService = inject(ReimbursementService);
  private readonly paginator = viewChild(MatPaginator);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly reimbursements = signal<EmployeeReimbursementDto[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<ReimbursementFilter>('ALL');
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);

  protected readonly ReimbursementStatus = ReimbursementStatus;
  protected readonly toStatus = mapReimbursementStatus;

  protected readonly filterOptions: readonly { value: ReimbursementFilter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: ReimbursementStatus.PendingPayment, label: 'Pending Payment' },
    { value: ReimbursementStatus.Paid, label: 'Paid' },
  ];

  protected readonly totalPendingAmount = computed(() =>
    this.reimbursements()
      .filter((r) => r.status === ReimbursementStatus.PendingPayment)
      .reduce((sum, r) => sum + r.amount, 0),
  );

  protected readonly totalPaidAmount = computed(() =>
    this.reimbursements()
      .filter((r) => r.status === ReimbursementStatus.Paid)
      .reduce((sum, r) => sum + r.amount, 0),
  );

  protected readonly filteredReimbursements = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const filter = this.statusFilter();

    return this.reimbursements().filter((item) => {
      if (filter !== 'ALL' && item.status !== filter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        item.destination.toLowerCase().includes(query) ||
        item.purpose.toLowerCase().includes(query) ||
        (item.paymentReference ?? '').toLowerCase().includes(query)
      );
    });
  });

  protected readonly pagedReimbursements = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredReimbursements().slice(start, start + this.pageSize());
  });

  protected readonly displayedColumns = [
    'trip',
    'claimRef',
    'amount',
    'status',
    'createdAtUtc',
    'paidAtUtc',
    'paymentReference',
  ];

  ngOnInit(): void {
    this.loadReimbursements();
  }

  protected loadReimbursements(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.reimbursementService
      .getMyReimbursements()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.reimbursements.set(data),
        error: (error: unknown) => {
          this.errorMessage.set(
            extractApiErrorMessage(error, 'Unable to load reimbursements.'),
          );
        },
      });
  }

  protected onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.resetPage();
  }

  protected onFilterChange(filter: ReimbursementFilter): void {
    this.statusFilter.set(filter);
    this.resetPage();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  private resetPage(): void {
    this.pageIndex.set(0);
    this.paginator()?.firstPage();
  }
}
