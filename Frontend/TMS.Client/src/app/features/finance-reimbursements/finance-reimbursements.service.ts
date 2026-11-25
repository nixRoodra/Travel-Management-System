import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FinanceReimbursementDto,
  RecordReimbursementPaymentPayload,
  ReimbursementDetailDto,
} from './finance-reimbursements.models';

@Injectable({ providedIn: 'root' })
export class FinanceReimbursementsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/finance/reimbursements`;

  getPending(): Observable<FinanceReimbursementDto[]> {
    return this.http.get<FinanceReimbursementDto[]>(`${this.baseUrl}/pending`);
  }

  getById(reimbursementId: number): Observable<ReimbursementDetailDto> {
    return this.http.get<ReimbursementDetailDto>(`${this.baseUrl}/${reimbursementId}`);
  }

  recordPayment(
    reimbursementId: number,
    paymentReference?: string | null,
  ): Observable<FinanceReimbursementDto> {
    const payload: RecordReimbursementPaymentPayload = {
      paymentReference: paymentReference?.trim() || null,
    };
    return this.http.post<FinanceReimbursementDto>(
      `${this.baseUrl}/${reimbursementId}/record-payment`,
      payload,
    );
  }
}
