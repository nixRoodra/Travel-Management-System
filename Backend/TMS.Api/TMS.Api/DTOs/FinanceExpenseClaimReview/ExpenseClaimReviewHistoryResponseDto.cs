using TMS.Business.Enums;

namespace TMS.Api.DTOs.FinanceExpenseClaimReview;

public class ExpenseClaimReviewHistoryResponseDto
{
    public int ReviewId { get; set; }

    public string FinanceEmployeeName { get; set; } = string.Empty;

    public ExpenseClaimReviewDecision Decision { get; set; }

    public string? Comments { get; set; }

    public DateTime ReviewedAtUtc { get; set; }
}