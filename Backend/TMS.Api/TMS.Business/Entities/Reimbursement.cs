using System.ComponentModel.DataAnnotations;
using TMS.Business.Enums;

namespace TMS.Business.Entities;

public class Reimbursement
{
    public int Id { get; set; }

    public int ExpenseClaimId { get; set; }

    public decimal Amount { get; set; }

    public ReimbursementStatus Status { get; set; }
        = ReimbursementStatus.PendingPayment;

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? PaidAtUtc { get; set; }

    [MaxLength(100)]
    public string? PaymentReference { get; set; }

    public int? PaidByEmployeeId { get; set; }

    public ExpenseClaim ExpenseClaim { get; set; } = null!;

    public Employee? PaidByEmployee { get; set; }
}