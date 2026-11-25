namespace TMS.Api.DTOs.Expense
{

    public class ExpenseItemResponseDto
    {
        public int Id { get; set; }

        public DateOnly ExpenseDate { get; set; }

        public string Description { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public List<ExpenseReceiptResponseDto> Receipts { get; set; }
            = new();
    }
}
