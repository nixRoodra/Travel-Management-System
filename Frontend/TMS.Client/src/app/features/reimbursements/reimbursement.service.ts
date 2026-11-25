import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmployeeReimbursementDto } from './reimbursement.models';

@Injectable({ providedIn: 'root' })
export class ReimbursementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/reimbursements`;

  getMyReimbursements(): Observable<EmployeeReimbursementDto[]> {
    return this.http.get<EmployeeReimbursementDto[]>(`${this.baseUrl}/my-reimbursements`);
  }
}
