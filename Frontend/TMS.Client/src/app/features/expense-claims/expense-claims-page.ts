import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { TravelRequestStatus } from '../../shared/models/tms-enums.model';
import { extractApiErrorMessage } from '../../shared/utilities/http-error.util';
import { TravelRequestDto } from '../travel-requests/travel-request.models';
import { TravelRequestService } from '../travel-requests/travel-request.service';
import { ExpenseClaimPanel } from './components/expense-claim-panel/expense-claim-panel';

@Component({
  selector: 'app-expense-claims-page',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
    PageHeader,
    EmptyState,
    ExpenseClaimPanel,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Expense Claims"
      subtitle="Select an approved trip to log expenses, upload receipts, and submit claims."
      [breadcrumbs]="[{ label: 'Dashboard', route: '/dashboard' }, { label: 'Expense Claims' }]"
    >
      @if (selectedTrip(); as trip) {
        <a mat-stroked-button routerLink="/my-trips" [queryParams]="{ tripId: trip.id }">
          Open in My Trips
        </a>
      }
    </app-page-header>

    @if (isLoading()) {
      <mat-progress-bar mode="indeterminate" aria-label="Loading eligible trips" />
    }

    @if (errorMessage()) {
      <div class="error-panel tms-card" role="alert">
        <span>{{ errorMessage() }}</span>
        <button mat-stroked-button type="button" (click)="loadTrips()">Retry</button>
      </div>
    } @else if (!isLoading() && trips().length === 0) {
      <app-empty-state
        icon="receipt_long"
        title="No approved trips eligible for expense claims"
        message="Expense claims can be created once a travel request is approved by both manager and finance."
      >
        <a mat-flat-button color="primary" routerLink="/travel-requests">View Travel Requests</a>
      </app-empty-state>
    } @else if (trips().length > 0) {
      <section class="tms-card selector-bar">
        <mat-form-field appearance="outline" class="trip-select" subscriptSizing="dynamic">
          <mat-label>Select Trip</mat-label>
          <mat-select
            [value]="selectedTripId()"
            (selectionChange)="selectedTripId.set($event.value)"
          >
            @for (trip of trips(); track trip.id) {
              <mat-option [value]="trip.id">
                #{{ trip.id }} — {{ trip.destination }} ({{ trip.departureDate | date: 'mediumDate' }})
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
      </section>

      @if (selectedTrip(); as trip) {
        <section class="tms-card claim-panel-card">
          <app-expense-claim-panel
            [travelRequestId]="trip.id"
            [tripStatus]="trip.status"
            [departureDate]="trip.departureDate"
            [returnDate]="trip.returnDate"
          />
        </section>
      }
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

    .selector-bar {
      padding: var(--tms-space-4) var(--tms-space-5);
      margin-bottom: var(--tms-space-5);
    }

    .trip-select {
      width: 100%;
      max-width: 480px;
    }

    .claim-panel-card {
      padding: var(--tms-space-6);
    }
  `,
})
export class ExpenseClaimsPage implements OnInit {
  private readonly travelRequestService = inject(TravelRequestService);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly trips = signal<TravelRequestDto[]>([]);
  protected readonly selectedTripId = signal<number | null>(null);

  protected readonly selectedTrip = computed(
    () => this.trips().find((t) => t.id === this.selectedTripId()) ?? null,
  );

  ngOnInit(): void {
    this.loadTrips();
  }

  protected loadTrips(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.travelRequestService
      .getMyRequests()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (requests) => {
          const eligible = requests.filter(
            (r) =>
              r.status === TravelRequestStatus.Approved ||
              r.status === TravelRequestStatus.Completed,
          );
          this.trips.set(eligible);
          this.selectedTripId.set(eligible[0]?.id ?? null);
        },
        error: (error: unknown) => {
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load trips.'));
        },
      });
  }
}
