using System.ComponentModel.DataAnnotations;

namespace TMS.Business.Entities;

public class ExpenseItem
{
    public int Id { get; set; }

    public int ExpenseClaimId { get; set; }

    public DateOnly ExpenseDate { get; set; }

    [Required]
    [MaxLength(300)]
    public string Description { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public ExpenseClaim ExpenseClaim { get; set; } = null!;

    public ICollection<ExpenseReceipt> Receipts { get; set; }
        = new List<ExpenseReceipt>();
}