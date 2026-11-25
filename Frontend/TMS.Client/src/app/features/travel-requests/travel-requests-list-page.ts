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
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatusChip } from '../../shared/components/status-chip/status-chip';
import {
  TravelMode,
  TravelRequestStatus,
  formatFlightClass,
  formatTrainClass,
  formatTravelMode,
  mapTravelRequestStatus,
} from '../../shared/models/tms-enums.model';
import { extractApiErrorMessage } from '../../shared/utilities/http-error.util';
import { TravelRequestDto } from './travel-request.models';
import { TravelRequestService } from './travel-request.service';

type StatusFilter = 'ALL' | TravelRequestStatus;

@Component({
  selector: 'app-travel-requests-list-page',
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
    MatTooltipModule,
    PageHeader,
    StatusChip,
    EmptyState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './travel-requests-list-page.html',
  styleUrl: './travel-requests-list-page.scss',
})
export class TravelRequestsListPage implements OnInit {
  private readonly travelRequestService = inject(TravelRequestService);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);

  private readonly paginator = viewChild(MatPaginator);

  protected readonly isLoading = signal(false);
  protected readonly submittingId = signal<number | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly requests = signal<TravelRequestDto[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<StatusFilter>('ALL');
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);

  protected readonly TravelRequestStatus = TravelRequestStatus;

  protected readonly filterOptions: readonly { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: TravelRequestStatus.Draft, label: 'Draft' },
    { value: TravelRequestStatus.PendingManagerApproval, label: 'Pending Manager' },
    { value: TravelRequestStatus.PendingFinanceApproval, label: 'Pending Finance' },
    { value: TravelRequestStatus.Approved, label: 'Approved' },
    { value: TravelRequestStatus.Rejected, label: 'Rejected' },
  ];

  protected readonly filteredRequests = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const filter = this.statusFilter();

    return this.requests().filter((req) => {
      if (filter !== 'ALL' && req.status !== filter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        req.destination.toLowerCase().includes(query) ||
        req.purpose.toLowerCase().includes(query)
      );
    });
  });

  protected readonly pagedRequests = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredRequests().slice(start, start + this.pageSize());
  });

  protected readonly displayedColumns = [
    'destination',
    'dates',
    'mode',
    'estimatedCost',
    'status',
    'actions',
  ];

  protected readonly toStatus = mapTravelRequestStatus;
  protected readonly formatMode = formatTravelMode;

  ngOnInit(): void {
    this.loadRequests();
  }

  protected loadRequests(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.travelRequestService.getMyRequests().subscribe({
      next: (data) => {
        this.requests.set(data);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load travel requests.'));
        this.isLoading.set(false);
      },
    });
  }

  protected onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.resetPage();
  }

  protected onFilterChange(filter: StatusFilter): void {
    this.statusFilter.set(filter);
    this.resetPage();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected formatTravelClass(req: TravelRequestDto): string {
    return req.travelMode === TravelMode.Flight
      ? formatFlightClass(req.flightClass)
      : formatTrainClass(req.trainClass);
  }

  protected confirmSubmit(req: TravelRequestDto): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Submit Travel Request',
        message: `Submit your request to ${req.destination} for manager approval? Once submitted, it can no longer be edited.`,
        confirmLabel: 'Submit for Approval',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.submitRequest(req.id);
      }
    });
  }

  private submitRequest(travelRequestId: number): void {
    this.submittingId.set(travelRequestId);

    this.travelRequestService.submit(travelRequestId).subscribe({
      next: (updated) => {
        this.requests.update((list) =>
          list.map((item) => (item.id === updated.id ? updated : item)),
        );
        this.submittingId.set(null);
        this.notifications.success('Travel request submitted for manager approval.');
      },
      error: (error: unknown) => {
        this.submittingId.set(null);
        this.notifications.error(
          extractApiErrorMessage(error, 'Failed to submit travel request.'),
        );
      },
    });
  }

  private resetPage(): void {
    this.pageIndex.set(0);
    this.paginator()?.firstPage();
  }
}
