using System.ComponentModel.DataAnnotations;

namespace TMS.Business.Entities
{
    public class Department
    {

        [Key] 
        public int Id { get; set; }

        [Required,MaxLength(100)] 
        public string Name { get; set; } = string.Empty;

        
    }
}
