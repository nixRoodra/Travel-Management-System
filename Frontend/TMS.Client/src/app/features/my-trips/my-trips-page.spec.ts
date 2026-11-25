import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { FlightClass, TravelMode, TravelRequestStatus } from '../../shared/models/tms-enums.model';
import { ExpenseClaimService } from '../expense-claims/expense-claim.service';
import { ReimbursementService } from '../reimbursements/reimbursement.service';
import { TravelRequestService } from '../travel-requests/travel-request.service';
import { MyTripsPage } from './my-trips-page';

describe('MyTripsPage', () => {
  it('filters to Approved/Completed trips and selects matching tripId query param', async () => {
    TestBed.configureTestingModule({
      imports: [MyTripsPage],
      providers: [
        provideRouter([]),
        {
          provide: TravelRequestService,
          useValue: {
            getMyRequests: () =>
              of([
                {
                  id: 1,
                  employeeId: 10,
                  destination: 'Draft City',
                  purpose: 'Draft',
                  travelMode: TravelMode.Flight,
                  flightClass: FlightClass.Economy,
                  trainClass: null,
                  departureDate: '2026-12-01',
                  returnDate: '2026-12-02',
                  estimatedCost: 500,
                  status: TravelRequestStatus.Draft,
                  createdAtUtc: '2026-11-25T10:00:00Z',
                  submittedAtUtc: null,
                },
                {
                  id: 2,
                  employeeId: 10,
                  destination: 'Zurich',
                  purpose: 'Partner Meeting',
                  travelMode: TravelMode.Flight,
                  flightClass: FlightClass.Business,
                  trainClass: null,
                  departureDate: '2026-12-05',
                  returnDate: '2026-12-08',
                  estimatedCost: 1900,
                  status: TravelRequestStatus.Approved,
                  createdAtUtc: '2026-11-25T10:00:00Z',
                  submittedAtUtc: '2026-11-25T10:15:00Z',
                },
              ]),
          },
        },
        { provide: ExpenseClaimService, useValue: { getClaimForTripOptional: () => of(null) } },
        { provide: ReimbursementService, useValue: { getMyReimbursements: () => of([]) } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        {
          provide: NotificationService,
          useValue: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
        },
      ],
    });

    const fixture = TestBed.createComponent(MyTripsPage);
    fixture.componentRef.setInput('tripId', '2');
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Zurich');
    expect(text).not.toContain('Draft City');
    expect(text).toContain('Itinerary segments not yet available from backend');
  });
});
