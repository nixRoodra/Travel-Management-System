import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { extractApiErrorMessage } from '../../shared/utilities/http-error.util';
import {
  DepartmentOption,
  EmployeeDto,
  RoleDto,
  SEEDED_GRADE_OPTIONS,
} from './employees.models';
import { EmployeesService } from './employees.service';

@Component({
  selector: 'app-employees-page',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatTableModule,
    PageHeader,
    EmptyState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './employees-page.html',
  styleUrl: './employees-page.scss',
})
export class EmployeesPage implements OnInit {
  private readonly employeesService = inject(EmployeesService);
  private readonly paginator = viewChild(MatPaginator);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly employees = signal<EmployeeDto[]>([]);
  protected readonly roles = signal<RoleDto[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly roleFilter = signal<string>('ALL');
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);

  protected readonly seededGrades = SEEDED_GRADE_OPTIONS;

  protected readonly knownDepartments = computed<DepartmentOption[]>(() => {
    const map = new Map<number, string>();
    for (const emp of this.employees()) {
      if (!map.has(emp.departmentId)) {
        map.set(emp.departmentId, emp.departmentName);
      }
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  protected readonly managerCount = computed(
    () => this.employees().filter((e) => e.roleName === 'Manager').length,
  );

  private readonly employeeNameById = computed(() => {
    const map = new Map<number, string>();
    for (const emp of this.employees()) {
      map.set(emp.employeeId, emp.fullName);
    }
    return map;
  });

  protected readonly filteredEmployees = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const role = this.roleFilter();

    return this.employees().filter((emp) => {
      if (role !== 'ALL' && emp.roleName !== role) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        emp.fullName.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        emp.employeeCode.toLowerCase().includes(query) ||
        emp.departmentName.toLowerCase().includes(query) ||
        emp.designation.toLowerCase().includes(query)
      );
    });
  });

  protected readonly pagedEmployees = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredEmployees().slice(start, start + this.pageSize());
  });

  protected readonly displayedColumns = [
    'employee',
    'employeeCode',
    'role',
    'department',
    'manager',
    'createdAt',
  ];

  ngOnInit(): void {
    this.loadDirectory();
  }

  protected loadDirectory(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      employees: this.employeesService.getAll(),
      roles: this.employeesService.getRoles(),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ employees, roles }) => {
          this.employees.set(employees);
          this.roles.set(roles);
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            extractApiErrorMessage(error, 'Unable to load employee directory.'),
          );
        },
      });
  }

  protected getManagerName(managerId: number | null): string {
    if (managerId === null) {
      return '—';
    }
    return this.employeeNameById().get(managerId) ?? `#${managerId}`;
  }

  protected onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.resetPage();
  }

  protected onRoleFilterChange(roleName: string): void {
    this.roleFilter.set(roleName);
    this.resetPage();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  private resetPage(): void {
    this.pageIndex.set(0);
    this.paginator()?.firstPage();
  }
}
