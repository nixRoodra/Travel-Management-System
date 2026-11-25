using TMS.Business.Enums;

namespace TMS.Api.DTOs.TravelRequest
{
    public class TravelRequestResponseDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string Destination { get; set; } = string.Empty;
        public string Purpose { get; set; } = string.Empty;
        public TravelMode TravelMode { get; set; }
        public FlightClass? FlightClass { get; set; }
        public TrainClass? TrainClass { get; set; }
        public DateOnly DepartureDate { get; set; }
        public DateOnly ReturnDate { get; set; }
        public decimal EstimatedCost { get; set; }
        public TravelRequestStatus Status { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public DateTime? SubmittedAtUtc { get; set; }
    }
}
