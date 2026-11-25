using Microsoft.AspNetCore.Identity;
using TMS.Business.Entities;
using TMS.Business.Interfaces.Services;

//using BusinessPasswordHasher = TMS.Business.Interfaces.Services.IPasswordHashService;
//using IdentityPasswordHasherInterface = Microsoft.AspNetCore.Identity.IPasswordHasher<TMS.Business.Entities.User>;

namespace TMS.Data.Services
{
    public class IdentityPasswordHashService: IPasswordHashService
    {
        private readonly IPasswordHasher<User> _passwordHasher;
        public IdentityPasswordHashService(IPasswordHasher<User> passwordHasher)
        {
            _passwordHasher = passwordHasher; 
        }

        public string HashPassword(User user,String password) 
        {
            return  _passwordHasher.HashPassword(user, password);
        }

        public bool VerifyPassword(User user,string passwordHash, String password) 
        {
            var result = _passwordHasher.VerifyHashedPassword(user, passwordHash, password);

            return result == PasswordVerificationResult.Success || result == PasswordVerificationResult.SuccessRehashNeeded;

        }
    }
}
