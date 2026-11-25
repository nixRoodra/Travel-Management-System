import { ReimbursementStatus } from '../../shared/models/tms-enums.model';

export interface FinanceReimbursementDto {
  reimbursementId: number;
  expenseClaimId: number;
  amount: number;
  status: ReimbursementStatus;
  createdAtUtc: string;
  employeeName: string;
  employeeCode: string;
  destination: string;
  purpose: string;
}

export interface ReimbursementDetailDto {
  reimbursementId: number;
  expenseClaimId: number;
  amount: number;
  status: ReimbursementStatus;
  createdAtUtc: string;
  paidAtUtc: string | null;
  paymentReference: string | null;
  paidByEmployeeName: string | null;
  employeeName: string;
  employeeCode: string;
  destination: string;
  purpose: string;
}

export interface RecordReimbursementPaymentPayload {
  paymentReference?: string | null;
}
