using Microsoft.EntityFrameworkCore;
using TMS.Business.Entities;
using TMS.Business.Interfaces.Repositories;
using TMS.Data.Context;

namespace TMS.Data.Repositories
{
    public class AuthRepository:IAuthRepository
    {
        private readonly ApplicationDbContext _context;

        public AuthRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Employee?> GetEmployeeByEmailAsync(string email)
        {
            return await _context.Employees
                .AsNoTracking()
                .Include(e => e.User)
                    .ThenInclude(u => u.Role)
                .FirstOrDefaultAsync(e => e.User.Email == email);
        }

        public async Task<Employee?> GetEmployeeByUserIdAsync(int userId)
        {
            return await _context.Employees
                .AsNoTracking()
                .Include(e => e.User)
                    .ThenInclude(u => u.Role)
                .FirstOrDefaultAsync(e => e.UserId == userId);
        }

        public async Task AddRefreshTokenAsync(RefreshToken refreshToken)
        {
            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();
        }

        public async Task<RefreshToken?> GetRefreshTokenByHashAsync(string tokenHash)
        {
            return await _context.RefreshTokens
                .Include(rt => rt.User)
                    .ThenInclude(u => u.Role)
                .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);
        }

        public async Task RevokeRefreshTokenAsync(RefreshToken refreshToken)
        {
            refreshToken.RevokedAtUtc = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        //public async Task RotateRefreshTokenAsync(RefreshToken currentToken,RefreshToken replacementToken)
        //{
        //    await using var transaction = await _context.Database.BeginTransactionAsync();

        //    currentToken.RevokedAtUtc = DateTime.UtcNow;
        //    currentToken.ReplacedByTokenHash = replacementToken.TokenHash;

        //    _context.RefreshTokens.Add(replacementToken);

        //    await _context.SaveChangesAsync();

        //    await transaction.CommitAsync();
        //}


        public async Task RotateRefreshTokenAsync(RefreshToken currentToken,RefreshToken replacementToken)
        {
            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            var now = DateTime.UtcNow;

            var affectedRows = await _context.RefreshTokens
                .Where(rt =>
                    rt.Id == currentToken.Id &&
                    rt.RevokedAtUtc == null &&
                    rt.ExpiresAtUtc > now)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(rt => rt.RevokedAtUtc, now)
                    .SetProperty(
                        rt => rt.ReplacedByTokenHash,
                        replacementToken.TokenHash));

            if (affectedRows != 1)
                throw new InvalidOperationException(
                    "Refresh token is invalid, expired, or already used.");

            _context.RefreshTokens.Add(replacementToken);

            await _context.SaveChangesAsync();

            await transaction.CommitAsync();
        }
    }
}









//ExecuteUpdateAsync() performs a conditional SQL UPDATE.

//Only one request can successfully change the old token from unrevoked to revoked. A concurrent request will affect zero rows and fail.