namespace TMS.Business.Models.Expense;

public class UpdateExpenseItemCommand
{
    public DateOnly ExpenseDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
