using System.ComponentModel.DataAnnotations;

namespace TMS.Business.Entities
{
    public class EmployeeGrade
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(10)]
        public string GradeCode { get; set; } = string.Empty;

        [Required,MaxLength(50)]
        public string GradeName { get; set; } = string.Empty;

        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }
}
