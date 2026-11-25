import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { parseDateOnly, toDateOnlyString } from '../../../../shared/utilities/date.util';
import { ExpenseItemDto, ExpenseItemUpsertPayload } from '../../expense-claim.models';

export interface ExpenseItemDialogData {
  mode: 'add' | 'edit';
  item?: ExpenseItemDto;
  minDate?: string;
  maxDate?: string;
}

@Component({
  selector: 'app-expense-item-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'edit' ? 'Edit Expense Item' : 'Add Expense Item' }}</h2>

    <form [formGroup]="form" (ngSubmit)="onSave()" novalidate>
      <mat-dialog-content class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Expense Date</mat-label>
          <input
            matInput
            [matDatepicker]="picker"
            formControlName="expenseDate"
            [min]="minDate"
            [max]="maxDate"
          />
          <mat-datepicker-toggle matIconSuffix [for]="picker" />
          <mat-datepicker #picker />
          @if (form.controls.expenseDate.hasError('required') && form.controls.expenseDate.touched) {
            <mat-error>Expense date is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <input
            matInput
            formControlName="description"
            placeholder="e.g. Airport taxi, Hotel stay, Meals"
          />
          @if (form.controls.description.hasError('required') && form.controls.description.touched) {
            <mat-error>Description is required</mat-error>
          } @else if (form.controls.description.hasError('maxlength')) {
            <mat-error>Description cannot exceed 300 characters</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Amount (INR)</mat-label>
          <span matTextPrefix>₹&nbsp;</span>
          <input matInput type="number" step="0.01" min="0.01" formControlName="amount" />
          @if (form.controls.amount.hasError('required') && form.controls.amount.touched) {
            <mat-error>Amount is required</mat-error>
          } @else if (form.controls.amount.hasError('min')) {
            <mat-error>Amount must be greater than zero</mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
        <button mat-flat-button color="primary" type="submit">
          {{ data.mode === 'edit' ? 'Save Changes' : 'Add Item' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: var(--tms-space-3);
      min-width: 340px;
      padding-top: 8px;

      @media (max-width: 479.98px) {
        min-width: auto;
      }
    }
  `,
})
export class ExpenseItemDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly dialogRef = inject(
    MatDialogRef<ExpenseItemDialog, ExpenseItemUpsertPayload>,
  );
  protected readonly data = inject<ExpenseItemDialogData>(MAT_DIALOG_DATA);

  protected readonly minDate = this.data.minDate ? parseDateOnly(this.data.minDate) : null;
  protected readonly maxDate = this.data.maxDate ? parseDateOnly(this.data.maxDate) : null;

  protected readonly form = this.fb.group({
    expenseDate: this.fb.control<Date | null>(
      this.data.item ? parseDateOnly(this.data.item.expenseDate) : (this.minDate ?? new Date()),
      [Validators.required],
    ),
    description: [
      this.data.item?.description ?? '',
      [Validators.required, Validators.maxLength(300)],
    ],
    amount: this.fb.control<number | null>(this.data.item?.amount ?? null, [
      Validators.required,
      Validators.min(0.01),
    ]),
  });

  protected onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    if (!raw.expenseDate || raw.amount === null) {
      return;
    }

    this.dialogRef.close({
      expenseDate: toDateOnlyString(raw.expenseDate),
      description: raw.description.trim(),
      amount: raw.amount,
    });
  }
}
