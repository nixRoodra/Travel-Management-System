using System.Security.Claims;

namespace TMS.Api.Helpers
{
    public static class CurrentUserHelper
    {
        public static int GetEmployeeId(ClaimsPrincipal user)
        {
            var employeeIdClaim = user.FindFirst("employeeId");

            if (employeeIdClaim == null ||
                !int.TryParse(employeeIdClaim.Value, out var employeeId) ||
                employeeId <= 0)
            {
                throw new UnauthorizedAccessException(
                    "Invalid or missing employee ID claim.");
            }

            return employeeId;
        }
    }
}