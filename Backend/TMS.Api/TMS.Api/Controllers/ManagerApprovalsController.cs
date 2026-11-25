using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TMS.Api.DTOs.Approvals;
using TMS.Api.Helpers;
using TMS.Business.Interfaces.Services;

namespace TMS.Api.Controllers
{
    [ApiController]
    [Route("api/manager/approvals")]
    [Authorize(Roles = "Manager")]

    public class ManagerApprovalsController : ControllerBase
    {
        private readonly ITravelApprovalService _travelApprovalService;
        private readonly IMapper _mapper;

        public ManagerApprovalsController(ITravelApprovalService travelApprovalService,IMapper mapper)
        {
            _travelApprovalService = travelApprovalService;
            _mapper = mapper;
        }

        //GET /api/manager/approvals/pending

        [HttpGet("pending")]
        public async Task<ActionResult<List<ManagerApprovalResponseDto>>> GetPendingManagerApprovals()
        {
            var managerEmployeeId = CurrentUserHelper.GetEmployeeId(User);

            var approvals = await _travelApprovalService.GetPendingManagerApprovalsAsync(managerEmployeeId);

            var response = _mapper.Map<List<ManagerApprovalResponseDto>>(approvals);

            return Ok(response);
        }


        //GET /api/manager/approvals/history
        [HttpGet("history")]
        public async Task<ActionResult<List<ManagerApprovalResponseDto>>> GetManagerApprovalHistory()
        {
            var managerEmployeeId = CurrentUserHelper.GetEmployeeId(User);

            var approvals = await _travelApprovalService.GetManagerApprovalHistoryAsync(managerEmployeeId);

            var response = _mapper.Map<List<ManagerApprovalResponseDto>>(approvals);

            return Ok(response);
        }

        //POST/api/manager/approvals/{id}/approve
        [HttpPost("{travelRequestId:int}/approve")]
        public async Task<ActionResult<ManagerApprovalResponseDto>> ApproveTravelRequestAsManager(
            int travelRequestId,
            [FromBody] ApproveTravelRequestDto dto)
        {
            var managerEmployeeId = CurrentUserHelper.GetEmployeeId(User);

            var approval = await _travelApprovalService.ApproveTravelRequestAsManagerAsync(
                travelRequestId,
                managerEmployeeId,
                dto.Comments);

            if (approval is null)
                return NotFound();

            var response = _mapper.Map<ManagerApprovalResponseDto>(approval);

            return Ok(response);
        }

        //POST/api/manager/approvals/{id}/reject
        [HttpPost("{travelRequestId:int}/reject")]
        public async Task<ActionResult<ManagerApprovalResponseDto>>
            RejectTravelRequest(
                int travelRequestId,
                [FromBody] RejectTravelRequestDto dto)
        {
            var managerEmployeeId = CurrentUserHelper.GetEmployeeId(User);

            var approval = await _travelApprovalService
                .RejectTravelRequestAsManagerAsync(
                    travelRequestId,
                    managerEmployeeId,
                    dto.Comments);

            if (approval is null)
                return NotFound();

            var response = _mapper.Map<ManagerApprovalResponseDto>(approval);

            return Ok(response);
        }
    }
}
