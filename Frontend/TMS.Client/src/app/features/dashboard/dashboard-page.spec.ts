import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { UserRole } from '../../shared/models/role.model';
import {
  FlightClass,
  ReimbursementStatus,
  TravelMode,
  TravelRequestStatus,
} from '../../shared/models/tms-enums.model';
import { ReimbursementService } from '../reimbursements/reimbursement.service';
import { TravelRequestService } from '../travel-requests/travel-request.service';
import { DashboardPage } from './dashboard-page';

describe('DashboardPage', () => {
  function setup(role: UserRole = 'Employee') {
    const getMyRequests = vi.fn().mockReturnValue(
      of([
        {
          id: 1,
          employeeId: 10,
          destination: 'Tokyo',
          purpose: 'Partner sync',
          travelMode: TravelMode.Flight,
          flightClass: FlightClass.Economy,
          trainClass: null,
          departureDate: '2026-12-01',
          returnDate: '2026-12-06',
          estimatedCost: 2400,
          status: TravelRequestStatus.Approved,
          createdAtUtc: '2026-11-25T10:00:00Z',
          submittedAtUtc: '2026-11-25T10:05:00Z',
        },
        {
          id: 2,
          employeeId: 10,
          destination: 'Paris',
          purpose: 'Summit',
          travelMode: TravelMode.Train,
          flightClass: null,
          trainClass: 2,
          departureDate: '2026-12-15',
          returnDate: '2026-12-17',
          estimatedCost: 600,
          status: TravelRequestStatus.Draft,
          createdAtUtc: '2026-11-25T11:00:00Z',
          submittedAtUtc: null,
        },
      ]),
    );

    const getMyReimbursements = vi.fn().mockReturnValue(
      of([
        {
          reimbursementId: 5,
          expenseClaimId: 9,
          amount: 185,
          status: ReimbursementStatus.PendingPayment,
          createdAtUtc: '2026-11-25T12:00:00Z',
          paidAtUtc: null,
          paymentReference: null,
          destination: 'Tokyo',
          purpose: 'Partner sync',
        },
      ]),
    );

    TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            user: () => ({
              userId: 1,
              employeeId: 10,
              fullName: 'Alex Morgan',
              email: 'alex@company.com',
              role,
            }),
            userRole: () => role,
          },
        },
        { provide: TravelRequestService, useValue: { getMyRequests } },
        { provide: ReimbursementService, useValue: { getMyReimbursements } },
      ],
    });

    return {
      fixture: TestBed.createComponent(DashboardPage),
      getMyRequests,
      getMyReimbursements,
    };
  }

  it('loads and displays summary metrics and recent requests for Employee', async () => {
    const { fixture, getMyRequests, getMyReimbursements } = setup('Employee');
    await fixture.whenStable();

    expect(getMyRequests).toHaveBeenCalledTimes(1);
    expect(getMyReimbursements).toHaveBeenCalledTimes(1);

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Tokyo');
    expect(text).toContain('Paris');
    expect(text).toContain('₹185.00');
  });

  it('does not call employee-only endpoints when signed in as Finance', async () => {
    const { fixture, getMyRequests, getMyReimbursements } = setup('Finance');
    await fixture.whenStable();

    expect(getMyRequests).not.toHaveBeenCalled();
    expect(getMyReimbursements).not.toHaveBeenCalled();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Finance Workspace');
    expect(text).toContain('Expense Reviews');
  });
});
