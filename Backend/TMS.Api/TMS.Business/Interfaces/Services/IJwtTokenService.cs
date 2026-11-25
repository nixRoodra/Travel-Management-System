using TMS.Business.Entities;

namespace TMS.Business.Interfaces.Services
{
    public interface IJwtTokenService
    {
        string GenerateAccessToken(User user,int employeeId,DateTime expiresAtUtc);
    }
}
