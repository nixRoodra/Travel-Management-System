using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;
using TMS.Business.Interfaces.Services;

namespace TMS.Data.Services
{
    public class RefreshTokenService:IRefreshTokenService
    {
        public string GenerateRefreshToken()
        {
            var randomBytes = new byte[64];

            using var randomNumberGenerator = RandomNumberGenerator.Create();

            randomNumberGenerator.GetBytes(randomBytes);

            return Convert.ToBase64String(randomBytes);
        }

        public string HashToken(string token)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(token);

            var tokenBytes = Encoding.UTF8.GetBytes(token);
            var hashBytes = SHA256.HashData(tokenBytes);

            return Convert.ToHexString(hashBytes);


            //return Convert.ToHexString(
            //    SHA256.HashData(Encoding.UTF8.GetBytes(token))
        }
    }
}





//Validate input.
//Convert the string into UTF-8 bytes.
//Calculate the SHA-256 hash.
//Convert the hash into hexadecimal.