import { TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import {
  FlightClass,
  TrainClass,
  TravelMode,
  TravelRequestStatus,
} from '../../shared/models/tms-enums.model';
import { TravelRequestFormPage } from './travel-request-form-page';
import { TravelRequestService } from './travel-request.service';

describe('TravelRequestFormPage', () => {
  let createSpy: ReturnType<typeof vi.fn>;
  let submitSpy: ReturnType<typeof vi.fn>;
  let router: Router;

  beforeEach(() => {
    createSpy = vi.fn().mockReturnValue(
      of({
        id: 15,
        employeeId: 10,
        destination: 'Munich',
        purpose: 'Client sync',
        travelMode: TravelMode.Train,
        flightClass: null,
        trainClass: TrainClass.AC2Tier,
        departureDate: '2026-12-01',
        returnDate: '2026-12-03',
        estimatedCost: 450,
        status: TravelRequestStatus.Draft,
        createdAtUtc: '2026-11-25T10:00:00Z',
        submittedAtUtc: null,
      }),
    );
    submitSpy = vi.fn().mockReturnValue(
      of({
        id: 15,
        status: TravelRequestStatus.PendingManagerApproval,
      }),
    );

    TestBed.configureTestingModule({
      imports: [TravelRequestFormPage],
      providers: [
        provideRouter([]),
        provideNativeDateAdapter(),
        {
          provide: TravelRequestService,
          useValue: { create: createSpy, update: vi.fn(), getById: vi.fn(), submit: submitSpy },
        },
        {
          provide: NotificationService,
          useValue: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
        },
      ],
    });

    router = TestBed.inject(Router);
  });

  it('switches required class control when travel mode changes from Flight to Train', async () => {
    const fixture = TestBed.createComponent(TravelRequestFormPage);
    await fixture.whenStable();

    const comp = fixture.componentInstance as unknown as {
      form: {
        controls: {
          travelMode: { setValue: (v: TravelMode) => void };
          flightClass: { value: FlightClass | null };
          trainClass: { value: TrainClass | null };
        };
      };
    };

    expect(comp.form.controls.flightClass.value).toBe(FlightClass.Economy);
    expect(comp.form.controls.trainClass.value).toBeNull();

    comp.form.controls.travelMode.setValue(TravelMode.Train);

    expect(comp.form.controls.flightClass.value).toBeNull();
    expect(comp.form.controls.trainClass.value).toBe(TrainClass.AC2Tier);
  });

  it('flags dateRangeInvalid when departureDate is after returnDate', async () => {
    const fixture = TestBed.createComponent(TravelRequestFormPage);
    await fixture.whenStable();

    const comp = fixture.componentInstance as unknown as {
      form: {
        patchValue: (v: Record<string, unknown>) => void;
        hasError: (err: string) => boolean;
      };
    };

    comp.form.patchValue({
      departureDate: new Date(2026, 11, 10),
      returnDate: new Date(2026, 11, 5),
    });

    expect(comp.form.hasError('dateRangeInvalid')).toBe(true);
  });

  it('formats DateOnly fields cleanly and sends null for unused class on saveDraft', async () => {
    const fixture = TestBed.createComponent(TravelRequestFormPage);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    await fixture.whenStable();

    const comp = fixture.componentInstance as unknown as {
      form: { patchValue: (v: Record<string, unknown>) => void };
      saveDraft: () => void;
    };

    comp.form.patchValue({
      destination: 'Munich',
      purpose: 'Client sync',
      travelMode: TravelMode.Train,
      trainClass: TrainClass.AC2Tier,
      departureDate: new Date(2026, 11, 1),
      returnDate: new Date(2026, 11, 3),
      estimatedCost: 450,
    });
    comp.saveDraft();

    expect(createSpy).toHaveBeenCalledWith({
      destination: 'Munich',
      purpose: 'Client sync',
      travelMode: TravelMode.Train,
      flightClass: null,
      trainClass: TrainClass.AC2Tier,
      departureDate: '2026-12-01',
      returnDate: '2026-12-03',
      estimatedCost: 450,
    });
  });
});
