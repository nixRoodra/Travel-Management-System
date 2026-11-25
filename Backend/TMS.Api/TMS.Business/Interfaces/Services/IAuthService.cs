using TMS.Business.Models.Auth;

namespace TMS.Business.Interfaces.Services
{
    public interface IAuthService
    {

        Task<LoginResponse> LoginAsync(string email, string password);

        Task<LoginResponse> RefreshTokenAsync(string refreshToken);

        Task LogoutAsync(string refreshToken);



    }
}
