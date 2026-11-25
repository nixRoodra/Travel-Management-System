using System.ComponentModel.DataAnnotations;

namespace TMS.Api.DTOs.FinanceExpenseClaimReview
{
    public class ApproveExpenseClaimRequestDto
    {
        [MaxLength(1000)]
        public string? Comments { get; set; }
    }
}
