import { ExpenseClaimStatus } from '../../shared/models/tms-enums.model';

export interface ExpenseReceiptDto {
  id: number;
  fileName: string;
  uploadedAtUtc: string;
}

export interface ExpenseItemDto {
  id: number;
  expenseDate: string; // YYYY-MM-DD (DateOnly)
  description: string;
  amount: number;
  receipts: ExpenseReceiptDto[];
}

export interface ExpenseClaimDto {
  id: number;
  travelRequestId: number;
  status: ExpenseClaimStatus;
  createdAtUtc: string;
  submittedAtUtc: string | null;
  expenseItems: ExpenseItemDto[];
}

export interface ExpenseItemUpsertPayload {
  expenseDate: string; // YYYY-MM-DD (DateOnly)
  description: string;
  amount: number;
}
