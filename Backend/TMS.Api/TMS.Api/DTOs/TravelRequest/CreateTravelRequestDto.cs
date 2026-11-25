using System.ComponentModel.DataAnnotations;
using TMS.Business.Enums;

namespace TMS.Api.DTOs.TravelRequest
{
    public class CreateTravelRequestDto
    {
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

        [Range(typeof(decimal), "0.01", "9999999999999999.99")]
        public decimal EstimatedCost { get; set; }
    }
}









//CreateTravelRequestDto for both create and update operations