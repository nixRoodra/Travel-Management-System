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
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatusChip } from '../../shared/components/status-chip/status-chip';
import {
  TravelMode,
  TravelRequestStatus,
  formatFlightClass,
  formatTrainClass,
  formatTravelMode,
  mapReimbursementStatus,
  mapTravelRequestStatus,
} from '../../shared/models/tms-enums.model';
import { extractApiErrorMessage } from '../../shared/utilities/http-error.util';
import { ExpenseClaimPanel } from '../expense-claims/components/expense-claim-panel/expense-claim-panel';
import { ExpenseClaimDto } from '../expense-claims/expense-claim.models';
import { EmployeeReimbursementDto } from '../reimbursements/reimbursement.models';
import { ReimbursementService } from '../reimbursements/reimbursement.service';
import { TravelRequestDto } from '../travel-requests/travel-request.models';
import { TravelRequestService } from '../travel-requests/travel-request.service';

@Component({
  selector: 'app-my-trips-page',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
    MatTabsModule,
    PageHeader,
    StatusChip,
    EmptyState,
    ExpenseClaimPanel,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-trips-page.html',
  styleUrl: './my-trips-page.scss',
})
export class MyTripsPage implements OnInit {
  private readonly travelRequestService = inject(TravelRequestService);
  private readonly reimbursementService = inject(ReimbursementService);

  readonly tripId = input<string | undefined>(undefined);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly trips = signal<TravelRequestDto[]>([]);
  protected readonly reimbursements = signal<EmployeeReimbursementDto[]>([]);
  protected readonly selectedTripId = signal<number | null>(null);
  protected readonly activeClaim = signal<ExpenseClaimDto | null>(null);

  protected readonly selectedTrip = computed(() => {
    const id = this.selectedTripId();
    return this.trips().find((t) => t.id === id) ?? null;
  });

  protected readonly selectedReimbursement = computed(() => {
    const claim = this.activeClaim();
    if (!claim) {
      return null;
    }
    return this.reimbursements().find((r) => r.expenseClaimId === claim.id) ?? null;
  });

  protected readonly toTravelStatus = mapTravelRequestStatus;
  protected readonly toReimbursementStatus = mapReimbursementStatus;
  protected readonly formatMode = formatTravelMode;

  ngOnInit(): void {
    this.loadTrips();
  }

  protected loadTrips(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      requests: this.travelRequestService.getMyRequests(),
      reimbursements: this.reimbursementService.getMyReimbursements(),
    }).subscribe({
      next: ({ requests, reimbursements }) => {
        const approvedTrips = requests.filter(
          (r) =>
            r.status === TravelRequestStatus.Approved ||
            r.status === TravelRequestStatus.Completed,
        );
        this.trips.set(approvedTrips);
        this.reimbursements.set(reimbursements);

        const requestedId = Number(this.tripId());
        const matched = approvedTrips.find((t) => t.id === requestedId);
        this.selectedTripId.set(matched?.id ?? approvedTrips[0]?.id ?? null);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load approved trips.'));
        this.isLoading.set(false);
      },
    });
  }

  protected selectTrip(trip: TravelRequestDto): void {
    if (this.selectedTripId() !== trip.id) {
      this.activeClaim.set(null);
      this.selectedTripId.set(trip.id);
    }
  }

  protected formatClass(trip: TravelRequestDto): string {
    return trip.travelMode === TravelMode.Flight
      ? formatFlightClass(trip.flightClass)
      : formatTrainClass(trip.trainClass);
  }
}
