using System.ComponentModel.DataAnnotations;

namespace TMS.Business.Entities
{
    public class Employee
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

        public User User { get; set; } = null!;

        [Required,MaxLength(30)]
        public string EmployeeCode { get; set; } = string.Empty;

        public int DepartmentId { get; set; }

        public Department Department { get; set; }=null!;

        [Required,MaxLength(100)]
        public string Designation { get; set; } = string.Empty;
        public int GradeId { get; set; }

        public EmployeeGrade Grade { get; set; } = null!;

        public int? ManagerId { get; set; }

        public Employee? Manager { get; set; }

        public DateTime TMSAccountCreatedAt {  get; set; }

        public ICollection<Employee> DirectReports { get; set; } = new List<Employee>();

        public ICollection<TravelRequest> TravelRequests { get; set; }= new List<TravelRequest>();

    }
}
