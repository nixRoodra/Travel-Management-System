using System.ComponentModel.DataAnnotations;

namespace TMS.Api.DTOs.Auth
{
    public class RefreshTokenRequestDto
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
