using System.ComponentModel.DataAnnotations;

namespace TMS.Api.DTOs.Requests;

public class RecordReimbursementPaymentRequestDto
{
    [MaxLength(100)]
    public string? PaymentReference { get; set; }
}