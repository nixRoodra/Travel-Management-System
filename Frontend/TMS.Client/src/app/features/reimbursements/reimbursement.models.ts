import { ReimbursementStatus } from '../../shared/models/tms-enums.model';

export interface EmployeeReimbursementDto {
  reimbursementId: number;
  expenseClaimId: number;
  amount: number;
  status: ReimbursementStatus;
  createdAtUtc: string;
  paidAtUtc: string | null;
  paymentReference: string | null;
  destination: string;
  purpose: string;
}
