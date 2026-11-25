using TMS.Business.Entities;
using TMS.Business.Enums;
using TMS.Business.Interfaces.Repositories;
using TMS.Business.Interfaces.Services;

namespace TMS.Business.Services
{
    public class TravelApprovalService : ITravelApprovalService
    {
        private readonly ITravelApprovalRepository _travelApprovalRepository;

        public TravelApprovalService(
            ITravelApprovalRepository travelApprovalRepository)
        {
            _travelApprovalRepository = travelApprovalRepository;
        }

        public async Task<List<TravelApproval>> GetPendingManagerApprovalsAsync(
            int managerEmployeeId)
        {
            return await _travelApprovalRepository
                .GetPendingManagerApprovalsAsync(managerEmployeeId);
        }

        public async Task<TravelApproval?> ApproveTravelRequestAsManagerAsync(
            int travelRequestId,
            int managerEmployeeId,
            string? comments)
        {
            var approval = await _travelApprovalRepository
                .GetManagerApprovalForReviewAsync(
                    travelRequestId, managerEmployeeId);

            if (approval is null)
                return null;

            ValidatePendingApproval(approval);

            approval.ApprovalStatus = ApprovalStatus.Approved;
            approval.Comments = string.IsNullOrWhiteSpace(comments)
                ? null
                : comments.Trim();
            approval.ActionDateUtc = DateTime.UtcNow;

            approval.TravelRequest.Status =
                TravelRequestStatus.PendingFinanceApproval;

            var financeApproval = new TravelApproval
            {
                TravelRequestId = approval.TravelRequestId,
                ApprovalType = ApprovalType.Finance,
                ApprovalStatus = ApprovalStatus.Pending,
                ApproverEmployeeId = null
            };

            await _travelApprovalRepository
                .SaveManagerApprovalDecisionAsync(approval,financeApproval);

            return approval;
        }

        public async Task<TravelApproval?> RejectTravelRequestAsManagerAsync(
            int travelRequestId,
            int managerEmployeeId,
            string comments)
        {
            if (string.IsNullOrWhiteSpace(comments))
            {
                throw new ArgumentException(
                    "A rejection reason is required.",
                    nameof(comments));
            }

            var approval = await _travelApprovalRepository
                .GetManagerApprovalForReviewAsync(
                    travelRequestId, managerEmployeeId);

            if (approval is null)
                return null;

            ValidatePendingApproval(approval);

            approval.ApprovalStatus = ApprovalStatus.Rejected;
            approval.Comments = comments.Trim();
            approval.ActionDateUtc = DateTime.UtcNow;

            approval.TravelRequest.Status =
                TravelRequestStatus.Rejected;

            await _travelApprovalRepository
                .SaveManagerApprovalDecisionAsync(approval,null);

            return approval;
        }

        public async Task<List<TravelApproval>> GetManagerApprovalHistoryAsync(int managerEmployeeId)
        {
            return await _travelApprovalRepository
                .GetManagerApprovalHistoryAsync(managerEmployeeId);
        }

        public async Task<List<TravelApproval>> GetPendingFinanceApprovalsAsync()
        {
            return await _travelApprovalRepository
                .GetPendingFinanceApprovalsAsync();
        }

        public async Task<TravelApproval?> ApproveTravelRequestAsFinanceAsync(
    int travelRequestId,
    int financeEmployeeId,
    string? comments)
        {
            var approval = await _travelApprovalRepository
                .GetFinanceApprovalForReviewAsync(travelRequestId);

            if (approval is null)
                return null;

            ValidatePendingFinanceApproval(approval);

            approval.ApprovalStatus = ApprovalStatus.Approved;
            approval.ApproverEmployeeId = financeEmployeeId;
            approval.Comments = string.IsNullOrWhiteSpace(comments)
                ? null
                : comments.Trim();
            approval.ActionDateUtc = DateTime.UtcNow;

            approval.TravelRequest.Status = TravelRequestStatus.Approved;

            await _travelApprovalRepository
                .SaveFinanceApprovalDecisionAsync(approval);

            return approval;
        }


        public async Task<TravelApproval?> RejectTravelRequestAsFinanceAsync(
    int travelRequestId,
    int financeEmployeeId,
    string comments)
        {
            if (string.IsNullOrWhiteSpace(comments))
                throw new ArgumentException(
                    "Comments are required when rejecting a travel request.");

            var approval = await _travelApprovalRepository
                .GetFinanceApprovalForReviewAsync(travelRequestId);

            if (approval is null)
                return null;

            ValidatePendingFinanceApproval(approval);

            approval.ApprovalStatus = ApprovalStatus.Rejected;
            approval.ApproverEmployeeId = financeEmployeeId;
            approval.Comments = comments.Trim();
            approval.ActionDateUtc = DateTime.UtcNow;

            approval.TravelRequest.Status = TravelRequestStatus.Rejected;

            await _travelApprovalRepository
                .SaveFinanceApprovalDecisionAsync(approval);

            return approval;
        }


        public async Task<List<TravelApproval>> GetFinanceApprovalHistoryAsync(
            int financeEmployeeId)
        {
            return await _travelApprovalRepository
                .GetFinanceApprovalHistoryAsync(financeEmployeeId);
        }


        //helper

        private static void ValidatePendingApproval(
            TravelApproval approval)
        {
            if (approval.ApprovalStatus != ApprovalStatus.Pending ||
                approval.TravelRequest.Status !=
                    TravelRequestStatus.PendingManagerApproval)
            {
                throw new InvalidOperationException(
                    "This travel request is no longer awaiting manager approval.");
            }

            if (approval.TravelRequest.EmployeeId == approval.ApproverEmployeeId)
            {
                throw new InvalidOperationException(
                    "Employees cannot approve their own travel requests.");
            }
        }

        private static void ValidatePendingFinanceApproval(TravelApproval approval)
        {
            if (approval.ApprovalStatus != ApprovalStatus.Pending ||
                approval.TravelRequest.Status !=
                TravelRequestStatus.PendingFinanceApproval)
            {
                throw new InvalidOperationException(
                    "This travel request is no longer pending Finance approval.");
            }
        }
    }
}