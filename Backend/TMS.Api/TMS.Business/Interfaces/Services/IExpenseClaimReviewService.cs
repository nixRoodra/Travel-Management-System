using TMS.Business.Entities;
using TMS.Business.Models.Expense;

namespace TMS.Business.Interfaces.Services;

public interface IExpenseClaimReviewService
{
    Task<List<ExpenseClaim>> GetSubmittedExpenseClaimsForFinanceAsync();

    Task<ExpenseClaim?> GetExpenseClaimForFinanceReviewAsync(int expenseClaimId);

    Task<List<ExpenseClaimReview>> GetExpenseClaimReviewHistoryAsync(int expenseClaimId);

    Task<ExpenseClaim?> ApproveExpenseClaimAsFinanceAsync(
        int expenseClaimId,
        int financeEmployeeId,
        string? comments);

    Task<ExpenseClaim?> RejectExpenseClaimAsFinanceAsync(
        int expenseClaimId,
        int financeEmployeeId,
        string comments);

    Task<ExpenseClaim?> RequestExpenseClaimResubmissionAsFinanceAsync(
        int expenseClaimId,
        int financeEmployeeId,
        string comments);

    Task<ExpenseReceiptDownload?> DownloadExpenseReceiptForFinanceReviewAsync(
    int expenseClaimId,
    int expenseItemId,
    int receiptId);
}