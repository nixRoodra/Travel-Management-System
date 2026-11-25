using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TMS.Api.DTOs.FinanceExpenseClaimReview;
using TMS.Api.Helpers;
using TMS.Business.Interfaces.Services;

namespace TMS.Api.Controllers;

[ApiController]
[Route("api/finance/expense-claims")]
[Authorize(Roles = "Finance")]
public class FinanceExpenseClaimsController : ControllerBase
{
    private readonly IExpenseClaimReviewService _expenseClaimReviewService;
    private readonly IMapper _mapper;

    public FinanceExpenseClaimsController(
        IExpenseClaimReviewService expenseClaimReviewService,
        IMapper mapper)
    {
        _expenseClaimReviewService = expenseClaimReviewService;
        _mapper = mapper;
    }

    //GET /api/finance/expense-claims
    [HttpGet]
    public async Task<ActionResult<List<FinanceExpenseClaimQueueResponseDto>>>
    GetSubmittedExpenseClaimsForFinance()
    {
        var claims = await _expenseClaimReviewService
            .GetSubmittedExpenseClaimsForFinanceAsync();

        var response = _mapper.Map<List<FinanceExpenseClaimQueueResponseDto>>(claims);

        return Ok(response);
    }

    //GET /api/finance/expense-claims/{expenseClaimId}

    [HttpGet("{expenseClaimId:int}")]
    public async Task<ActionResult<FinanceExpenseClaimDetailResponseDto>>
    GetExpenseClaimDetailsForFinance(int expenseClaimId)
    {
        var claim = await _expenseClaimReviewService
            .GetExpenseClaimForFinanceReviewAsync(expenseClaimId);

        if (claim == null)
            return NotFound();

        var response = _mapper.Map<FinanceExpenseClaimDetailResponseDto>(claim);

        return Ok(response);
    }

    //POST /api/finance/expense-claims/{expenseClaimId}/approve

    [HttpPost("{expenseClaimId:int}/approve")]
    public async Task<ActionResult<FinanceExpenseClaimDetailResponseDto>>
    ApproveExpenseClaim(
        int expenseClaimId,
        ApproveExpenseClaimRequestDto dto)
    {
        var financeEmployeeId = CurrentUserHelper.GetEmployeeId(User);

        var claim = await _expenseClaimReviewService
            .ApproveExpenseClaimAsFinanceAsync(
                expenseClaimId,
                financeEmployeeId,
                dto.Comments);

        if (claim == null)
            return NotFound();

        return Ok(_mapper.Map<FinanceExpenseClaimDetailResponseDto>(claim));
    }

    //POST /api/finance/expense-claims/{expenseClaimId}/reject
    [HttpPost("{expenseClaimId:int}/reject")]
    public async Task<ActionResult<FinanceExpenseClaimDetailResponseDto>>
    RejectExpenseClaim(
        int expenseClaimId,
        RejectExpenseClaimRequestDto dto)
    {
        var financeEmployeeId = CurrentUserHelper.GetEmployeeId(User);

        var claim = await _expenseClaimReviewService
            .RejectExpenseClaimAsFinanceAsync(
                expenseClaimId,
                financeEmployeeId,
                dto.Comments);

        if (claim == null)
            return NotFound();

        return Ok(_mapper.Map<FinanceExpenseClaimDetailResponseDto>(claim));
    }

    //POST /api/finance/expense-claims/{expenseClaimId}/request-resubmission
    [HttpPost("{expenseClaimId:int}/request-resubmission")]
    public async Task<ActionResult<FinanceExpenseClaimDetailResponseDto>>
    RequestExpenseClaimResubmission(
        int expenseClaimId,
        RequestExpenseClaimResubmissionRequestDto dto)
    {
        var financeEmployeeId = CurrentUserHelper.GetEmployeeId(User);

        var claim = await _expenseClaimReviewService
            .RequestExpenseClaimResubmissionAsFinanceAsync(
                expenseClaimId,
                financeEmployeeId,
                dto.Comments);

        if (claim == null)
            return NotFound();

        return Ok(_mapper.Map<FinanceExpenseClaimDetailResponseDto>(claim));
    }

    //GET /api/finance/expense-claims/{expenseClaimId}/review-history

    [HttpGet("{expenseClaimId:int}/review-history")]
    public async Task<ActionResult<List<ExpenseClaimReviewHistoryResponseDto>>>
    GetExpenseClaimReviewHistory(int expenseClaimId)
    {
        var history = await _expenseClaimReviewService
            .GetExpenseClaimReviewHistoryAsync(expenseClaimId);

        var response = _mapper.Map<List<ExpenseClaimReviewHistoryResponseDto>>(history);

        return Ok(response);
    }

    //GET /api/finance/expense-claims/{expenseClaimId}/items/{expenseItemId}/ receipts /{ receiptId}
[HttpGet("{expenseClaimId:int}/items/{expenseItemId:int}/receipts/{receiptId:int}")]
    public async Task<IActionResult> DownloadExpenseReceiptForFinance(
    int expenseClaimId,
    int expenseItemId,
    int receiptId)
    {
        var receipt = await _expenseClaimReviewService
            .DownloadExpenseReceiptForFinanceReviewAsync(
                expenseClaimId,
                expenseItemId,
                receiptId);

        if (receipt == null)
            return NotFound();

        var contentType = Path.GetExtension(receipt.FileName).ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".pdf" => "application/pdf",
            _ => "application/octet-stream"
        };

        return File(receipt.FileStream, contentType, receipt.FileName);
    }

}