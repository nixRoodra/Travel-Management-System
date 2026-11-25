using System.ComponentModel.DataAnnotations;
using TMS.Business.Enums;

namespace TMS.Business.Entities
{
    public class TravelRequestPolicyViolation
    {
        public int Id { get; set; }

        public int TravelRequestId { get; set; }

        public int? TravelPolicyId { get; set; }

        public TravelPolicyType PolicyType { get; set; }

        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string ActualValue { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string AllowedValue { get; set; } = string.Empty;

        public DateTime DetectedAtUtc { get; set; }

        public TravelRequest TravelRequest { get; set; } = null!;

        public TravelPolicy? TravelPolicy { get; set; }
    }
}