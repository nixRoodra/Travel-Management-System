using TMS.Business.Entities;

namespace TMS.Business.Interfaces.Repositories
{
    public interface IEmployeeRepository
    {
        Task<bool> EmailExistsAsync(string email);

        Task<bool> EmployeeCodeExistsAsync(string employeeCode);

        Task<bool> RoleExistsAsync(int roleId);

        Task<bool> DepartmentExistsAsync(int departmentId);

        Task<bool> IsManagerAsync(int employeeId);

        Task<Employee> CreateAsync(User user, Employee employee);

        Task<Employee?> GetEmployeeByIdAsync(int employeeId);

        Task<List<Employee>> GetAllEmployeeAsync();

        Task<bool> GradeExistsAsync(int gradeId);
        // TODO: Implement UpdateEmployeeAsync()
        // TODO: Implement employee deactivation.
        // TODO: Add pagination and filtering to GetAllEmployeeAsync().
    }
}
