namespace TMS.Business.Models.Employees
{
    public class CreateEmployeeCommand
    {  
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
               
        public int DepartmentId { get; set; }   
        public string Designation { get; set; } = string.Empty;

        public int GradeId { get; set; }
        public int? ManagerId { get; set; }
    }
}






//It should contain the same eight input properties as our request DTO
//The Command represents the request passed from the API layer to the Business layer.