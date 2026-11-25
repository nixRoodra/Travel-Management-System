using Microsoft.EntityFrameworkCore;
using TMS.Business.Entities;
using TMS.Business.Interfaces.Repositories;
using TMS.Data.Context;

namespace TMS.Data.Repositories
{
    public class EmployeeRepository:IEmployeeRepository
    {
        private readonly ApplicationDbContext _context;

        public EmployeeRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> EmailExistsAsync(string email) 
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }

        public async Task<bool> EmployeeCodeExistsAsync(string employeeCode) 
        {
            return await _context.Employees.AnyAsync(e => e.EmployeeCode == employeeCode);
        }

        public async Task<bool> RoleExistsAsync(int roleId) 
        {
            return await _context.Roles.AnyAsync(r=> r.Id == roleId);
        }

        public async Task<bool> DepartmentExistsAsync(int departmentId) 
        {
            return await _context.Departments.AnyAsync(d=> d.Id == departmentId);
        }

        public async Task<bool> IsManagerAsync(int employeeId)
        {
            return await _context.Employees.AnyAsync(e=> e.Id == employeeId && e.User.Role.Name == "Manager");
        }

        public async Task<Employee> CreateAsync(User user, Employee employee) 
        {
            _context.Users.Add(user);

            employee.User= user;

            _context.Employees.Add(employee);

            await _context.SaveChangesAsync();

            await _context.SaveChangesAsync();

            return await _context.Employees
                .AsNoTracking()
                .Include(e => e.User)
                    .ThenInclude(u => u.Role)
                .Include(e => e.Department)
                .FirstAsync(e => e.Id == employee.Id);
        }

        public async Task<Employee?> GetEmployeeByIdAsync(int employeeId) 
        {
            return await _context.Employees
                .AsNoTracking()
                .Include (e => e.User)
                    .ThenInclude (u => u.Role)
                .Include (e => e.Department)
                .FirstOrDefaultAsync(e => e.Id == employeeId);
        }

        public async Task<List<Employee>> GetAllEmployeeAsync()
        {
            return await _context.Employees
                .AsNoTracking()
                .Include(e=>e.User)
                    .ThenInclude(u=>u.Role)
                .Include(e=>e.Department)
                .ToListAsync();
        }

        public async Task<bool> GradeExistsAsync(int gradeId)
        {
            return await _context.EmployeeGrades.AnyAsync(g => g.Id == gradeId);
        }
    }
}
