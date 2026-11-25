using System.ComponentModel.DataAnnotations;
using TMS.Business.Enums;

namespace TMS.Business.Entities
{
    public class TravelRequest
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int EmployeeId { get; set; }

        [Required]
        [MaxLength(150)]
        public string Destination { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Purpose { get; set; } = string.Empty;

        public TravelMode TravelMode { get; set; }

        public FlightClass? FlightClass { get; set; }

        public TrainClass? TrainClass { get; set; }

        [Required]
        public DateOnly DepartureDate { get; set; }

        [Required]
        public DateOnly ReturnDate { get; set; }

        [Required]
        public decimal EstimatedCost { get; set; }

        public TravelRequestStatus Status { get; set; } = TravelRequestStatus.Draft;

        public DateTime CreatedAtUtc { get; set; }

        public DateTime? SubmittedAtUtc { get; set; }

        // Navigation property
        public Employee Employee { get; set; } = null!;
    }
}
