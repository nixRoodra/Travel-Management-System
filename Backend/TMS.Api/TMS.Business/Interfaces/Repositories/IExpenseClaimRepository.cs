using TMS.Business.Entities;

namespace TMS.Business.Interfaces.Repositories
{
    public interface IExpenseClaimRepository
    {
        Task<ExpenseClaim?> GetExpenseClaimByTravelRequestIdAsync(
            int travelRequestId);

        Task<ExpenseClaim?> GetExpenseClaimForEmployeeAsync(
            int travelRequestId,
            int employeeId);

        Task<ExpenseClaim> CreateExpenseClaimAsync(
            ExpenseClaim expenseClaim);

        Task SaveExpenseClaimChangesAsync();

    }
}
