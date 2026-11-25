import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, durationMs = 3500): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: durationMs,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['tms-snackbar-success'],
    });
  }

  error(message: string, durationMs = 5000): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: durationMs,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['tms-snackbar-error'],
    });
  }

  info(message: string, durationMs = 3500): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: durationMs,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
