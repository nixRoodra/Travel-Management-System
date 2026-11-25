using Microsoft.EntityFrameworkCore;
using TMS.Business.Entities;
using TMS.Business.Enums;
using TMS.Business.Interfaces.Repositories;
using TMS.Data.Context;

namespace TMS.Data.Repositories;

public class ReimbursementRepository : IReimbursementRepository
{
    private readonly ApplicationDbContext _context;

    public ReimbursementRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Reimbursement?> GetReimbursementByExpenseClaimIdAsync(
    int expenseClaimId)
    {
        return await _context.Reimbursements
            .FirstOrDefaultAsync(reimbursement =>
                reimbursement.ExpenseClaimId == expenseClaimId);
    }

    public async Task<Reimbursement?> GetReimbursementByIdAsync(int reimbursementId)
    {
        return await _context.Reimbursements
            .Include(reimbursement => reimbursement.ExpenseClaim)
                .ThenInclude(claim => claim.TravelRequest)
                    .ThenInclude(request => request.Employee)
                        .ThenInclude(employee => employee.User)
            .Include(reimbursement => reimbursement.PaidByEmployee)
                .ThenInclude(employee => employee!.User)
            .FirstOrDefaultAsync(reimbursement => reimbursement.Id == reimbursementId);
    }

    public async Task<List<Reimbursement>> GetEmployeeReimbursementsAsync(
    int employeeId)
    {
        return await _context.Reimbursements
            .AsNoTracking()
            .Include(reimbursement => reimbursement.ExpenseClaim)
                .ThenInclude(claim => claim.TravelRequest)
            .Where(reimbursement =>
                reimbursement.ExpenseClaim.TravelRequest.EmployeeId == employeeId)
            .OrderByDescending(reimbursement => reimbursement.CreatedAtUtc)
            .ToListAsync();
    }

    public async Task<List<Reimbursement>> GetPendingReimbursementsForFinanceAsync()
    {
        return await _context.Reimbursements
            .AsNoTracking()
            .Include(reimbursement => reimbursement.ExpenseClaim)
                .ThenInclude(claim => claim.TravelRequest)
                    .ThenInclude(request => request.Employee)
                        .ThenInclude(employee => employee.User)
            .Where(reimbursement =>
                reimbursement.Status == ReimbursementStatus.PendingPayment)
            .OrderBy(reimbursement => reimbursement.CreatedAtUtc)
            .ToListAsync();
    }

    public async Task<Reimbursement> CreateReimbursementAsync(
    Reimbursement reimbursement)
    {
        await _context.Reimbursements.AddAsync(reimbursement);

        await _context.SaveChangesAsync();

        return reimbursement;
    }

    public async Task SaveReimbursementChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}