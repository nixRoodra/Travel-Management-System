namespace TMS.Business.Models.Expense;

public class AddExpenseItemCommand
{
    public DateOnly ExpenseDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
