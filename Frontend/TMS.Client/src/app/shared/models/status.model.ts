export type TmsStatus =
  | 'Draft'
  | 'Pending'
  | 'PendingManagerApproval'
  | 'PendingFinanceApproval'
  | 'Approved'
  | 'Rejected'
  | 'Completed'
  | 'Submitted'
  | 'ResubmissionRequested'
  | 'PendingPayment'
  | 'Paid'
  | 'Cancelled';

export interface StatusDisplayMeta {
  label: string;
  cssModifier: string;
  icon: string;
}

const STATUS_META_MAP: Record<TmsStatus, StatusDisplayMeta> = {
  Draft: {
    label: 'Draft',
    cssModifier: 'tms-status-badge--draft',
    icon: 'edit_note',
  },
  Pending: {
    label: 'Pending',
    cssModifier: 'tms-status-badge--pending',
    icon: 'schedule',
  },
  PendingManagerApproval: {
    label: 'Pending Manager Approval',
    cssModifier: 'tms-status-badge--pending-manager',
    icon: 'schedule',
  },
  PendingFinanceApproval: {
    label: 'Pending Finance Approval',
    cssModifier: 'tms-status-badge--pending-finance',
    icon: 'account_balance',
  },
  Approved: {
    label: 'Approved',
    cssModifier: 'tms-status-badge--approved',
    icon: 'check_circle',
  },
  Rejected: {
    label: 'Rejected',
    cssModifier: 'tms-status-badge--rejected',
    icon: 'cancel',
  },
  Completed: {
    label: 'Completed',
    cssModifier: 'tms-status-badge--completed',
    icon: 'task_alt',
  },
  Submitted: {
    label: 'Submitted',
    cssModifier: 'tms-status-badge--submitted',
    icon: 'send',
  },
  ResubmissionRequested: {
    label: 'Resubmission Requested',
    cssModifier: 'tms-status-badge--resubmission-requested',
    icon: 'replay',
  },
  PendingPayment: {
    label: 'Pending Payment',
    cssModifier: 'tms-status-badge--pending-payment',
    icon: 'hourglass_top',
  },
  Paid: {
    label: 'Paid',
    cssModifier: 'tms-status-badge--paid',
    icon: 'payments',
  },
  Cancelled: {
    label: 'Cancelled',
    cssModifier: 'tms-status-badge--cancelled',
    icon: 'block',
  },
};

export function getStatusDisplayMeta(status: TmsStatus | string): StatusDisplayMeta {
  if (status in STATUS_META_MAP) {
    return STATUS_META_MAP[status as TmsStatus];
  }
  return {
    label: status || 'Unknown',
    cssModifier: 'tms-status-badge--draft',
    icon: 'help_outline',
  };
}
