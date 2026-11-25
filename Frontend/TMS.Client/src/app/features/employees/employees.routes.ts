import { Routes } from '@angular/router';

export const EMPLOYEE_ADMIN_ROUTES: Routes = [
  {
    path: '',
    title: 'Employees — TMS Portal',
    loadComponent: () => import('./employees-page').then((m) => m.EmployeesPage),
  },
  {
    path: 'new',
    title: 'Create Employee — TMS Portal',
    loadComponent: () => import('./create-employee-page').then((m) => m.CreateEmployeePage),
  },
];
