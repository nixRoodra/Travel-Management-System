namespace TMS.Api.DTOs.FinanceExpenseClaimReview;

public class FinanceExpenseReceiptResponseDto
{
    public int ReceiptId { get; set; }

    public string FileName { get; set; } = string.Empty;

    public DateTime UploadedAtUtc { get; set; }
}