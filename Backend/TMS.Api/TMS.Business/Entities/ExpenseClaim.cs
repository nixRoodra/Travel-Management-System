using TMS.Business.Enums;

namespace TMS.Business.Entities;

public class ExpenseClaim
{
    public int Id { get; set; }

    public int TravelRequestId { get; set; }

    public ExpenseClaimStatus Status { get; set; }= ExpenseClaimStatus.Draft;

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? SubmittedAtUtc { get; set; }

    public TravelRequest TravelRequest { get; set; } = null!;

    public ICollection<ExpenseItem> ExpenseItems { get; set; }
        = new List<ExpenseItem>();
}