import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatusChip } from '../../shared/components/status-chip/status-chip';
import {
  ReimbursementStatus,
  TravelRequestStatus,
  formatTravelMode,
  mapReimbursementStatus,
  mapTravelRequestStatus,
} from '../../shared/models/tms-enums.model';
import { extractApiErrorMessage } from '../../shared/utilities/http-error.util';
import { EmployeeReimbursementDto } from '../reimbursements/reimbursement.models';
import { ReimbursementService } from '../reimbursements/reimbursement.service';
import { TravelRequestDto } from '../travel-requests/travel-request.models';
import { TravelRequestService } from '../travel-requests/travel-request.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    PageHeader,
    StatusChip,
    EmptyState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly travelRequestService = inject(TravelRequestService);
  private readonly reimbursementService = inject(ReimbursementService);

  protected readonly user = this.authService.user;
  protected readonly role = this.authService.userRole;
  protected readonly isEmployeeWorkspace = computed(
    () => this.role() === 'Employee' || this.role() === 'Manager',
  );

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly travelRequests = signal<TravelRequestDto[]>([]);
  protected readonly reimbursements = signal<EmployeeReimbursementDto[]>([]);

  protected readonly draftCount = computed(
    () => this.travelRequests().filter((r) => r.status === TravelRequestStatus.Draft).length,
  );

  protected readonly pendingApprovalCount = computed(
    () =>
      this.travelRequests().filter(
        (r) =>
          r.status === TravelRequestStatus.PendingManagerApproval ||
          r.status === TravelRequestStatus.PendingFinanceApproval,
      ).length,
  );

  protected readonly approvedTripsCount = computed(
    () =>
      this.travelRequests().filter(
        (r) =>
          r.status === TravelRequestStatus.Approved ||
          r.status === TravelRequestStatus.Completed,
      ).length,
  );

  protected readonly pendingReimbursementAmount = computed(() =>
    this.reimbursements()
      .filter((r) => r.status === ReimbursementStatus.PendingPayment)
      .reduce((sum, r) => sum + r.amount, 0),
  );

  protected readonly recentRequests = computed(() => this.travelRequests().slice(0, 5));
  protected readonly recentReimbursements = computed(() => this.reimbursements().slice(0, 5));

  protected readonly requestColumns = ['destination', 'dates', 'mode', 'estimatedCost', 'status'];

  protected readonly formatMode = formatTravelMode;
  protected readonly toTravelStatus = mapTravelRequestStatus;
  protected readonly toReimbursementStatus = mapReimbursementStatus;

  ngOnInit(): void {
    if (this.isEmployeeWorkspace()) {
      this.loadDashboardData();
    }
  }

  protected loadDashboardData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      requests: this.travelRequestService.getMyRequests(),
      reimbursements: this.reimbursementService.getMyReimbursements(),
    }).subscribe({
      next: ({ requests, reimbursements }) => {
        this.travelRequests.set(requests);
        this.reimbursements.set(reimbursements);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load dashboard data.'));
        this.isLoading.set(false);
      },
    });
  }
}
