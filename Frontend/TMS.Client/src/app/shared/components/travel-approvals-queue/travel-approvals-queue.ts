import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import {
  TravelMode,
  formatFlightClass,
  formatTrainClass,
  formatTravelMode,
  mapApprovalStatus,
} from '../../models/tms-enums.model';
import { TravelApprovalItemDto } from '../../models/travel-approval.model';
import { EmptyState } from '../empty-state/empty-state';
import { StatusChip } from '../status-chip/status-chip';

@Component({
  selector: 'app-travel-approvals-queue',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatTableModule,
    MatTabsModule,
    StatusChip,
    EmptyState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './travel-approvals-queue.html',
  styleUrl: './travel-approvals-queue.scss',
})
export class TravelApprovalsQueue {
  readonly pending = input.required<readonly TravelApprovalItemDto[]>();
  readonly history = input.required<readonly TravelApprovalItemDto[]>();
  readonly isLoading = input<boolean>(false);
  readonly actingRequestId = input<number | null>(null);
  readonly errorMessage = input<string | null>(null);
  readonly emptyHistoryMessage = input<string>('Completed approval decisions will appear here.');

  readonly retry = output<void>();
  readonly approveClicked = output<TravelApprovalItemDto>();
  readonly rejectClicked = output<TravelApprovalItemDto>();

  protected readonly searchTerm = signal('');
  protected readonly toApprovalStatus = mapApprovalStatus;
  protected readonly formatMode = formatTravelMode;

  protected readonly filteredPending = computed(() =>
    this.filterItems(this.pending(), this.searchTerm()),
  );

  protected readonly filteredHistory = computed(() =>
    this.filterItems(this.history(), this.searchTerm()),
  );

  protected readonly pendingColumns = [
    'employee',
    'trip',
    'dates',
    'mode',
    'estimatedCost',
    'submitted',
    'actions',
  ];

  protected readonly historyColumns = [
    'employee',
    'trip',
    'dates',
    'estimatedCost',
    'decision',
    'actionDate',
    'comments',
  ];

  protected formatTravelClass(item: TravelApprovalItemDto): string {
    return item.travelRequest.travelMode === TravelMode.Flight
      ? formatFlightClass(item.travelRequest.flightClass)
      : formatTrainClass(item.travelRequest.trainClass);
  }

  private filterItems(
    items: readonly TravelApprovalItemDto[],
    rawQuery: string,
  ): TravelApprovalItemDto[] {
    const query = rawQuery.trim().toLowerCase();
    if (!query) {
      return [...items];
    }
    return items.filter(
      (item) =>
        item.employeeName.toLowerCase().includes(query) ||
        item.employeeCode.toLowerCase().includes(query) ||
        item.travelRequest.destination.toLowerCase().includes(query) ||
        item.travelRequest.purpose.toLowerCase().includes(query),
    );
  }
}
