using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TMS.Api.DTOs.Responses;
using TMS.Api.Helpers;
using TMS.Business.Interfaces.Services;

namespace TMS.Api.Controllers;

[ApiController]
[Route("api/reimbursements")]
[Authorize(Roles = "Employee,Manager")]
public class EmployeeReimbursementsController : ControllerBase
{
    private readonly IReimbursementService _reimbursementService;
    private readonly IMapper _mapper;

    public EmployeeReimbursementsController(
        IReimbursementService reimbursementService,
        IMapper mapper)
    {
        _reimbursementService = reimbursementService;
        _mapper = mapper;
    }
    //GET /api/reimbursements/my-reimbursements
    [HttpGet("my-reimbursements")]
    public async Task<IActionResult> GetMyReimbursements()
    {
        var employeeId = CurrentUserHelper.GetEmployeeId(User);

        var reimbursements = await _reimbursementService
            .GetEmployeeReimbursementsAsync(employeeId);

        var response = _mapper
            .Map<List<EmployeeReimbursementResponseDto>>(reimbursements);

        return Ok(response);
    }
}