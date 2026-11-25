import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EmployeeDto, RoleDto } from './employees.models';
import { EmployeesPage } from './employees-page';
import { EmployeesService } from './employees.service';

describe('EmployeesPage', () => {
  const sampleRoles: RoleDto[] = [
    { id: 1, name: 'Employee' },
    { id: 2, name: 'Manager' },
  ];

  const sampleEmployees: EmployeeDto[] = [
    {
      employeeId: 1,
      userId: 1,
      fullName: 'Grace Hopper',
      email: 'grace@company.com',
      employeeCode: 'EMP-001',
      roleId: 2,
      roleName: 'Manager',
      departmentId: 10,
      departmentName: 'Engineering',
      designation: 'Engineering Manager',
      managerId: null,
      tmsAccountCreatedAt: '2026-11-01T10:00:00Z',
    },
    {
      employeeId: 2,
      userId: 2,
      fullName: 'Ada Lovelace',
      email: 'ada@company.com',
      employeeCode: 'EMP-002',
      roleId: 1,
      roleName: 'Employee',
      departmentId: 10,
      departmentName: 'Engineering',
      designation: 'Staff Engineer',
      managerId: 1,
      tmsAccountCreatedAt: '2026-11-02T10:00:00Z',
    },
  ];

  it('derives departments, resolves manager names, and filters by role', async () => {
    TestBed.configureTestingModule({
      imports: [EmployeesPage],
      providers: [
        provideRouter([]),
        {
          provide: EmployeesService,
          useValue: {
            getAll: () => of(sampleEmployees),
            getRoles: () => of(sampleRoles),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(EmployeesPage);
    await fixture.whenStable();

    const comp = fixture.componentInstance as unknown as {
      knownDepartments: () => { id: number; name: string }[];
      getManagerName: (id: number | null) => string;
      onRoleFilterChange: (role: string) => void;
      filteredEmployees: () => EmployeeDto[];
    };

    expect(comp.knownDepartments()).toEqual([{ id: 10, name: 'Engineering' }]);
    expect(comp.getManagerName(1)).toBe('Grace Hopper');

    comp.onRoleFilterChange('Employee');
    expect(comp.filteredEmployees().map((e) => e.employeeCode)).toEqual(['EMP-002']);
  });
});
