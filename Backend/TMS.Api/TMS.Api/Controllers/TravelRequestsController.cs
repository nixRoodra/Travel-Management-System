using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TMS.Api.DTOs.TravelRequest;
using TMS.Api.Helpers;
using TMS.Business.Entities;
using TMS.Business.Interfaces.Services;
using TMS.Business.Models.TravelRequests;

namespace TMS.Api.Controllers
{
    [Authorize(Roles = "Employee,Manager")]
    [Route("api/[controller]")]
    [ApiController]
    public class TravelRequestsController : ControllerBase
    {
        private readonly ITravelRequestService _travelRequestService;
        private readonly IMapper _mapper;

        public TravelRequestsController(
            ITravelRequestService travelRequestService,
            IMapper mapper)
        {
            _travelRequestService = travelRequestService;
            _mapper = mapper;
        }
        //Post /api/travelrequests
        [HttpPost]
        public async Task<ActionResult<TravelRequestResponseDto>>
            CreateTravelRequest([FromBody] CreateTravelRequestDto dto)
        {
            var employeeId = CurrentUserHelper.GetEmployeeId(User);

                // Map DTO to command
                var command = _mapper.Map<CreateTravelRequestCommand>(dto);

                // Assign authenticated employee ID
                command.EmployeeId = employeeId;

                // Create travel request
                var travelRequest = await _travelRequestService
                    .CreateTravelRequestAsync(command);

                // Map entity to response DTO
                var response = _mapper.Map<TravelRequestResponseDto>(
                    travelRequest);

            // Return HTTP 201 Created
            return CreatedAtAction(nameof(GetTravelRequestById),
              new { travelRequestId = travelRequest.Id },
              response);

        }

        //GET /api/travelrequests/{travelRequestId}
        [HttpGet("{travelRequestId:int}")]
        public async Task<ActionResult<TravelRequestResponseDto>>
            GetTravelRequestById(int travelRequestId)
        {
            var employeeId = CurrentUserHelper.GetEmployeeId(User);

            var travelRequest = await _travelRequestService.GetTravelRequestByIdAsync(travelRequestId, employeeId);

            if (travelRequest == null)
            {
                return NotFound();
            }

            var response = _mapper.Map<TravelRequestResponseDto>(travelRequest);

            return Ok(response);
        }

        //GET /api/travelrequests/my-requests
        [HttpGet("my-requests")]
        public async Task<ActionResult<List<TravelRequestResponseDto>>> GetEmployeeTravelRequestsAsync()
        {
            var employeeId = CurrentUserHelper.GetEmployeeId(User);

            List<TravelRequest> travelRequests = await _travelRequestService.GetEmployeeTravelRequestsAsync(employeeId);

            var response = _mapper.Map<List<TravelRequestResponseDto>>(travelRequests);

            return Ok(response);
        }

        //PUT /api/TravelRequests/{travelRequestId
        [HttpPut("{travelRequestId:int}")]
        public async Task<ActionResult<TravelRequestResponseDto>>
            UpdateTravelRequest(int travelRequestId,[FromBody] CreateTravelRequestDto dto)
        {
            var employeeId= CurrentUserHelper.GetEmployeeId(User);
            var command = _mapper.Map<CreateTravelRequestCommand>(dto);
            command.EmployeeId = employeeId;

            var travelRequest = await _travelRequestService.UpdateTravelRequestAsync(travelRequestId, command);

            if (travelRequest is null)
            {
                return NotFound();
            }

            var response = _mapper.Map<TravelRequestResponseDto>(travelRequest);

            return Ok(response);
        }

        // POST /api/travel-requests/{travelRequestId}/submit
        [HttpPost("{travelRequestId:int}/submit")]
        public async Task<ActionResult<TravelRequestResponseDto>>
            SubmitTravelRequest(int travelRequestId)
        {
            var employeeId = CurrentUserHelper.GetEmployeeId(User);

            var travelRequest = await _travelRequestService
                .SubmitTravelRequestAsync(travelRequestId, employeeId);

            if (travelRequest is null)
                return NotFound();

            var response = _mapper.Map<TravelRequestResponseDto>(travelRequest);

            return Ok(response);
        }
    }
}

