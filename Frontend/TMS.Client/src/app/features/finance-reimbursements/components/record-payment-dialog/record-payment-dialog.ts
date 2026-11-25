import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface RecordPaymentDialogData {
  reimbursementId: number;
  employeeName: string;
  destination: string;
  amount: number;
}

@Component({
  selector: 'app-record-payment-dialog',
  standalone: true,
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Record Reimbursement Payment</h2>

    <form [formGroup]="form" (ngSubmit)="onConfirm()" novalidate>
      <mat-dialog-content class="dialog-body">
        <div class="payment-summary">
          <div class="summary-row">
            <span>Reimbursement</span>
            <strong>#{{ data.reimbursementId }}</strong>
          </div>
          <div class="summary-row">
            <span>Employee</span>
            <strong>{{ data.employeeName }}</strong>
          </div>
          <div class="summary-row">
            <span>Trip</span>
            <strong>{{ data.destination }}</strong>
          </div>
          <div class="summary-row">
            <span>Payout Amount</span>
            <strong>{{ data.amount | currency: 'INR' : 'symbol' : '1.2-2' }}</strong>
          </div>
        </div>

        <mat-form-field appearance="outline" class="ref-field">
          <mat-label>Payment Reference (Optional)</mat-label>
          <input
            matInput
            formControlName="paymentReference"
            placeholder="e.g. UTR-2026-00412 or NEFT-8841"
          />
          @if (form.controls.paymentReference.hasError('maxlength')) {
            <mat-error>Payment reference cannot exceed 100 characters</mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close(null)">Cancel</button>
        <button mat-flat-button color="primary" type="submit">Confirm Payment</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .dialog-body {
      min-width: 360px;
      padding-top: 4px;

      @media (max-width: 479.98px) {
        min-width: auto;
      }
    }

    .payment-summary {
      padding: var(--tms-space-3) var(--tms-space-4);
      margin-bottom: var(--tms-space-4);
      border-radius: var(--tms-radius-md);
      background-color: var(--tms-bg-subtle);
      border: 1px solid var(--tms-border-subtle);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: var(--tms-text-secondary);

      strong {
        color: var(--tms-text-primary);
      }
    }

    .ref-field {
      width: 100%;
    }
  `,
})
export class RecordPaymentDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly dialogRef = inject(
    MatDialogRef<RecordPaymentDialog, string | null>,
  );
  protected readonly data = inject<RecordPaymentDialogData>(MAT_DIALOG_DATA);

  protected readonly form = this.fb.group({
    paymentReference: ['', [Validators.maxLength(100)]],
  });

  protected onConfirm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.controls.paymentReference.value.trim());
  }
}
