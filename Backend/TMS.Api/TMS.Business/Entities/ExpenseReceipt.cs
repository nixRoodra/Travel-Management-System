using System.ComponentModel.DataAnnotations;

namespace TMS.Business.Entities;

public class ExpenseReceipt
{
    public int Id { get; set; }

    public int ExpenseItemId { get; set; }

    [Required]
    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string FilePath { get; set; } = string.Empty;

    public DateTime UploadedAtUtc { get; set; }

    public ExpenseItem ExpenseItem { get; set; } = null!;
}