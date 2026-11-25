using System.ComponentModel.DataAnnotations;
using TMS.Business.Enums;

namespace TMS.Business.Entities
{
    public class TravelPolicy
    {
        public int Id { get; set; }

        [Required,MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public TravelPolicyType PolicyType { get; set; }

        public decimal? NumericValue { get; set; }

        public FlightClass? FlightClass { get; set; }

        public TrainClass? TrainClass { get; set; }

        [Required, MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public int? GradeId { get; set; }
        public EmployeeGrade? Grade { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime EffectiveFromUtc { get; set; }

        public DateTime? EffectiveToUtc { get; set; }
    }
}
