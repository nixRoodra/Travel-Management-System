using TMS.Business.Entities;

namespace TMS.Business.Interfaces.Services
{
    public interface IPasswordHashService
    {
        string HashPassword(User user,string password);

        bool VerifyPassword(User user,string password,string passwordHash);
    }
}
