import { NavSection } from '../shared/models/navigation.model';

export const NAV_SECTIONS: readonly NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        route: '/dashboard',
        icon: 'dashboard',
        roles: ['Employee', 'Manager', 'Finance', 'Admin'],
      },
    ],
  },
  {
    title: 'My Travel & Expenses',
    items: [
      {
        label: 'Travel Requests',
        route: '/travel-requests',
        icon: 'flight_takeoff',
        roles: ['Employee', 'Manager'],
      },
      {
        label: 'My Trips',
        route: '/my-trips',
        icon: 'luggage',
        roles: ['Employee', 'Manager'],
      },
      {
        label: 'Expense Claims',
        route: '/expense-claims',
        icon: 'receipt_long',
        roles: ['Employee', 'Manager'],
      },
      {
        label: 'Reimbursements',
        route: '/reimbursements',
        icon: 'account_balance_wallet',
        roles: ['Employee', 'Manager'],
      },
    ],
  },
  {
    title: 'Manager',
    items: [
      {
        label: 'Team Approvals',
        route: '/manager/approvals',
        icon: 'fact_check',
        roles: ['Manager'],
      },
    ],
  },
  {
    title: 'Finance',
    items: [
      {
        label: 'Travel Approvals',
        route: '/finance/approvals',
        icon: 'approval',
        roles: ['Finance'],
      },
      {
        label: 'Expense Reviews',
        route: '/finance/expense-reviews',
        icon: 'rate_review',
        roles: ['Finance'],
      },
      {
        label: 'Reimbursements',
        route: '/finance/reimbursements',
        icon: 'payments',
        roles: ['Finance'],
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        label: 'Employees',
        route: '/admin/employees',
        icon: 'group',
        roles: ['Admin'],
      },
    ],
  },
];
