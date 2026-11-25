using System.ComponentModel.DataAnnotations;

namespace TMS.Api.DTOs.Approvals
{
    public class ApproveTravelRequestDto
    {
        [MaxLength(1000)]
        public string? Comments { get; set; }
    }
}