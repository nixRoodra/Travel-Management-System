using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TMS.Api.DTOs.Requests;
using TMS.Api.DTOs.Responses;
using TMS.Api.Helpers;
using TMS.Business.Interfaces.Services;

namespace TMS.Api.Controllers;

[ApiController]
[Route("api/finance/reimbursements")]
[Authorize(Roles = "Finance")]
public class FinanceReimbursementsController : ControllerBase
{
    private readonly IReimbursementService _reimbursementService;
    private readonly IMapper _mapper;

    public FinanceReimbursementsController(
        IReimbursementService reimbursementService,
        IMapper mapper)
    {
        _reimbursementService = reimbursementService;
        _mapper = mapper;
    }

    //GET /api/finance/reimbursements/pending
    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingReimbursements()
    {
        var reimbursements = await _reimbursementService
            .GetPendingReimbursementsForFinanceAsync();

        var response = _mapper
            .Map<List<FinanceReimbursementResponseDto>>(reimbursements);

        return Ok(response);
    }

    //POST /api/finance/reimbursements/{reimbursementId}/record-payment
    [HttpPost("{reimbursementId:int}/record-payment")]
    public async Task<IActionResult> RecordReimbursementPayment(
    int reimbursementId,
    RecordReimbursementPaymentRequestDto dto)
    {
        var financeEmployeeId = CurrentUserHelper.GetEmployeeId(User);

        var reimbursement = await _reimbursementService
            .RecordReimbursementPaymentAsync(
                reimbursementId,
                financeEmployeeId,
                dto.PaymentReference);

        if (reimbursement == null)
            return NotFound();

        var response = _mapper.Map<FinanceReimbursementResponseDto>(reimbursement);

        return Ok(response);
    }


    //GET /api/finance/reimbursements/{reimbursementId}
    [HttpGet("{reimbursementId:int}")]
    public async Task<IActionResult> GetReimbursementById(int reimbursementId)
    {
        var reimbursement = await _reimbursementService
            .GetReimbursementByIdAsync(reimbursementId);

        if (reimbursement == null)
            return NotFound();

        var response = _mapper
            .Map<ReimbursementDetailResponseDto>(reimbursement);

        return Ok(response);
    }
}