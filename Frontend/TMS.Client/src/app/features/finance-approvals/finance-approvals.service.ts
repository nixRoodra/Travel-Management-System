import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApproveTravelRequestPayload,
  RejectTravelRequestPayload,
  TravelApprovalItemDto,
} from '../../shared/models/travel-approval.model';

@Injectable({ providedIn: 'root' })
export class FinanceApprovalsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/finance/approvals`;

  getPending(): Observable<TravelApprovalItemDto[]> {
    return this.http.get<TravelApprovalItemDto[]>(`${this.baseUrl}/pending`);
  }

  getHistory(): Observable<TravelApprovalItemDto[]> {
    return this.http.get<TravelApprovalItemDto[]>(`${this.baseUrl}/history`);
  }

  approve(travelRequestId: number, comments?: string | null): Observable<TravelApprovalItemDto> {
    const payload: ApproveTravelRequestPayload = {
      comments: comments?.trim() || null,
    };
    return this.http.post<TravelApprovalItemDto>(
      `${this.baseUrl}/${travelRequestId}/approve`,
      payload,
    );
  }

  reject(travelRequestId: number, comments: string): Observable<TravelApprovalItemDto> {
    const payload: RejectTravelRequestPayload = {
      comments: comments.trim(),
    };
    return this.http.post<TravelApprovalItemDto>(
      `${this.baseUrl}/${travelRequestId}/reject`,
      payload,
    );
  }
}
