
using TMS.Business.Entities;

namespace TMS.Business.Interfaces.Repositories;

public interface IExpenseClaimReviewRepository
{
    Task<List<ExpenseClaim>> GetSubmittedExpenseClaimsForFinanceAsync();

    Task<ExpenseClaim?> GetExpenseClaimForFinanceReviewAsync(int expenseClaimId);

    Task<List<ExpenseClaimReview>> GetExpenseClaimReviewHistoryAsync(int expenseClaimId);

    Task SaveFinanceExpenseClaimDecisionAsync(
    ExpenseClaim expenseClaim,
    ExpenseClaimReview review,
    Reimbursement? reimbursement = null);
}
