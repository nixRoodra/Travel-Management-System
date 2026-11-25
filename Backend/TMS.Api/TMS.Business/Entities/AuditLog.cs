using System.ComponentModel.DataAnnotations;
using TMS.Business.Entities;

public class AuditLog
{
    public long Id { get; set; }

    public int? UserId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string EntityName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string EntityId { get; set; } = string.Empty;

    public string? OldValues { get; set; }

    public string? NewValues { get; set; }

    public DateTime OccurredAtUtc { get; set; }

    [MaxLength(100)]
    public string? CorrelationId { get; set; }

    public User? User { get; set; }
}