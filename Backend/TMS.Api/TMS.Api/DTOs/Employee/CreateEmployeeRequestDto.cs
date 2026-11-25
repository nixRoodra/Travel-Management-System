using System.ComponentModel.DataAnnotations;

namespace TMS.Api.DTOs.Employee
{
    public class CreateEmployeeRequestDto
    {
        [Required(ErrorMessage = "Full name is required.")]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Please select a valid role.")]
        public int RoleId { get; set; }

        [Required]
        [MaxLength(30)]
        public string EmployeeCode { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Please select a valid department.")]
        public int DepartmentId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Designation { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int GradeId { get; set; }

        public int? ManagerId { get; set; }


    }
}
