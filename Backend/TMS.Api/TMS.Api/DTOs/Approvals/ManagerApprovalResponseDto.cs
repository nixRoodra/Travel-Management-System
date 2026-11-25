using TMS.Api.DTOs.TravelRequest;
using TMS.Business.Enums;

namespace TMS.Api.DTOs.Approvals
{
    public class ManagerApprovalResponseDto
    {
        public int Id { get; set; }

        public int TravelRequestId { get; set; }

        public ApprovalType ApprovalType { get; set; }

        public ApprovalStatus ApprovalStatus { get; set; }

        public string? Comments { get; set; }

        public DateTime CreatedAtUtc { get; set; }

        public DateTime? ActionDateUtc { get; set; }

        public string EmployeeName { get; set; } = string.Empty;

        public string EmployeeCode { get; set; } = string.Empty;

        public TravelRequestResponseDto TravelRequest { get; set; } = null!;
    }
}