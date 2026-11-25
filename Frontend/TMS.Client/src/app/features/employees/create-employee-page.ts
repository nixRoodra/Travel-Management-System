import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
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
  selector: 'app-create-employee-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    PageHeader,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-employee-page.html',
  styleUrl: './create-employee-page.scss',
})
export class CreateEmployeePage implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly employeesService = inject(EmployeesService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  protected readonly isLoadingLookups = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly hidePassword = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly roles = signal<RoleDto[]>([]);
  protected readonly employees = signal<EmployeeDto[]>([]);
  protected readonly useManualDepartmentId = signal(false);

  protected readonly gradeOptions = SEEDED_GRADE_OPTIONS;

  protected readonly managers = computed(() =>
    this.employees().filter((e) => e.roleName === 'Manager'),
  );

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

  protected readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    employeeCode: ['', [Validators.required, Validators.maxLength(30)]],
    roleId: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    departmentId: this.fb.control<number | null>(1, [Validators.required, Validators.min(1)]),
    designation: ['', [Validators.required, Validators.maxLength(100)]],
    gradeId: this.fb.control<number>(1, [Validators.required, Validators.min(1)]),
    managerId: this.fb.control<number | null>(null),
  });

  ngOnInit(): void {
    this.loadLookups();
  }

  protected loadLookups(): void {
    this.isLoadingLookups.set(true);
    forkJoin({
      roles: this.employeesService.getRoles(),
      employees: this.employeesService.getAll(),
    })
      .pipe(finalize(() => this.isLoadingLookups.set(false)))
      .subscribe({
        next: ({ roles, employees }) => {
          this.roles.set(roles);
          this.employees.set(employees);

          if (!this.form.controls.roleId.value && roles.length > 0) {
            const employeeRole = roles.find((r) => r.name === 'Employee') ?? roles[0];
            this.form.controls.roleId.setValue(employeeRole.id);
          }

          const depts = this.knownDepartments();
          if (depts.length === 0) {
            this.useManualDepartmentId.set(true);
          } else {
            this.form.controls.departmentId.setValue(depts[0].id);
          }
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            extractApiErrorMessage(error, 'Unable to load roles and employee reference data.'),
          );
        },
      });
  }

  protected togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }

  protected toggleManualDepartment(): void {
    this.useManualDepartmentId.update((v) => !v);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    if (raw.roleId === null || raw.departmentId === null) {
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.employeesService
      .create({
        fullName: raw.fullName.trim(),
        email: raw.email.trim(),
        password: raw.password,
        employeeCode: raw.employeeCode.trim(),
        roleId: raw.roleId,
        departmentId: raw.departmentId,
        designation: raw.designation.trim(),
        gradeId: raw.gradeId,
        managerId: raw.managerId,
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (created) => {
          this.notifications.success(`Created employee ${created.fullName} (${created.employeeCode}).`);
          void this.router.navigateByUrl('/admin/employees');
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            extractApiErrorMessage(error, 'Failed to create employee account.'),
          );
        },
      });
  }
}
