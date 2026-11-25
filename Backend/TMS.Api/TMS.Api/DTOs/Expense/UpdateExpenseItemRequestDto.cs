using System.ComponentModel.DataAnnotations;

namespace TMS.Api.DTOs.Expense
{
    public class UpdateExpenseItemRequestDto
    {
        [Required]
        public DateOnly ExpenseDate { get; set; }

        [Required]
        [MaxLength(300)]
        public string Description { get; set; } = string.Empty;

        [Range(typeof(decimal), "0.01", "9999999999999999")]
        public decimal Amount { get; set; }
    }
}
