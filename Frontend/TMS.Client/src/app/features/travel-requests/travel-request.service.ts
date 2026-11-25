import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTravelRequestPayload, TravelRequestDto } from './travel-request.models';

@Injectable({ providedIn: 'root' })
export class TravelRequestService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/travelrequests`;

  getMyRequests(): Observable<TravelRequestDto[]> {
    return this.http.get<TravelRequestDto[]>(`${this.baseUrl}/my-requests`);
  }

  getById(travelRequestId: number): Observable<TravelRequestDto> {
    return this.http.get<TravelRequestDto>(`${this.baseUrl}/${travelRequestId}`);
  }

  create(payload: CreateTravelRequestPayload): Observable<TravelRequestDto> {
    return this.http.post<TravelRequestDto>(this.baseUrl, payload);
  }

  update(travelRequestId: number, payload: CreateTravelRequestPayload): Observable<TravelRequestDto> {
    return this.http.put<TravelRequestDto>(`${this.baseUrl}/${travelRequestId}`, payload);
  }

  submit(travelRequestId: number): Observable<TravelRequestDto> {
    return this.http.post<TravelRequestDto>(`${this.baseUrl}/${travelRequestId}/submit`, {});
  }
}
