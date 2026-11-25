import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateEmployeePayload, EmployeeDto, RoleDto } from './employees.models';

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private readonly http = inject(HttpClient);
  private readonly employeesUrl = `${environment.apiBaseUrl}/employees`;
  private readonly rolesUrl = `${environment.apiBaseUrl}/roles`;

  getAll(): Observable<EmployeeDto[]> {
    return this.http.get<EmployeeDto[]>(this.employeesUrl);
  }

  getById(employeeId: number): Observable<EmployeeDto> {
    return this.http.get<EmployeeDto>(`${this.employeesUrl}/${employeeId}`);
  }

  create(payload: CreateEmployeePayload): Observable<EmployeeDto> {
    return this.http.post<EmployeeDto>(this.employeesUrl, payload);
  }

  getRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(this.rolesUrl);
  }
}
