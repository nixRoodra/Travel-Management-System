import { Routes } from '@angular/router';

export const FINANCE_REIMBURSEMENT_ROUTES: Routes = [
  {
    path: '',
    title: 'Finance Reimbursements — TMS Portal',
    loadComponent: () =>
      import('./finance-reimbursements-page').then((m) => m.FinanceReimbursementsPage),
  },
  {
    path: ':id',
    title: 'Reimbursement Details — TMS Portal',
    loadComponent: () =>
      import('./finance-reimbursement-detail-page').then(
        (m) => m.FinanceReimbursementDetailPage,
      ),
  },
];
