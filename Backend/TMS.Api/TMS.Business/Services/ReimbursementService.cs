using TMS.Business.Entities;
using TMS.Business.Enums;
using TMS.Business.Interfaces.Repositories;
using TMS.Business.Interfaces.Services;

namespace TMS.Business.Services;

public class ReimbursementService : IReimbursementService
{
    private readonly IReimbursementRepository _reimbursementRepository;

    public ReimbursementService(
        IReimbursementRepository reimbursementRepository)
    {
        _reimbursementRepository = reimbursementRepository;
    }

    public async Task<List<Reimbursement>> GetEmployeeReimbursementsAsync(
    int employeeId)
    {
        return await _reimbursementRepository
            .GetEmployeeReimbursementsAsync(employeeId);
    }

    public async Task<List<Reimbursement>> GetPendingReimbursementsForFinanceAsync()
    {
        return await _reimbursementRepository
            .GetPendingReimbursementsForFinanceAsync();
    }

    public async Task<Reimbursement?> GetReimbursementByIdAsync(
    int reimbursementId)
    {
        return await _reimbursementRepository
            .GetReimbursementByIdAsync(reimbursementId);
    }

    public async Task<Reimbursement?> RecordReimbursementPaymentAsync(
    int reimbursementId,
    int financeEmployeeId,
    string? paymentReference)
    {
        var reimbursement = await _reimbursementRepository
            .GetReimbursementByIdAsync(reimbursementId);

        if (reimbursement == null)
            return null;

        if (reimbursement.Status != ReimbursementStatus.PendingPayment)
            throw new InvalidOperationException(
                "Only pending reimbursements can be marked as paid.");

        if (paymentReference?.Trim().Length > 100)
            throw new ArgumentException(
                "Payment reference cannot exceed 100 characters.");

        reimbursement.Status = ReimbursementStatus.Paid;
        reimbursement.PaidAtUtc = DateTime.UtcNow;
        reimbursement.PaidByEmployeeId = financeEmployeeId;
        reimbursement.PaymentReference = string.IsNullOrWhiteSpace(paymentReference)
            ? null
            : paymentReference.Trim();

        await _reimbursementRepository.SaveReimbursementChangesAsync();

        return reimbursement;
    }
}