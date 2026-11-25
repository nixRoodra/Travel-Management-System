using TMS.Business.Entities;
using TMS.Business.Models.TravelRequests;

namespace TMS.Business.Interfaces.Repositories
{
    public interface ITravelRequestRepository
    {
        Task<TravelRequest> CreateTravelRequestAsync(TravelRequest travelRequest);

        Task<TravelRequest?> GetTravelRequestByIdAsync(int travelRequestId, int employeeId);

        Task<List<TravelRequest>> GetEmployeeTravelRequestsAsync(int employeeId);

        Task<TravelRequest?> GetTravelRequestForUpdateAsync(int travelRequestId, int employeeId);

        Task SaveTravelRequestSubmissionAsync(TravelRequest travelRequest,
            List<TravelRequestPolicyViolation> policyViolations, TravelApproval managerApproval);

        Task SaveChangesAsync();

    }
}







//Unit of Work