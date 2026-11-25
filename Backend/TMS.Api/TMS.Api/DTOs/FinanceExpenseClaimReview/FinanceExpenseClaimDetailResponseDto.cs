using TMS.Business.Enums;

namespace TMS.Api.DTOs.FinanceExpenseClaimReview;

public class FinanceExpenseClaimDetailResponseDto
{
    public int ExpenseClaimId { get; set; }

    public ExpenseClaimStatus Status { get; set; }

    public DateTime SubmittedAtUtc { get; set; }

    public string EmployeeName { get; set; } = string.Empty;

    public string EmployeeCode { get; set; } = string.Empty;

    public string Destination { get; set; } = string.Empty;

    public string Purpose { get; set; } = string.Empty;

    public DateOnly DepartureDate { get; set; }

    public DateOnly ReturnDate { get; set; }

    public decimal TotalClaimedAmount { get; set; }

    public List<FinanceExpenseItemResponseDto> ExpenseItems { get; set; } = new();
}