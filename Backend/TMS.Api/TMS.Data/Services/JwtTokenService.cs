using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TMS.Business.Entities;
using TMS.Business.Interfaces.Services;
using TMS.Business.Models.Auth;

namespace TMS.Data.Services
{
    public class JwtTokenService : IJwtTokenService
    {
        private readonly JwtSettings _jwtSettings;

        public JwtTokenService(IOptions<JwtSettings> jwtOptions)
        {
            _jwtSettings = jwtOptions.Value;
        }

        public string GenerateAccessToken(User user, int employeeId, DateTime expiresAtUtc)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub,user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email,user.Email),
                new Claim(ClaimTypes.Name,user.FullName),
                new Claim(ClaimTypes.Role,user.Role.Name),
                new Claim("employeeId",employeeId.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));

            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience:_jwtSettings.Audience,
                claims:claims,
                expires: expiresAtUtc,
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}









//Claims are statements about the authenticated user.
//key  - This converts your secret string into bytes and creates the cryptographic key used to sign the JWT.
//credentials - This tells JWT to use HMAC-SHA256 to sign the token.

// token - This creates the signed JWT and converts it into the string returned to the client.


//IOptions < JwtSettings > — configuration injection.
//JwtRegisteredClaimNames.Sub — identifies the user.
//ClaimTypes.Role — establishes the user's role.
//employeeId — identifies the employee record.
//SymmetricSecurityKey — creates the signing key.
//HmacSha256 — signs the token.
//DateTime.UtcNow — calculates expiration using UTC.
//JwtSecurityTokenHandler — serializes the JWT.