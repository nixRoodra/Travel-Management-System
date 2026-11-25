
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TMS.Api.Helpers;
using TMS.Api.DTOs.Approvals;
using TMS.Business.Interfaces.Services;

namespace TMS.Api.Controllers;

[ApiController]
[Route("api/finance/approvals")]
[Authorize(Roles = "Finance")]
public class FinanceApprovalsController : ControllerBase
{
    private readonly ITravelApprovalService _travelApprovalService;
    private readonly IMapper _mapper;

    public FinanceApprovalsController(
        ITravelApprovalService travelApprovalService,
        IMapper mapper)
    {
        _travelApprovalService = travelApprovalService;
        _mapper = mapper;
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingFinanceApprovals()
    {
        var approvals = await _travelApprovalService
            .GetPendingFinanceApprovalsAsync();

        var response = _mapper.Map<List<ManagerApprovalResponseDto>>(approvals);

        return Ok(response);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetFinanceApprovalHistory()
    {
        var financeEmployeeId = CurrentUserHelper.GetEmployeeId(User);

        var approvals = await _travelApprovalService
            .GetFinanceApprovalHistoryAsync(financeEmployeeId);

        var response = _mapper.Map<List<ManagerApprovalResponseDto>>(approvals);

        return Ok(response);
    }

    [HttpPost("{travelRequestId:int}/approve")]
    public async Task<IActionResult> ApproveTravelRequest(
        int travelRequestId,
        [FromBody] ApproveTravelRequestDto dto)
    {
        var financeEmployeeId = CurrentUserHelper.GetEmployeeId(User);

        var approval = await _travelApprovalService
            .ApproveTravelRequestAsFinanceAsync(
                travelRequestId,
                financeEmployeeId,
                dto.Comments);

        if (approval is null)
            return NotFound();

        return Ok(_mapper.Map<ManagerApprovalResponseDto>(approval));
    }

    [HttpPost("{travelRequestId:int}/reject")]
    public async Task<IActionResult> RejectTravelRequest(
        int travelRequestId,
        [FromBody] RejectTravelRequestDto dto)
    {
        var financeEmployeeId = CurrentUserHelper.GetEmployeeId(User);

        var approval = await _travelApprovalService
            .RejectTravelRequestAsFinanceAsync(
                travelRequestId,
                financeEmployeeId,
                dto.Comments);

        if (approval is null)
            return NotFound();

        return Ok(_mapper.Map<ManagerApprovalResponseDto>(approval));
    }
}
