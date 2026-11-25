using TMS.Business.Entities;

namespace TMS.Business.Interfaces.Services
{
    public interface ITravelApprovalService
    {
        Task<List<TravelApproval>> GetPendingManagerApprovalsAsync(int managerEmployeeId);

        Task<TravelApproval?> ApproveTravelRequestAsManagerAsync(
            int travelRequestId,
            int managerEmployeeId,
            string? comments);

        Task<TravelApproval?> RejectTravelRequestAsManagerAsync(
            int travelRequestId,
            int managerEmployeeId,
            string comments);

        Task<List<TravelApproval>> GetManagerApprovalHistoryAsync(int managerEmployeeId);

        Task<List<TravelApproval>> GetPendingFinanceApprovalsAsync();

        Task<TravelApproval?> ApproveTravelRequestAsFinanceAsync(
            int travelRequestId,
            int financeEmployeeId,
            string? comments);

        Task<TravelApproval?> RejectTravelRequestAsFinanceAsync(
            int travelRequestId,
            int financeEmployeeId,
            string comments);

        Task<List<TravelApproval>> GetFinanceApprovalHistoryAsync(int financeEmployeeId);
    }
}