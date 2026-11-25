using System.Text.Json;
using TMS.Business.Entities;
using TMS.Business.Interfaces.Services;

namespace TMS.Business.Services;

public class AuditLogService : IAuditLogService
{
    public AuditLog CreateAuditLog(
        int? userId,
        string action,
        string entityName,
        string entityId,
        object? oldValues,
        object? newValues,
        string? correlationId)
    {
        return new AuditLog
        {
            UserId = userId,
            Action = action,
            EntityName = entityName,
            EntityId = entityId,
            OldValues = oldValues == null
                ? null
                : JsonSerializer.Serialize(oldValues),
            NewValues = newValues == null
                ? null
                : JsonSerializer.Serialize(newValues),
            CorrelationId = correlationId,
            OccurredAtUtc = DateTime.UtcNow
        };
    }
}