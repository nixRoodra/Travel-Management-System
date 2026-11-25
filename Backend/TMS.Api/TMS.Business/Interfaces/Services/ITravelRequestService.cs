using TMS.Business.Entities;
using TMS.Business.Models.TravelRequests;

namespace TMS.Business.Interfaces.Services
{
    public interface ITravelRequestService
    {
        Task<TravelRequest> CreateTravelRequestAsync(CreateTravelRequestCommand command);

        Task<TravelRequest?> GetTravelRequestByIdAsync(int travelRequestId,int employeeId);

        Task<List<TravelRequest>> GetEmployeeTravelRequestsAsync(int employeeId);

        Task<TravelRequest?> UpdateTravelRequestAsync(int travelRequestId, CreateTravelRequestCommand command);

        Task<TravelRequest?> SubmitTravelRequestAsync(int travelRequestId,int employeeId);
    }
}