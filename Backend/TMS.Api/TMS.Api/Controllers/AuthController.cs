using Microsoft.AspNetCore.Mvc;
using TMS.Api.DTOs.Auth;
using TMS.Business.Interfaces.Services;
using TMS.Business.Models.Auth;
using Microsoft.AspNetCore.Authorization;

namespace TMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }
        //we'll move exception handling into centralized middleware rather than repeating try/catch in every controller
        //POST /api/auth/login
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
        {
            
                var result = await _authService.LoginAsync(
                    request.Email,
                    request.Password);

            return Ok(MapToResponse(result));
        }

        //POST /api/auth/refresh
        [AllowAnonymous]
        [HttpPost("refresh")]
        public async Task<ActionResult<LoginResponseDto>> Refresh([FromBody] RefreshTokenRequestDto request)
        {           
                var result = await _authService.RefreshTokenAsync(
                    request.RefreshToken);

                return Ok(MapToResponse(result));
                        
        }

        //POST /api/auth/logout
        [AllowAnonymous]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto request)
        {
            await _authService.LogoutAsync(request.RefreshToken);

            return NoContent();
        }


        private static LoginResponseDto MapToResponse(LoginResponse result)
        {
            return new LoginResponseDto
            {
                AccessToken = result.AccessToken,
                RefreshToken = result.RefreshToken,

                AccessTokenExpiresAtUtc = result.AccessTokenExpiresAtUtc,
                RefreshTokenExpiresAtUtc = result.RefreshTokenExpiresAtUtc,

                UserId = result.UserId,
                EmployeeId = result.EmployeeId,

                FullName = result.FullName,
                Email = result.Email,
                Role = result.Role
            };
        }
    }
}