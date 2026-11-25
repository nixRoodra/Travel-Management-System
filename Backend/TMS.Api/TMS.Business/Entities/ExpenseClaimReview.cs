
using System.ComponentModel.DataAnnotations;
using TMS.Business.Enums;

namespace TMS.Business.Entities;

public class ExpenseClaimReview
{
    public int Id { get; set; }

    public int ExpenseClaimId { get; set; }

    public int FinanceEmployeeId { get; set; }

    public ExpenseClaimReviewDecision Decision { get; set; }

    [MaxLength(1000)]
    public string? Comments { get; set; }

    public DateTime ReviewedAtUtc { get; set; }

    public ExpenseClaim ExpenseClaim { get; set; } = null!;

    public Employee FinanceEmployee { get; set; } = null!;
}
