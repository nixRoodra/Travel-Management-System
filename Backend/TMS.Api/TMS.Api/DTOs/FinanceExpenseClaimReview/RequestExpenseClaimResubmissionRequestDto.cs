using System.ComponentModel.DataAnnotations;

namespace TMS.Api.DTOs.FinanceExpenseClaimReview;

public class RequestExpenseClaimResubmissionRequestDto
{
    [Required]
    [StringLength(1000, MinimumLength = 1)]
    public string Comments { get; set; } = string.Empty;
}