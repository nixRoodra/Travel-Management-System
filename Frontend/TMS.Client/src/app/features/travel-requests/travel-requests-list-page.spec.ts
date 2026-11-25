import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { FlightClass, TravelMode, TravelRequestStatus } from '../../shared/models/tms-enums.model';
import { TravelRequestDto } from './travel-request.models';
import { TravelRequestService } from './travel-request.service';
import { TravelRequestsListPage } from './travel-requests-list-page';

describe('TravelRequestsListPage', () => {
  const sampleRequests: TravelRequestDto[] = [
    {
      id: 1,
      employeeId: 10,
      destination: 'London',
      purpose: 'Client QBR',
      travelMode: TravelMode.Flight,
      flightClass: FlightClass.Economy,
      trainClass: null,
      departureDate: '2026-12-01',
      returnDate: '2026-12-04',
      estimatedCost: 1500,
      status: TravelRequestStatus.Draft,
      createdAtUtc: '2026-11-25T10:00:00Z',
      submittedAtUtc: null,
    },
    {
      id: 2,
      employeeId: 10,
      destination: 'Frankfurt',
      purpose: 'Security audit',
      travelMode: TravelMode.Flight,
      flightClass: FlightClass.Business,
      trainClass: null,
      departureDate: '2026-12-10',
      returnDate: '2026-12-12',
      estimatedCost: 2200,
      status: TravelRequestStatus.Approved,
      createdAtUtc: '2026-11-25T11:00:00Z',
      submittedAtUtc: '2026-11-25T11:05:00Z',
    },
  ];

  it('filters requests by search term and status', async () => {
    TestBed.configureTestingModule({
      imports: [TravelRequestsListPage],
      providers: [
        provideRouter([]),
        {
          provide: TravelRequestService,
          useValue: { getMyRequests: () => of(sampleRequests), submit: vi.fn() },
        },
        {
          provide: MatDialog,
          useValue: { open: vi.fn() },
        },
        {
          provide: NotificationService,
          useValue: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
        },
      ],
    });

    const fixture = TestBed.createComponent(TravelRequestsListPage);
    await fixture.whenStable();

    const comp = fixture.componentInstance as unknown as {
      onFilterChange: (f: 'ALL' | TravelRequestStatus) => void;
      onSearchChange: (q: string) => void;
      filteredRequests: () => TravelRequestDto[];
    };

    expect(comp.filteredRequests().length).toBe(2);

    comp.onFilterChange(TravelRequestStatus.Approved);
    expect(comp.filteredRequests().map((r) => r.destination)).toEqual(['Frankfurt']);

    comp.onFilterChange('ALL');
    comp.onSearchChange('London');
    expect(comp.filteredRequests().map((r) => r.id)).toEqual([1]);
  });
});
