using Microsoft.EntityFrameworkCore;
using TMS.Business.Entities;
using TMS.Business.Interfaces.Repositories;
using TMS.Data.Context;

namespace TMS.Data.Repositories
{
    public class TravelRequestRepository:ITravelRequestRepository
    {
        private readonly ApplicationDbContext _context;
        public TravelRequestRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TravelRequest> CreateTravelRequestAsync(TravelRequest travelRequest)
        {
            await _context.TravelRequests.AddAsync(travelRequest);
            await _context.SaveChangesAsync();

            return travelRequest;
        }

        public async Task<TravelRequest?> GetTravelRequestByIdAsync(int travelRequestId,int employeeId)
        {
            return await _context.TravelRequests
                .AsNoTracking()
                .FirstOrDefaultAsync(tr =>
                    tr.Id == travelRequestId &&
                    tr.EmployeeId == employeeId);
        }

        public async Task<List<TravelRequest>> GetEmployeeTravelRequestsAsync(int employeeId)
        {
            return await _context.TravelRequests
                .AsNoTracking()
                .Where(tr=> tr.EmployeeId==employeeId)
                .OrderByDescending(tr=> tr.CreatedAtUtc)
                .ToListAsync();
        }

        public async Task<TravelRequest?> GetTravelRequestForUpdateAsync(int travelRequestId, int employeeId)
        {
            return await _context.TravelRequests
                .Include(tr=> tr.Employee)
                .FirstOrDefaultAsync(tr =>
                    tr.Id == travelRequestId &&
                    tr.EmployeeId == employeeId);                
        }

        public async Task SaveTravelRequestSubmissionAsync(TravelRequest travelRequest,
            List<TravelRequestPolicyViolation> policyViolations, TravelApproval managerApproval)
        {
            //_context.TravelRequests.Update(travelRequest);

            await _context.TravelRequestPolicyViolations
                .AddRangeAsync(policyViolations);

            await _context.TravelApprovals
                .AddAsync(managerApproval);

            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync() 
        {
            await _context.SaveChangesAsync();
        }
    }
}
