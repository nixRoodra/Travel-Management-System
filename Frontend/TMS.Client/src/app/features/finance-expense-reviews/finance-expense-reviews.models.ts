import {
  ExpenseClaimReviewDecision,
  ExpenseClaimStatus,
} from '../../shared/models/tms-enums.model';

export interface FinanceExpenseClaimQueueDto {
  expenseClaimId: number;
  status: ExpenseClaimStatus;
  submittedAtUtc: string | null;
  employeeName: string;
  employeeCode: string;
  destination: string;
  purpose: string;
  departureDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  totalClaimedAmount: number;
  expenseItemCount: number;
}

export interface FinanceExpenseReceiptDto {
  receiptId: number;
  fileName: string;
  uploadedAtUtc: string;
}

export interface FinanceExpenseItemDto {
  expenseItemId: number;
  expenseDate: string; // YYYY-MM-DD
  description: string;
  amount: number;
  receipts: FinanceExpenseReceiptDto[];
}

export interface FinanceExpenseClaimDetailDto {
  expenseClaimId: number;
  status: ExpenseClaimStatus;
  submittedAtUtc: string;
  employeeName: string;
  employeeCode: string;
  destination: string;
  purpose: string;
  departureDate: string;
  returnDate: string;
  totalClaimedAmount: number;
  expenseItems: FinanceExpenseItemDto[];
}

export interface ExpenseClaimReviewHistoryDto {
  reviewId: number;
  financeEmployeeName: string;
  decision: ExpenseClaimReviewDecision;
  comments: string | null;
  reviewedAtUtc: string;
}
