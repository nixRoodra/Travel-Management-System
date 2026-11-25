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
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
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

@Component({
  selector: 'app-travel-request-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
    PageHeader,
    StatusChip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './travel-request-detail-page.html',
  styleUrl: './travel-request-detail-page.scss',
})
export class TravelRequestDetailPage implements OnInit {
  private readonly travelRequestService = inject(TravelRequestService);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);

  readonly id = input.required<string>();

  protected readonly isLoading = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly request = signal<TravelRequestDto | null>(null);

  protected readonly TravelRequestStatus = TravelRequestStatus;
  protected readonly formatMode = formatTravelMode;
  protected readonly toStatus = mapTravelRequestStatus;

  protected readonly travelClassLabel = computed(() => {
    const req = this.request();
    if (!req) return '—';
    return req.travelMode === TravelMode.Flight
      ? formatFlightClass(req.flightClass)
      : formatTrainClass(req.trainClass);
  });

  ngOnInit(): void {
    this.loadDetail();
  }

  protected loadDetail(): void {
    const travelRequestId = Number(this.id());
    if (!Number.isInteger(travelRequestId) || travelRequestId <= 0) {
      this.errorMessage.set('Invalid travel request identifier.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.travelRequestService
      .getById(travelRequestId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.request.set(data),
        error: (error: unknown) => {
          this.errorMessage.set(
            extractApiErrorMessage(error, 'Unable to load travel request details.'),
          );
        },
      });
  }

  protected confirmSubmit(): void {
    const req = this.request();
    if (!req || req.status !== TravelRequestStatus.Draft) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Submit Travel Request',
        message: `Submit your travel request to ${req.destination} for manager approval? Once submitted, draft editing is locked.`,
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
    this.isSubmitting.set(true);
    this.travelRequestService
      .submit(travelRequestId)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (updated) => {
          this.request.set(updated);
          this.notifications.success('Travel request submitted for manager approval.');
        },
        error: (error: unknown) => {
          this.notifications.error(
            extractApiErrorMessage(error, 'Failed to submit travel request.'),
          );
        },
      });
  }
}
