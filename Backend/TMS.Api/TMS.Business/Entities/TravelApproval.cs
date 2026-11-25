using System.ComponentModel.DataAnnotations;
using TMS.Business.Enums;

namespace TMS.Business.Entities
{
    public class TravelApproval
    {
        [Key]
        public int Id { get; set; }

        public int TravelRequestId { get; set; }

        public ApprovalType ApprovalType { get; set; }

        public ApprovalStatus ApprovalStatus { get; set; }
            = ApprovalStatus.Pending;

        public int? ApproverEmployeeId { get; set; }

        [MaxLength(1000)]
        public string? Comments { get; set; }

        public DateTime CreatedAtUtc { get; set; }

        public DateTime? ActionDateUtc { get; set; }

        [Timestamp]
        public byte[] RowVersion { get; set; } = null!;

        public TravelRequest TravelRequest { get; set; } = null!;

        public Employee? ApproverEmployee { get; set; }
    }
}