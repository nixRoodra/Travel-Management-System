namespace TMS.Business.Interfaces.Services
{
    public interface IRefreshTokenService
    {
        string GenerateRefreshToken();

        string HashToken(string token);
    }
}
















//GenerateRefreshToken() generates the original random token that the client receives.
//HashToken() produces its SHA-256 hash, which we'll store in SQL Server.
//The raw token goes to the client. The hash goes into the RefreshTokens table.