using TMS.Business.Entities;

namespace TMS.Business.Interfaces.Repositories
{
    public interface ITravelApprovalRepository
    {
        Task<List<TravelApproval>> GetPendingManagerApprovalsAsync(
            int managerEmployeeId);

        Task<TravelApproval?> GetManagerApprovalForReviewAsync(
            int travelRequestId,
            int managerEmployeeId);

        Task SaveManagerApprovalDecisionAsync(
            TravelApproval managerApproval,
            TravelApproval financeApproval);

        Task<List<TravelApproval>> GetManagerApprovalHistoryAsync(
            int managerEmployeeId);

        Task<List<TravelApproval>> GetPendingFinanceApprovalsAsync();

        Task<TravelApproval?> GetFinanceApprovalForReviewAsync(
            int travelRequestId);

        Task SaveFinanceApprovalDecisionAsync(
            TravelApproval approval);
        Task<List<TravelApproval>> GetFinanceApprovalHistoryAsync(
            int financeEmployeeId);
    }

}