using TMS.Business.Entities;
using TMS.Business.Interfaces.Repositories;
using TMS.Business.Interfaces.Services;
using TMS.Business.Models.Employees;

namespace TMS.Business.Services
{
    public class EmployeeService:IEmployeeService
    {
        private readonly IEmployeeRepository _employeeRepository;

        private readonly IPasswordHashService _passwordHashService;

        public EmployeeService(IEmployeeRepository employeeRepository,IPasswordHashService passwordHashService)
        {
            _employeeRepository = employeeRepository;

            _passwordHashService = passwordHashService;
            
        }

        public async Task<Employee> CreateEmployeeAsync(CreateEmployeeCommand command)
        {
            // Normalize input
            NormalizeCommand(command);

            // Validate uniqueness
            await ValidateUniquenessAsync(command);

            // Validate relationships
            await ValidateRelationshipsAsync(command);

            // Construct User
            var user = CreateUser(command);

            // Hash password
            user.PasswordHash = _passwordHashService.HashPassword(user,command.Password);

            // Construct Employee
            var employee = CreateEmployee(command, user);

            // Persist both entities
            return await _employeeRepository.CreateAsync(user, employee);
        }

        public async Task<Employee?> GetEmployeeByIdAsync(int employeeId) 
        {
            return await _employeeRepository.GetEmployeeByIdAsync(employeeId);
        }

        public async Task<List<Employee>> GetAllEmployeeAsync()
        {
            return await _employeeRepository.GetAllEmployeeAsync();
        }


        //helper methods
        private static void NormalizeCommand(CreateEmployeeCommand command)
        {
            command.FullName = command.FullName.Trim();
            command.Email = command.Email.Trim().ToUpperInvariant();
            command.EmployeeCode = command.EmployeeCode.Trim();
            command.Designation = command.Designation.Trim();
        }

        private async Task ValidateUniquenessAsync(CreateEmployeeCommand command)
        {
            if (await _employeeRepository.EmailExistsAsync(command.Email))
            {
                throw new InvalidOperationException(
                    "Email is already registered.");
            }

            if (await _employeeRepository.EmployeeCodeExistsAsync(command.EmployeeCode))
            {
                throw new InvalidOperationException(
                    "Employee code already exists.");
            }
        }

        private async Task ValidateRelationshipsAsync(CreateEmployeeCommand command)
        {
            if (!await _employeeRepository.RoleExistsAsync(command.RoleId))
            {
                throw new ArgumentException(
                    "Selected role does not exist.");
            }

            if (!await _employeeRepository.DepartmentExistsAsync(command.DepartmentId))
            {
                throw new ArgumentException(
                    "Selected department does not exist.");
            }

            if (command.ManagerId.HasValue && !await _employeeRepository.IsManagerAsync(command.ManagerId.Value))
            {
                throw new ArgumentException(
                    "Selected manager does not exist.");
            }

            if (!await _employeeRepository.GradeExistsAsync(command.GradeId))
            {
                throw new ArgumentException("Invalid grade selected.");
            }
        }

        private User CreateUser(CreateEmployeeCommand command)
        {
            return new User
            {
                FullName = command.FullName,
                Email = command.Email,
                RoleId = command.RoleId
            };
        }

        private Employee CreateEmployee(CreateEmployeeCommand command,User user)
        {
            return new Employee
            {
                EmployeeCode = command.EmployeeCode,
                DepartmentId = command.DepartmentId,
                Designation = command.Designation,
                ManagerId = command.ManagerId,
                GradeId = command.GradeId,
                User = user

            };
        }
    }
}
