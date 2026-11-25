namespace TMS.Api.DTOs.Employee
{
    public class EmployeeResponseDto
    {
        public int EmployeeId { get; set; }
        public int UserId { get; set; }

        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string EmployeeCode { get; set; } = string.Empty;

        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;

        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;

        public int? ManagerId { get; set; }

        public DateTime TMSAccountCreatedAt { get; set; }
    }
}
