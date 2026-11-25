import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { PageHeader } from '../../shared/components/page-header/page-header';
import {
  FLIGHT_CLASS_OPTIONS,
  FlightClass,
  TRAIN_CLASS_OPTIONS,
  TRAVEL_MODE_OPTIONS,
  TrainClass,
  TravelMode,
  TravelRequestStatus,
} from '../../shared/models/tms-enums.model';
import { parseDateOnly, toDateOnlyString } from '../../shared/utilities/date.util';
import { extractApiErrorMessage } from '../../shared/utilities/http-error.util';
import { CreateTravelRequestPayload } from './travel-request.models';
import { TravelRequestService } from './travel-request.service';

function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const departure = control.get('departureDate')?.value as Date | null | undefined;
  const ret = control.get('returnDate')?.value as Date | null | undefined;
  if (departure && ret && departure.getTime() > ret.getTime()) {
    return { dateRangeInvalid: true };
  }
  return null;
}

@Component({
  selector: 'app-travel-request-form-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatRadioModule,
    MatSelectModule,
    PageHeader,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './travel-request-form-page.html',
  styleUrl: './travel-request-form-page.scss',
})
export class TravelRequestFormPage implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly travelRequestService = inject(TravelRequestService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  readonly id = input<string | undefined>(undefined);

  protected readonly requestId = computed(() => {
    const raw = this.id();
    const parsed = raw ? Number(raw) : NaN;
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  });

  protected readonly isEditMode = computed(() => this.requestId() !== null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly nonDraftLocked = signal(false);

  protected readonly TravelMode = TravelMode;
  protected readonly modeOptions = TRAVEL_MODE_OPTIONS;
  protected readonly flightClassOptions = FLIGHT_CLASS_OPTIONS;
  protected readonly trainClassOptions = TRAIN_CLASS_OPTIONS;

  protected readonly form = this.fb.group(
    {
      destination: ['', [Validators.required, Validators.maxLength(150)]],
      purpose: ['', [Validators.required, Validators.maxLength(500)]],
      travelMode: this.fb.control<TravelMode>(TravelMode.Flight, [Validators.required]),
      flightClass: this.fb.control<FlightClass | null>(FlightClass.Economy, [Validators.required]),
      trainClass: this.fb.control<TrainClass | null>(null),
      departureDate: this.fb.control<Date | null>(null, [Validators.required]),
      returnDate: this.fb.control<Date | null>(null, [Validators.required]),
      estimatedCost: this.fb.control<number | null>(null, [
        Validators.required,
        Validators.min(0.01),
      ]),
    },
    { validators: [dateRangeValidator] },
  );

  constructor() {
    this.form.controls.travelMode.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((mode) => this.syncClassValidators(mode));
  }

  ngOnInit(): void {
    const existingId = this.requestId();
    if (existingId !== null) {
      this.loadExisting(existingId);
    }
  }

  protected saveDraft(): void {
    this.persist(false);
  }

  protected saveAndSubmit(): void {
    this.persist(true);
  }

  private persist(submitAfterSave: boolean): void {
    if (this.nonDraftLocked()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    if (!payload) {
      return;
    }

    this.errorMessage.set(null);
    this.isSaving.set(true);

    const existingId = this.requestId();
    const save$ =
      existingId !== null
        ? this.travelRequestService.update(existingId, payload)
        : this.travelRequestService.create(payload);

    const flow$ = submitAfterSave
      ? save$.pipe(switchMap((saved) => this.travelRequestService.submit(saved.id)))
      : save$;

    flow$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: (saved) => {
        this.notifications.success(
          submitAfterSave
            ? 'Travel request submitted for manager approval.'
            : 'Travel request draft saved.',
        );
        void this.router.navigate(['/travel-requests', saved.id]);
      },
      error: (error: unknown) => {
        this.errorMessage.set(
          extractApiErrorMessage(error, 'Failed to save travel request.'),
        );
      },
    });
  }

  private loadExisting(travelRequestId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.travelRequestService
      .getById(travelRequestId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (req) => {
          this.syncClassValidators(req.travelMode);
          this.form.patchValue({
            destination: req.destination,
            purpose: req.purpose,
            travelMode: req.travelMode,
            flightClass: req.flightClass,
            trainClass: req.trainClass,
            departureDate: parseDateOnly(req.departureDate),
            returnDate: parseDateOnly(req.returnDate),
            estimatedCost: req.estimatedCost,
          });

          if (req.status !== TravelRequestStatus.Draft) {
            this.nonDraftLocked.set(true);
            this.form.disable();
          }
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            extractApiErrorMessage(error, 'Unable to load travel request.'),
          );
        },
      });
  }

  private syncClassValidators(mode: TravelMode): void {
    const flightCtrl = this.form.controls.flightClass;
    const trainCtrl = this.form.controls.trainClass;

    if (mode === TravelMode.Flight) {
      flightCtrl.setValidators([Validators.required]);
      trainCtrl.clearValidators();
      trainCtrl.setValue(null, { emitEvent: false });
      if (!flightCtrl.value) {
        flightCtrl.setValue(FlightClass.Economy, { emitEvent: false });
      }
    } else {
      trainCtrl.setValidators([Validators.required]);
      flightCtrl.clearValidators();
      flightCtrl.setValue(null, { emitEvent: false });
      if (!trainCtrl.value) {
        trainCtrl.setValue(TrainClass.AC2Tier, { emitEvent: false });
      }
    }

    flightCtrl.updateValueAndValidity({ emitEvent: false });
    trainCtrl.updateValueAndValidity({ emitEvent: false });
  }

  private buildPayload(): CreateTravelRequestPayload | null {
    const raw = this.form.getRawValue();
    if (!raw.departureDate || !raw.returnDate || raw.estimatedCost === null) {
      return null;
    }

    return {
      destination: raw.destination.trim(),
      purpose: raw.purpose.trim(),
      travelMode: raw.travelMode,
      flightClass: raw.travelMode === TravelMode.Flight ? raw.flightClass : null,
      trainClass: raw.travelMode === TravelMode.Train ? raw.trainClass : null,
      departureDate: toDateOnlyString(raw.departureDate),
      returnDate: toDateOnlyString(raw.returnDate),
      estimatedCost: raw.estimatedCost,
    };
  }
}
