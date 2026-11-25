namespace TMS.Business.Models.Expense;

public class ExpenseReceiptDownload
{
    public Stream FileStream { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;
}
