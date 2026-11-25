
using TMS.Business.Entities;
using TMS.Business.Enums;
using TMS.Business.Interfaces.Repositories;
using TMS.Business.Interfaces.Services;
using TMS.Business.Models.Expense;

namespace TMS.Business.Services;

public class ExpenseClaimReviewService : IExpenseClaimReviewService
{
    private readonly IExpenseClaimReviewRepository _expenseClaimReviewRepository;
    private readonly IExpenseReceiptStorage _expenseReceiptStorage;

    public ExpenseClaimReviewService(
        IExpenseClaimReviewRepository expenseClaimReviewRepository,
        IExpenseReceiptStorage expenseReceiptStorage)
    {
        _expenseClaimReviewRepository = expenseClaimReviewRepository;
        _expenseReceiptStorage = expenseReceiptStorage;
    }

    public async Task<List<ExpenseClaim>> GetSubmittedExpenseClaimsForFinanceAsync()
    {
        return await _expenseClaimReviewRepository
            .GetSubmittedExpenseClaimsForFinanceAsync();
    }

    public async Task<ExpenseClaim?> GetExpenseClaimForFinanceReviewAsync(
    int expenseClaimId)
    {
        return await _expenseClaimReviewRepository
            .GetExpenseClaimForFinanceReviewAsync(expenseClaimId);
    }

    public async Task<List<ExpenseClaimReview>> GetExpenseClaimReviewHistoryAsync(
    int expenseClaimId)
    {
        return await _expenseClaimReviewRepository
            .GetExpenseClaimReviewHistoryAsync(expenseClaimId);
    }

    public async Task<ExpenseClaim?> ApproveExpenseClaimAsFinanceAsync(
    int expenseClaimId,
    int financeEmployeeId,
    string? comments)
    {
        var expenseClaim = await _expenseClaimReviewRepository
            .GetExpenseClaimForFinanceReviewAsync(expenseClaimId);

        if (expenseClaim == null)
            return null;

        expenseClaim.Status = ExpenseClaimStatus.Approved;

        var review = new ExpenseClaimReview
        {
            ExpenseClaimId = expenseClaim.Id,
            FinanceEmployeeId = financeEmployeeId,
            Decision = ExpenseClaimReviewDecision.Approved,
            Comments = string.IsNullOrWhiteSpace(comments)
                ? null
                : comments.Trim(),
            ReviewedAtUtc = DateTime.UtcNow
        };

        var reimbursement = new Reimbursement
        {
            ExpenseClaimId = expenseClaim.Id,
            Amount = expenseClaim.ExpenseItems.Sum(item => item.Amount),
            Status = ReimbursementStatus.PendingPayment,
            CreatedAtUtc = DateTime.UtcNow
        };

        await _expenseClaimReviewRepository
            .SaveFinanceExpenseClaimDecisionAsync(expenseClaim, review,reimbursement);

        return expenseClaim;
    }

    public async Task<ExpenseClaim?> RejectExpenseClaimAsFinanceAsync(
    int expenseClaimId,
    int financeEmployeeId,
    string comments)
    {
        if (string.IsNullOrWhiteSpace(comments))
            throw new ArgumentException("Rejection comments are required.");

        var expenseClaim = await _expenseClaimReviewRepository
            .GetExpenseClaimForFinanceReviewAsync(expenseClaimId);

        if (expenseClaim == null)
            return null;

        expenseClaim.Status = ExpenseClaimStatus.Rejected;

        var review = new ExpenseClaimReview
        {
            ExpenseClaimId = expenseClaim.Id,
            FinanceEmployeeId = financeEmployeeId,
            Decision = ExpenseClaimReviewDecision.Rejected,
            Comments = comments.Trim(),
            ReviewedAtUtc = DateTime.UtcNow
        };

        await _expenseClaimReviewRepository
            .SaveFinanceExpenseClaimDecisionAsync(expenseClaim, review);

        return expenseClaim;
    }


    public async Task<ExpenseClaim?> RequestExpenseClaimResubmissionAsFinanceAsync(
    int expenseClaimId,
    int financeEmployeeId,
    string comments)
    {
        if (string.IsNullOrWhiteSpace(comments))
            throw new ArgumentException("Resubmission comments are required.");

        var expenseClaim = await _expenseClaimReviewRepository
            .GetExpenseClaimForFinanceReviewAsync(expenseClaimId);

        if (expenseClaim == null)
            return null;

        expenseClaim.Status = ExpenseClaimStatus.ResubmissionRequested;

        var review = new ExpenseClaimReview
        {
            ExpenseClaimId = expenseClaim.Id,
            FinanceEmployeeId = financeEmployeeId,
            Decision = ExpenseClaimReviewDecision.ResubmissionRequested,
            Comments = comments.Trim(),
            ReviewedAtUtc = DateTime.UtcNow
        };

        await _expenseClaimReviewRepository
            .SaveFinanceExpenseClaimDecisionAsync(expenseClaim, review);

        return expenseClaim;
    }

    public async Task<ExpenseReceiptDownload?> DownloadExpenseReceiptForFinanceReviewAsync(
    int expenseClaimId,
    int expenseItemId,
    int receiptId)
    {
        var expenseClaim = await _expenseClaimReviewRepository
            .GetExpenseClaimForFinanceReviewAsync(expenseClaimId);

        if (expenseClaim == null)
            return null;

        var expenseItem = expenseClaim.ExpenseItems
            .FirstOrDefault(item => item.Id == expenseItemId);

        if (expenseItem == null)
            return null;

        var receipt = expenseItem.Receipts
            .FirstOrDefault(receipt => receipt.Id == receiptId);

        if (receipt == null)
            return null;

        var fileStream = await _expenseReceiptStorage
            .OpenExpenseReceiptAsync(receipt.FilePath);

        if (fileStream == null)
            return null;

        return new ExpenseReceiptDownload
        {
            FileStream = fileStream,
            FileName = receipt.FileName
        };
    }

}
