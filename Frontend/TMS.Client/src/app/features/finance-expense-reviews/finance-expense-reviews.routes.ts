import { Routes } from '@angular/router';

export const FINANCE_EXPENSE_REVIEW_ROUTES: Routes = [
  {
    path: '',
    title: 'Expense Claim Reviews — TMS Portal',
    loadComponent: () =>
      import('./finance-expense-reviews-queue-page').then(
        (m) => m.FinanceExpenseReviewsQueuePage,
      ),
  },
  {
    path: ':id',
    title: 'Inspect Expense Claim — TMS Portal',
    loadComponent: () =>
      import('./finance-expense-review-detail-page').then(
        (m) => m.FinanceExpenseReviewDetailPage,
      ),
  },
];
