namespace TMS.Api.DTOs.FinanceExpenseClaimReview;

public class FinanceExpenseItemResponseDto
{
    public int ExpenseItemId { get; set; }

    public DateOnly ExpenseDate { get; set; }

    public string Description { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public List<FinanceExpenseReceiptResponseDto> Receipts { get; set; } = new();
}