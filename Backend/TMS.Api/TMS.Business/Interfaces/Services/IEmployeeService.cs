using System;
using System.Collections.Generic;
using System.Text;
using TMS.Business.Entities;
using TMS.Business.Models.Employees;

namespace TMS.Business.Interfaces.Services
{
    public interface IEmployeeService
    {
        Task<Employee> CreateEmployeeAsync(CreateEmployeeCommand command);

        Task<Employee?> GetEmployeeByIdAsync(int employeeId);

        Task<List<Employee>> GetAllEmployeeAsync();

        // TODO: Implement UpdateEmployeeAsync()
        // TODO: Implement employee deactivation.
        // TODO: Add pagination and filtering to GetAllEmployeeAsync().
    }
}
