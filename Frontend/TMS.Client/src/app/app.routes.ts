import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AuthLayout } from './layout/layouts/auth-layout/auth-layout';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayout,
    canActivate: [guestGuard],
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        title: 'Sign In — TMS Portal',
        loadComponent: () =>
          import('./features/auth/login/login-page').then((m) => m.LoginPage),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/layouts/app-shell/app-shell').then((m) => m.AppShell),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: 'Dashboard — TMS Portal',
        loadComponent: () =>
          import('./features/dashboard/dashboard-page').then((m) => m.DashboardPage),
      },
      {
        path: 'travel-requests',
        canActivate: [roleGuard],
        data: { roles: ['Employee', 'Manager'] },
        loadChildren: () =>
          import('./features/travel-requests/travel-requests.routes').then(
            (m) => m.TRAVEL_REQUEST_ROUTES,
          ),
      },
      {
        path: 'my-trips',
        title: 'My Trips — TMS Portal',
        canActivate: [roleGuard],
        data: { roles: ['Employee', 'Manager'] },
        loadComponent: () =>
          import('./features/my-trips/my-trips-page').then((m) => m.MyTripsPage),
      },
      {
        path: 'expense-claims',
        title: 'Expense Claims — TMS Portal',
        canActivate: [roleGuard],
        data: { roles: ['Employee', 'Manager'] },
        loadComponent: () =>
          import('./features/expense-claims/expense-claims-page').then((m) => m.ExpenseClaimsPage),
      },
      {
        path: 'reimbursements',
        title: 'Reimbursements — TMS Portal',
        canActivate: [roleGuard],
        data: { roles: ['Employee', 'Manager'] },
        loadComponent: () =>
          import('./features/reimbursements/reimbursements-page').then(
            (m) => m.ReimbursementsPage,
          ),
      },
      {
        path: 'manager/approvals',
        title: 'Team Approvals — TMS Portal',
        canActivate: [roleGuard],
        data: { roles: ['Manager'] },
        loadComponent: () =>
          import('./features/manager-approvals/manager-approvals-page').then(
            (m) => m.ManagerApprovalsPage,
          ),
      },
      {
        path: 'finance/approvals',
        title: 'Finance Travel Approvals — TMS Portal',
        canActivate: [roleGuard],
        data: { roles: ['Finance'] },
        loadComponent: () =>
          import('./features/finance-approvals/finance-approvals-page').then(
            (m) => m.FinanceApprovalsPage,
          ),
      },
      {
        path: 'finance/expense-reviews',
        canActivate: [roleGuard],
        data: { roles: ['Finance'] },
        loadChildren: () =>
          import('./features/finance-expense-reviews/finance-expense-reviews.routes').then(
            (m) => m.FINANCE_EXPENSE_REVIEW_ROUTES,
          ),
      },
      {
        path: 'finance/reimbursements',
        canActivate: [roleGuard],
        data: { roles: ['Finance'] },
        loadChildren: () =>
          import('./features/finance-reimbursements/finance-reimbursements.routes').then(
            (m) => m.FINANCE_REIMBURSEMENT_ROUTES,
          ),
      },
      {
        path: 'admin/employees',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        loadChildren: () =>
          import('./features/employees/employees.routes').then((m) => m.EMPLOYEE_ADMIN_ROUTES),
      },
      {
        path: 'forbidden',
        title: 'Access Denied — TMS Portal',
        loadComponent: () =>
          import('./shared/components/forbidden-page/forbidden-page').then(
            (m) => m.ForbiddenPage,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
