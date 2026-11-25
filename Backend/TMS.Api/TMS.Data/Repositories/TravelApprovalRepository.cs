using Microsoft.EntityFrameworkCore;
using TMS.Business.Entities;
using TMS.Business.Enums;
using TMS.Business.Interfaces.Repositories;
using TMS.Data.Context;

namespace TMS.Data.Repositories
{
    public class TravelApprovalRepository : ITravelApprovalRepository
    {
        private readonly ApplicationDbContext _context;

        public TravelApprovalRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<TravelApproval>> GetPendingManagerApprovalsAsync(
            int managerEmployeeId)
        {
            return await _context.TravelApprovals
                .AsNoTracking()
                .Include(approval => approval.TravelRequest)
                    .ThenInclude(request => request.Employee)
                        .ThenInclude(employee => employee.User)
                .Where(approval =>
                    approval.ApprovalType == ApprovalType.Manager &&
                    approval.ApprovalStatus == ApprovalStatus.Pending &&
                    approval.ApproverEmployeeId == managerEmployeeId)
                .OrderBy(approval => approval.CreatedAtUtc)
                .ToListAsync();
        }

        public async Task<TravelApproval?> GetManagerApprovalForReviewAsync(
            int travelRequestId,
            int managerEmployeeId)
        {
            return await _context.TravelApprovals
                .Include(approval => approval.TravelRequest)
                    .ThenInclude(request => request.Employee)
                        .ThenInclude(employee => employee.User)
                .FirstOrDefaultAsync(approval =>
                    approval.TravelRequestId == travelRequestId &&
                    approval.ApprovalType == ApprovalType.Manager &&
                    approval.ApproverEmployeeId == managerEmployeeId);
        }

        public async Task SaveManagerApprovalDecisionAsync(
            TravelApproval managerApproval,
            TravelApproval financeApproval)
        {
            if (financeApproval is not null)
            {
                _context.TravelApprovals.Add(financeApproval);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<List<TravelApproval>> GetManagerApprovalHistoryAsync(int managerEmployeeId)
        {
            return await _context.TravelApprovals
                .AsNoTracking()
                .Include(approval => approval.TravelRequest)
                    .ThenInclude(request => request.Employee)
                .Where(approval =>
                    approval.ApprovalType == ApprovalType.Manager &&
                    approval.ApproverEmployeeId == managerEmployeeId &&
                    approval.ApprovalStatus != ApprovalStatus.Pending)
                .OrderByDescending(approval => approval.ActionDateUtc)
                .ThenByDescending(approval => approval.Id)
                .ToListAsync();
        }

        public async Task<List<TravelApproval>> GetPendingFinanceApprovalsAsync()
        {
            return await _context.TravelApprovals
                .AsNoTracking()
                .Include(tr => tr.TravelRequest)
                    .ThenInclude(r => r.Employee)
                        .ThenInclude(e => e.User)
                .Where(approval =>
                    approval.ApprovalType == ApprovalType.Finance &&
                    approval.ApprovalStatus == ApprovalStatus.Pending &&
                    approval.ApproverEmployeeId == null)
                .OrderBy(a => a.CreatedAtUtc)
                .ToListAsync();
        }

        public async Task<TravelApproval?> GetFinanceApprovalForReviewAsync(
            int travelRequestId)
        {
            return await _context.TravelApprovals
                .Include(a => a.TravelRequest)
                .Where(a =>
                    a.TravelRequestId == travelRequestId &&
                    a.ApprovalType == ApprovalType.Finance)
                .OrderByDescending(a => a.CreatedAtUtc)
                .ThenByDescending(a => a.Id)
                .FirstOrDefaultAsync();
        }

        public async Task SaveFinanceApprovalDecisionAsync(TravelApproval approval)
        {
            await _context.SaveChangesAsync();
        }

        public async Task<List<TravelApproval>> GetFinanceApprovalHistoryAsync(
            int financeEmployeeId)
        {
            return await _context.TravelApprovals
                .AsNoTracking()
                .Include(approval => approval.TravelRequest)
                    .ThenInclude(request => request.Employee)
                        .ThenInclude(employee => employee.User)
                .Where(approval =>
                    approval.ApprovalType == ApprovalType.Finance &&
                    approval.ApproverEmployeeId == financeEmployeeId &&
                    approval.ApprovalStatus != ApprovalStatus.Pending)
                .OrderByDescending(approval => approval.ActionDateUtc)
                .ThenByDescending(approval => approval.Id)
                .ToListAsync();
        }
    }
}