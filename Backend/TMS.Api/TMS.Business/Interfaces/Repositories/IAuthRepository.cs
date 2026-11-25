using TMS.Business.Entities;

namespace TMS.Business.Interfaces.Repositories
{
    public interface IAuthRepository
    {
        //Find employee, User and Role using email
        Task<Employee?> GetEmployeeByEmailAsync(string email);

        Task<Employee?> GetEmployeeByUserIdAsync(int userId);

        //Store a newly generated refresh token hash
        Task AddRefreshTokenAsync(RefreshToken refreshToken);

        //Find a refresh token during refresh
        Task<RefreshToken?> GetRefreshTokenByHashAsync(string tokenHash);

        //Revoke the old token and save its replacement
        Task RotateRefreshTokenAsync(RefreshToken currentToken,RefreshToken replacementToken);

        //Revoke the old token and save its replacement
        Task RevokeRefreshTokenAsync(RefreshToken refreshToken);
    }
}
