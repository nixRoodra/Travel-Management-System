import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { CreateEmployeePage } from './create-employee-page';
import { EmployeesService } from './employees.service';

describe('CreateEmployeePage', () => {
  it('filters managers for dropdown and submits valid CreateEmployeePayload', async () => {
    const createSpy = vi.fn().mockReturnValue(
      of({
        employeeId: 9,
        userId: 9,
        fullName: 'Jordan Taylor',
        email: 'jordan@company.com',
        employeeCode: 'EMP-105',
      }),
    );

    TestBed.configureTestingModule({
      imports: [CreateEmployeePage],
      providers: [
        provideRouter([]),
        {
          provide: EmployeesService,
          useValue: {
            getRoles: () =>
              of([
                { id: 1, name: 'Employee' },
                { id: 2, name: 'Manager' },
              ]),
            getAll: () =>
              of([
                {
                  employeeId: 1,
                  userId: 1,
                  fullName: 'Grace Hopper',
                  email: 'grace@company.com',
                  employeeCode: 'EMP-001',
                  roleId: 2,
                  roleName: 'Manager',
                  departmentId: 3,
                  departmentName: 'Product',
                  designation: 'Director',
                  managerId: null,
                  tmsAccountCreatedAt: '2026-11-01T10:00:00Z',
                },
              ]),
            create: createSpy,
          },
        },
        {
          provide: NotificationService,
          useValue: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
        },
      ],
    });

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    const fixture = TestBed.createComponent(CreateEmployeePage);
    await fixture.whenStable();

    const comp = fixture.componentInstance as unknown as {
      managers: () => { employeeId: number }[];
      form: { patchValue: (v: Record<string, unknown>) => void };
      onSubmit: () => void;
    };

    expect(comp.managers().map((m) => m.employeeId)).toEqual([1]);

    comp.form.patchValue({
      fullName: 'Jordan Taylor',
      email: 'jordan@company.com',
      password: 'Password123!',
      employeeCode: 'EMP-105',
      designation: 'Product Analyst',
      gradeId: 2,
      managerId: 1,
    });
    comp.onSubmit();

    expect(createSpy).toHaveBeenCalledWith({
      fullName: 'Jordan Taylor',
      email: 'jordan@company.com',
      password: 'Password123!',
      employeeCode: 'EMP-105',
      roleId: 1,
      departmentId: 3,
      designation: 'Product Analyst',
      gradeId: 2,
      managerId: 1,
    });
    expect(navigateSpy).toHaveBeenCalledWith('/admin/employees');
  });
});
