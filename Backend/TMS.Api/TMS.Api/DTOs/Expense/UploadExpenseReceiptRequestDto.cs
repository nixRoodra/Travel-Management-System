using System.ComponentModel.DataAnnotations;

namespace TMS.Api.DTOs.Expense
{
    public class UploadExpenseReceiptRequestDto
    {
        [Required]
        public IFormFile File { get; set; } = null!;
    }
}
