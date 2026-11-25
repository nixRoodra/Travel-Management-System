namespace TMS.Api.DTOs.Expense
{
    public class ExpenseReceiptResponseDto
    {
        public int Id { get; set; }

        public string FileName { get; set; } = string.Empty;

        public DateTime UploadedAtUtc { get; set; }
    }
}
