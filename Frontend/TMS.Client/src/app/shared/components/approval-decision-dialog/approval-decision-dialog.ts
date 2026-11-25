import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface ApprovalDecisionDialogData {
  title: string;
  subtitle?: string;
  confirmLabel: string;
  confirmColor?: 'primary' | 'warn';
  commentsRequired: boolean;
  commentsLabel?: string;
  commentsPlaceholder?: string;
  maxLength?: number;
}

@Component({
  selector: 'app-approval-decision-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>

    <form [formGroup]="form" (ngSubmit)="onConfirm()" novalidate>
      <mat-dialog-content class="dialog-body">
        @if (data.subtitle) {
          <p class="dialog-subtitle">{{ data.subtitle }}</p>
        }

        <mat-form-field appearance="outline" class="comments-field">
          <mat-label>{{ data.commentsLabel ?? 'Comments' }}</mat-label>
          <textarea
            matInput
            rows="3"
            formControlName="comments"
            [placeholder]="
              data.commentsPlaceholder ??
              (data.commentsRequired ? 'Provide a clear reason...' : 'Optional comments...')
            "
          ></textarea>
          @if (form.controls.comments.hasError('required') && form.controls.comments.touched) {
            <mat-error>Comments are required for this action</mat-error>
          } @else if (form.controls.comments.hasError('maxlength')) {
            <mat-error>Comments cannot exceed {{ maxLength }} characters</mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close(null)">Cancel</button>
        <button mat-flat-button [color]="data.confirmColor ?? 'primary'" type="submit">
          {{ data.confirmLabel }}
        </button>
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

    .dialog-subtitle {
      margin: 0 0 var(--tms-space-4);
      font-size: 0.875rem;
      color: var(--tms-text-secondary);
      line-height: 1.45;
    }

    .comments-field {
      width: 100%;
    }
  `,
})
export class ApprovalDecisionDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly dialogRef = inject(
    MatDialogRef<ApprovalDecisionDialog, string | null>,
  );
  protected readonly data = inject<ApprovalDecisionDialogData>(MAT_DIALOG_DATA);
  protected readonly maxLength = this.data.maxLength ?? 1000;

  protected readonly form = this.fb.group({
    comments: [
      '',
      this.data.commentsRequired
        ? [Validators.required, Validators.maxLength(this.maxLength)]
        : [Validators.maxLength(this.maxLength)],
    ],
  });

  protected onConfirm(): void {
    const trimmed = this.form.controls.comments.value.trim();
    if (this.data.commentsRequired && trimmed.length === 0) {
      this.form.controls.comments.setValue('');
      this.form.controls.comments.markAsTouched();
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(trimmed);
  }
}
