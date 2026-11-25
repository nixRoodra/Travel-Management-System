using Azure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TMS.Api.DTOs.Employee;
using TMS.Business.Entities;
using TMS.Business.Interfaces.Services;
using TMS.Business.Models.Employees;

namespace TMS.Api.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeesController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }


        [HttpPost]
        public async Task<ActionResult<EmployeeResponseDto>> 
            CreateEmployee(
            [FromBody] CreateEmployeeRequestDto request)
        {
            var command = MapToCommand(request);

            var employee = await _employeeService.CreateEmployeeAsync(command);

            var response = MapToResponse(employee);

            return Created($"/api/employees/{response.EmployeeId}", response);

            //return CreatedAtAction(
            //nameof(CreateEmployee),
            //new { id = response.EmployeeId },
            //response);


            //return CreatedAtAction(
            //    nameof(GetEmployeeById),
            //    new { id = response.EmployeeId },
            //    response);
        }

        //GET /api/employees/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeResponseDto>> GetEmployeeByIdAsync(int id)
        {
            var employee = await _employeeService.GetEmployeeByIdAsync(id);

            if (employee == null) 
            {
                return NotFound($"Employee with {id} not found");
            }

            var response = MapToResponse(employee);

            return Ok(response);
        }


        //GET /api/employees
        [HttpGet]
        public async Task<ActionResult<EmployeeResponseDto>> GetAllEmployeeAsync()
        {
            List<Employee> employees = await _employeeService.GetAllEmployeeAsync();

            //var response = employees.Select(e => MapToResponse(e)).ToList();

            var response = employees.Select(MapToResponse).ToList();

            return Ok(response);
        }
        // TODO: Implement UpdateEmployeeAsync()
        // TODO: Implement employee deactivation.
        // TODO: Add pagination and filtering to GetAllEmployeeAsync().

        private static CreateEmployeeCommand MapToCommand(
            CreateEmployeeRequestDto request)
        {
            return new CreateEmployeeCommand
            {
                FullName = request.FullName,
                Email = request.Email,
                Password = request.Password,
                RoleId = request.RoleId,
                EmployeeCode = request.EmployeeCode,
                DepartmentId = request.DepartmentId,
                Designation = request.Designation,
                ManagerId = request.ManagerId,
                GradeId = request.GradeId
            };
        }

        private static EmployeeResponseDto MapToResponse(
            Employee employee)
        {
            return new EmployeeResponseDto
            {
                EmployeeId = employee.Id,
                UserId = employee.UserId,
                FullName = employee.User.FullName,
                Email = employee.User.Email,
                EmployeeCode = employee.EmployeeCode,
                RoleId = employee.User.RoleId,
                RoleName = employee.User.Role.Name,
                DepartmentName = employee.Department.Name,
                DepartmentId = employee.DepartmentId,
                Designation = employee.Designation,
                ManagerId = employee.ManagerId,
                TMSAccountCreatedAt = employee.TMSAccountCreatedAt
            };
        }
    }
}
