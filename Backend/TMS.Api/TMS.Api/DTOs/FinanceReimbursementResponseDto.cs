using TMS.Business.Enums;

namespace TMS.Api.DTOs.Responses;

public class FinanceReimbursementResponseDto
{
    public int ReimbursementId { get; set; }
    public int ExpenseClaimId { get; set; }
    public decimal Amount { get; set; }
    public ReimbursementStatus Status { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;

    public string Destination { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
}