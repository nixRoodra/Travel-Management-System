import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ExpenseClaimReviewHistoryDto,
  FinanceExpenseClaimDetailDto,
  FinanceExpenseClaimQueueDto,
} from './finance-expense-reviews.models';

@Injectable({ providedIn: 'root' })
export class FinanceExpenseReviewsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/finance/expense-claims`;

  getSubmittedQueue(): Observable<FinanceExpenseClaimQueueDto[]> {
    return this.http.get<FinanceExpenseClaimQueueDto[]>(this.baseUrl);
  }

  getClaimDetail(expenseClaimId: number): Observable<FinanceExpenseClaimDetailDto> {
    return this.http.get<FinanceExpenseClaimDetailDto>(`${this.baseUrl}/${expenseClaimId}`);
  }

  getReviewHistory(expenseClaimId: number): Observable<ExpenseClaimReviewHistoryDto[]> {
    return this.http.get<ExpenseClaimReviewHistoryDto[]>(
      `${this.baseUrl}/${expenseClaimId}/review-history`,
    );
  }

  approve(
    expenseClaimId: number,
    comments?: string | null,
  ): Observable<FinanceExpenseClaimDetailDto> {
    return this.http.post<FinanceExpenseClaimDetailDto>(
      `${this.baseUrl}/${expenseClaimId}/approve`,
      { comments: comments?.trim() || null },
    );
  }

  reject(expenseClaimId: number, comments: string): Observable<FinanceExpenseClaimDetailDto> {
    return this.http.post<FinanceExpenseClaimDetailDto>(
      `${this.baseUrl}/${expenseClaimId}/reject`,
      { comments: comments.trim() },
    );
  }

  requestResubmission(
    expenseClaimId: number,
    comments: string,
  ): Observable<FinanceExpenseClaimDetailDto> {
    return this.http.post<FinanceExpenseClaimDetailDto>(
      `${this.baseUrl}/${expenseClaimId}/request-resubmission`,
      { comments: comments.trim() },
    );
  }

  downloadReceipt(
    expenseClaimId: number,
    expenseItemId: number,
    receiptId: number,
  ): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.baseUrl}/${expenseClaimId}/items/${expenseItemId}/receipts/${receiptId}`,
      { responseType: 'blob', observe: 'response' },
    );
  }
}
