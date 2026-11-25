namespace TMS.Business.Models.Expense;

public class UploadExpenseReceiptCommand
{
    public Stream FileStream { get; set; } = null!;
    public string OriginalFileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
}
