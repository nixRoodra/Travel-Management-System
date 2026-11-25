using System.Diagnostics;
using TMS.Business.Entities;
using TMS.Business.Interfaces.Repositories;
using TMS.Business.Interfaces.Services;
using TMS.Business.Models.Auth;

namespace TMS.Business.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IPasswordHashService _passwordHashService;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IRefreshTokenService _refreshTokenService;
        private readonly JwtSettings _jwtSettings;

        public AuthService(
            IAuthRepository authRepository,
            IPasswordHashService passwordHashService,
            IJwtTokenService jwtTokenService,
            IRefreshTokenService refreshTokenService,
            JwtSettings jwtSettings)
        {
            _authRepository = authRepository;
            _passwordHashService = passwordHashService;
            _jwtTokenService = jwtTokenService;
            _refreshTokenService = refreshTokenService;
            _jwtSettings = jwtSettings;
        }

        public async Task<LoginResponse> LoginAsync(
            string email,
            string password)
        {
            //var stopwatch = Stopwatch.StartNew();
            // 1. Normalize email
            var normalizedEmail = email.Trim().ToUpperInvariant();

            // 2. Find employee and associated user
            var employee =
                await _authRepository.GetEmployeeByEmailAsync(normalizedEmail);

            //Console.WriteLine($"Database query: {stopwatch.ElapsedMilliseconds} ms");

            // 3. Validate account
            if (employee == null || !employee.User.IsActive)
                throw new UnauthorizedAccessException(
                    "Invalid email or password.");

            // 4. Verify password
            var isPasswordValid = _passwordHashService.VerifyPassword(
                employee.User,                
                employee.User.PasswordHash,
                password);

            if (!isPasswordValid)
                throw new UnauthorizedAccessException(
                    "Invalid email or password.");

            //Console.WriteLine($"Password verification: {stopwatch.ElapsedMilliseconds} ms");
            // 5. Calculate expiration timestamps
            var now = DateTime.UtcNow;

            var accessTokenExpiresAt = now.AddMinutes(
                _jwtSettings.AccessTokenExpiryMinutes);

            var refreshTokenExpiresAt = now.AddDays(
                _jwtSettings.RefreshTokenExpiryDays);

            // 6. Generate access token
            var accessToken = _jwtTokenService.GenerateAccessToken(
                employee.User,
                employee.Id,
                accessTokenExpiresAt);

            // 7. Generate refresh token
            var refreshToken =
                _refreshTokenService.GenerateRefreshToken();

            var refreshTokenHash =
                _refreshTokenService.HashToken(refreshToken);

            // 8. Create refresh token entity
            var refreshTokenEntity = new RefreshToken
            {
                UserId = employee.UserId,
                TokenHash = refreshTokenHash,
                CreatedAtUtc = now,
                ExpiresAtUtc = refreshTokenExpiresAt
            };

            // 9. Persist refresh token hash
            await _authRepository.AddRefreshTokenAsync(
                refreshTokenEntity);

            //Console.WriteLine($"Total login time: {stopwatch.ElapsedMilliseconds} ms");

            // 10. Return login response
            return new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,

                AccessTokenExpiresAtUtc = accessTokenExpiresAt,
                RefreshTokenExpiresAtUtc = refreshTokenExpiresAt,

                UserId = employee.UserId,
                EmployeeId = employee.Id,

                FullName = employee.User.FullName,
                Email = employee.User.Email,
                Role = employee.User.Role.Name
            };
        }


        public async Task<LoginResponse> RefreshTokenAsync(string refreshToken)
        {
            // 1. Validate input
            ArgumentException.ThrowIfNullOrWhiteSpace(refreshToken);

            // 2. Hash the supplied refresh token
            var tokenHash = _refreshTokenService.HashToken(refreshToken);

            // 3. Find the stored token
            var currentToken =
                await _authRepository.GetRefreshTokenByHashAsync(tokenHash);

            // 4. Validate token
            var now = DateTime.UtcNow;

            if (currentToken == null ||
                currentToken.RevokedAtUtc != null ||
                currentToken.ExpiresAtUtc <= now ||
                !currentToken.User.IsActive)
            {
                throw new UnauthorizedAccessException(
                    "Invalid or expired refresh token.");
            }

            // 5. Retrieve employee information
            var employee = await _authRepository.GetEmployeeByUserIdAsync(
                currentToken.UserId);

            if (employee == null)
            {
                throw new UnauthorizedAccessException(
                    "Invalid or expired refresh token.");
            }

            // 6. Calculate new expiration timestamps
            var accessTokenExpiresAt = now.AddMinutes(
                _jwtSettings.AccessTokenExpiryMinutes);

            var refreshTokenExpiresAt = now.AddDays(
                _jwtSettings.RefreshTokenExpiryDays);

            // 7. Generate new access token
            var accessToken = _jwtTokenService.GenerateAccessToken(
                employee.User,
                employee.Id,
                accessTokenExpiresAt);

            // 8. Generate new refresh token
            var newRefreshToken =
                _refreshTokenService.GenerateRefreshToken();

            var newRefreshTokenHash =
                _refreshTokenService.HashToken(newRefreshToken);

            // 9. Create replacement refresh token
            var replacementToken = new RefreshToken
            {
                UserId = employee.UserId,
                TokenHash = newRefreshTokenHash,
                CreatedAtUtc = now,
                ExpiresAtUtc = refreshTokenExpiresAt
            };

            // 10. Atomically rotate the old token
            await _authRepository.RotateRefreshTokenAsync(
                currentToken,
                replacementToken);

            // 11. Return new tokens
            return new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = newRefreshToken,

                AccessTokenExpiresAtUtc = accessTokenExpiresAt,
                RefreshTokenExpiresAtUtc = refreshTokenExpiresAt,

                UserId = employee.UserId,
                EmployeeId = employee.Id,

                FullName = employee.User.FullName,
                Email = employee.User.Email,
                Role = employee.User.Role.Name
            };
        }


        public async Task LogoutAsync(string refreshToken)
        {
            // 1. Validate input
            ArgumentException.ThrowIfNullOrWhiteSpace(refreshToken);

            // 2. Hash the supplied token
            var tokenHash = _refreshTokenService.HashToken(refreshToken);

            // 3. Find the stored token
            var storedToken =
                await _authRepository.GetRefreshTokenByHashAsync(tokenHash);

            // 4. If it doesn't exist or is already revoked, do nothing
            if (storedToken == null || storedToken.RevokedAtUtc != null)
                return;

            // 5. Revoke the refresh token
            await _authRepository.RevokeRefreshTokenAsync(storedToken);
        }
    }
}
