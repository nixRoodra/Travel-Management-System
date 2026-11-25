using TMS.Business.Entities;
using TMS.Business.Models.Expense;

namespace TMS.Business.Interfaces.Services;

public interface IExpenseClaimService
{
    Task<ExpenseClaim> CreateExpenseClaimForTripAsync(
        int travelRequestId,
        int employeeId);

    Task<ExpenseClaim?> GetExpenseClaimForTripAsync(
        int travelRequestId,
        int employeeId);

    Task<ExpenseItem?> AddExpenseItemToClaimAsync(
        int travelRequestId,
        int employeeId,
        AddExpenseItemCommand command);

    Task<ExpenseReceipt?> UploadExpenseReceiptAsync(
        int travelRequestId,
        int expenseItemId,
        int employeeId,
        UploadExpenseReceiptCommand command);

    Task<ExpenseReceiptDownload?> DownloadExpenseReceiptAsync(
        int travelRequestId,
        int expenseItemId,
        int receiptId,
        int employeeId);

    Task<ExpenseItem?> UpdateExpenseItemInClaimAsync(
        int travelRequestId,
        int expenseItemId,
        int employeeId,
        UpdateExpenseItemCommand command);

    Task<bool> DeleteExpenseItemFromClaimAsync(
        int travelRequestId,
        int expenseItemId,
        int employeeId);

    Task<ExpenseClaim?> SubmitExpenseClaimForFinanceReviewAsync(
        int travelRequestId,
        int employeeId);
}