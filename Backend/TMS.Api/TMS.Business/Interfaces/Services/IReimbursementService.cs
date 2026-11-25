using TMS.Business.Entities;

namespace TMS.Business.Interfaces.Services;

public interface IReimbursementService
{
    //Task<Reimbursement> CreateReimbursementForApprovedClaimAsync(int expenseClaimId);

    Task<Reimbursement?> GetReimbursementByIdAsync(int reimbursementId);

    Task<List<Reimbursement>> GetEmployeeReimbursementsAsync(int employeeId);

    Task<List<Reimbursement>> GetPendingReimbursementsForFinanceAsync();

    Task<Reimbursement?> RecordReimbursementPaymentAsync(
        int reimbursementId,
        int financeEmployeeId,
        string? paymentReference);
}