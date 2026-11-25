using TMS.Business.Entities;

namespace TMS.Business.Interfaces.Services;

public interface IAuditLogService
{
    AuditLog CreateAuditLog(
        int? userId,
        string action,
        string entityName,
        string entityId,
        object? oldValues,
        object? newValues,
        string? correlationId);
}