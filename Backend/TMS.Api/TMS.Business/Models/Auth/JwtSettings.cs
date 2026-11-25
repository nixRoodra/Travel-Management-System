namespace TMS.Business.Models.Auth
{
    public class JwtSettings
    {
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty;
        public int AccessTokenExpiryMinutes { get; set; }
        public int RefreshTokenExpiryDays { get; set; }
    }
}














//Instead of repeatedly reading individual configuration values throughout your application, we'll bind the entire Jwt configuration section to a strongly typed object.

//This is called the Options Pattern in ASP.NET Core.