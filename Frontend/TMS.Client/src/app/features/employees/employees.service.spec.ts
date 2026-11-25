import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CreateEmployeePayload } from './employees.models';
import { EmployeesService } from './employees.service';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EmployeesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('calls employees and roles endpoints', () => {
    service.getAll().subscribe();
    expect(httpMock.expectOne('/api/employees').request.method).toBe('GET');

    service.getById(4).subscribe();
    expect(httpMock.expectOne('/api/employees/4').request.method).toBe('GET');

    service.getRoles().subscribe();
    expect(httpMock.expectOne('/api/roles').request.method).toBe('GET');

    const payload: CreateEmployeePayload = {
      fullName: 'Sam Patel',
      email: 'sam.patel@company.com',
      password: 'Password123!',
      roleId: 1,
      employeeCode: 'EMP-301',
      departmentId: 1,
      designation: 'Software Engineer',
      gradeId: 2,
      managerId: 2,
    };

    service.create(payload).subscribe();
    const createReq = httpMock.expectOne('/api/employees');
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body).toEqual(payload);
    createReq.flush({ ...payload, employeeId: 15, userId: 20 });
  });
});
