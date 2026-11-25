using TMS.Business.Entities;

namespace TMS.Business.Interfaces.Repositories;

public interface IReimbursementRepository
{
    Task<Reimbursement?> GetReimbursementByExpenseClaimIdAsync(int expenseClaimId);

    Task<Reimbursement?> GetReimbursementByIdAsync(int reimbursementId);

    Task<List<Reimbursement>> GetEmployeeReimbursementsAsync(int employeeId);

    Task<List<Reimbursement>> GetPendingReimbursementsForFinanceAsync();

    Task<Reimbursement> CreateReimbursementAsync(Reimbursement reimbursement);

    Task SaveReimbursementChangesAsync();
}