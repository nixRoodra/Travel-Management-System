import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ExpenseClaimDto,
  ExpenseItemDto,
  ExpenseItemUpsertPayload,
  ExpenseReceiptDto,
} from './expense-claim.models';

@Injectable({ providedIn: 'root' })
export class ExpenseClaimService {
  private readonly http = inject(HttpClient);

  private claimBaseUrl(travelRequestId: number): string {
    return `${environment.apiBaseUrl}/trips/${travelRequestId}/expense-claim`;
  }

  getClaimForTrip(travelRequestId: number): Observable<ExpenseClaimDto> {
    return this.http.get<ExpenseClaimDto>(this.claimBaseUrl(travelRequestId));
  }

  /** Returns null when the backend responds 404 (no expense claim created for this trip yet). */
  getClaimForTripOptional(travelRequestId: number): Observable<ExpenseClaimDto | null> {
    return this.getClaimForTrip(travelRequestId).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          return of(null);
        }
        return throwError(() => error);
      }),
    );
  }

  createClaim(travelRequestId: number): Observable<ExpenseClaimDto> {
    return this.http.post<ExpenseClaimDto>(this.claimBaseUrl(travelRequestId), {});
  }

  addItem(travelRequestId: number, payload: ExpenseItemUpsertPayload): Observable<ExpenseItemDto> {
    return this.http.post<ExpenseItemDto>(`${this.claimBaseUrl(travelRequestId)}/items`, payload);
  }

  updateItem(
    travelRequestId: number,
    expenseItemId: number,
    payload: ExpenseItemUpsertPayload,
  ): Observable<ExpenseItemDto> {
    return this.http.put<ExpenseItemDto>(
      `${this.claimBaseUrl(travelRequestId)}/items/${expenseItemId}`,
      payload,
    );
  }

  deleteItem(travelRequestId: number, expenseItemId: number): Observable<void> {
    return this.http.delete<void>(`${this.claimBaseUrl(travelRequestId)}/items/${expenseItemId}`);
  }

  uploadReceipt(
    travelRequestId: number,
    expenseItemId: number,
    file: File,
  ): Observable<ExpenseReceiptDto> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<ExpenseReceiptDto>(
      `${this.claimBaseUrl(travelRequestId)}/items/${expenseItemId}/receipts`,
      formData,
    );
  }

  downloadReceipt(
    travelRequestId: number,
    expenseItemId: number,
    receiptId: number,
  ): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.claimBaseUrl(travelRequestId)}/items/${expenseItemId}/receipts/${receiptId}`,
      { responseType: 'blob', observe: 'response' },
    );
  }

  deleteReceipt(
    travelRequestId: number,
    expenseItemId: number,
    receiptId: number,
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.claimBaseUrl(travelRequestId)}/items/${expenseItemId}/receipts/${receiptId}`,
    );
  }

  submitClaim(travelRequestId: number): Observable<ExpenseClaimDto> {
    return this.http.post<ExpenseClaimDto>(`${this.claimBaseUrl(travelRequestId)}/submit`, {});
  }
}
