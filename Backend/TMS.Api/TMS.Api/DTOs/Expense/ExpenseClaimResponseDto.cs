using TMS.Business.Enums;

namespace TMS.Api.DTOs.Expense
{
    public class ExpenseClaimResponseDto
    {
        public int Id { get; set; }

        public int TravelRequestId { get; set; }

        public ExpenseClaimStatus Status { get; set; }

        public DateTime CreatedAtUtc { get; set; }

        public DateTime? SubmittedAtUtc { get; set; }

        public List<ExpenseItemResponseDto> ExpenseItems { get; set; }
            = new();
    }
}
