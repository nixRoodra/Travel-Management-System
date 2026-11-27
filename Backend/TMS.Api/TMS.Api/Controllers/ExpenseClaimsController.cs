using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TMS.Api.DTOs.Expense;
using TMS.Api.Helpers;
using TMS.Business.Interfaces.Services;
using System.IO;
using TMS.Business.Models.Expense;

namespace TMS.Api.Controllers;

[ApiController]
[Route("api/trips/{travelRequestId:int}/expense-claim")]
[Authorize(Roles = "Employee,Manager")]
public class ExpenseClaimsController : ControllerBase
{
    private readonly IExpenseClaimService _expenseClaimService;
    private readonly IMapper _mapper;

    public ExpenseClaimsController(
        IExpenseClaimService expenseClaimService,
        IMapper mapper)
    {
        _expenseClaimService = expenseClaimService;
        _mapper = mapper;
    }
    //GET	/api/trips/{travelRequestId}/expense-claim

    [HttpGet]
    public async Task<IActionResult> GetExpenseClaim(int travelRequestId)
    {
        var employeeId = CurrentUserHelper.GetEmployeeId(User);

        var expenseClaim =
            await _expenseClaimService.GetExpenseClaimForTripAsync(
                travelRequestId,
                employeeId);

        if (expenseClaim == null)
        {
            return NotFound();
        }

        var response = _mapper.Map<ExpenseClaimResponseDto>(expenseClaim);

        return Ok(response);
    }

    //POST	/api/trips/{travelRequestId}/expense-claim
    [HttpPost]
    public async Task<IActionResult> CreateExpenseClaim(int travelRequestId)
    {
        var employeeId = CurrentUserHelper.GetEmployeeId(User);

        var expenseClaim =
            await _expenseClaimService.CreateExpenseClaimForTripAsync(
                travelRequestId,
                employeeId);

        var response = _mapper.Map<ExpenseClaimResponseDto>(expenseClaim);

        return CreatedAtAction(
            nameof(GetExpenseClaim),
            new { travelRequestId },
            response);
    }

    //POST /api/trips/{travelRequestId}/expense-claim/items

    [HttpPost("items")]
    public async Task<IActionResult> AddExpenseItem(
        int travelRequestId,
        [FromBody] AddExpenseItemRequestDto dto)
    {
        var employeeId = CurrentUserHelper.GetEmployeeId(User);

        var command = _mapper.Map<AddExpenseItemCommand>(dto);

        var expenseItem = await _expenseClaimService
            .AddExpenseItemToClaimAsync(travelRequestId, employeeId, command);

        if (expenseItem == null)
            return NotFound();

        var response = _mapper.Map<ExpenseItemResponseDto>(expenseItem);

        return Ok(response);
    }


    //POST /api/trips/{travelRequestId}/expense-claim/items/{expenseItemId}/ receipts
    [HttpPost("items/{expenseItemId:int}/receipts")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadExpenseReceipt(
        int travelRequestId,
        int expenseItemId,
        [FromForm] UploadExpenseReceiptRequestDto dto)
    {
        var employeeId = CurrentUserHelper.GetEmployeeId(User);

        await using var fileStream = dto.File.OpenReadStream();

        var command = new UploadExpenseReceiptCommand
        {
            FileStream = fileStream,
            OriginalFileName = dto.File.FileName,
            FileSize = dto.File.Length
        };

        var receipt = await _expenseClaimService.UploadExpenseReceiptAsync(
            travelRequestId,
            expenseItemId,
            employeeId,
            command);

        if (receipt == null)
            return NotFound();

        var response = _mapper.Map<ExpenseReceiptResponseDto>(receipt);

        return Ok(response);
    }

    //GET /api/trips/{travelRequestId}/expense-claim/items/{expenseItemId}/ receipts /{ receiptId}
    [HttpGet("items/{expenseItemId:int}/receipts/{receiptId:int}")]
    public async Task<IActionResult> DownloadExpenseReceipt(
        int travelRequestId,
        int expenseItemId,
        int receiptId)
    {
        var employeeId = CurrentUserHelper.GetEmployeeId(User);

        var receipt = await _expenseClaimService.DownloadExpenseReceiptAsync(
            travelRequestId,
            expenseItemId,
            receiptId,
            employeeId);

        if (receipt == null)
            return NotFound();

        var extension = Path.GetExtension(receipt.FileName).ToLowerInvariant();

        var contentType = extension switch
        {
            ".pdf" => "application/pdf",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            _ => "application/octet-stream"
        };

        return File(
            receipt.FileStream,
            contentType,
            receipt.FileName);
    }


    
// DELETE /api/trips/{travelRequestId}/expense-claim/items/{expenseItemId}/receipts/{receiptId}

[HttpDelete("items/{expenseItemId:int}/receipts/{receiptId:int}")]
public async Task<IActionResult> DeleteExpenseReceipt(
    int travelRequestId,
    int expenseItemId,
    int receiptId)
{
    var employeeId = CurrentUserHelper.GetEmployeeId(User);

    var deleted = await _expenseClaimService
        .DeleteExpenseReceiptFromItemAsync(
            travelRequestId,
            expenseItemId,
            receiptId,
            employeeId);

    if (!deleted)
        return NotFound();

    return NoContent();
}



    //PUT /api/trips/{travelRequestId}/expense-claim/items/{expenseItemId}


    [HttpPut("items/{expenseItemId:int}")]
    public async Task<IActionResult> UpdateExpenseItem(
        int travelRequestId,
        int expenseItemId,
        [FromBody] UpdateExpenseItemRequestDto dto)
    {
        var employeeId = CurrentUserHelper.GetEmployeeId(User);

        var command = _mapper.Map<UpdateExpenseItemCommand>(dto);

        var expenseItem = await _expenseClaimService
            .UpdateExpenseItemInClaimAsync(
                travelRequestId,
                expenseItemId,
                employeeId,
                command);

        if (expenseItem == null)
            return NotFound();

        var response = _mapper.Map<ExpenseItemResponseDto>(expenseItem);

        return Ok(response);
    }


    //DELETE /api/trips/{travelRequestId}/expense-claim/items/{expenseItemId}

    [HttpDelete("items/{expenseItemId:int}")]
    public async Task<IActionResult> DeleteExpenseItem(
        int travelRequestId,
        int expenseItemId)
    {
        var employeeId = CurrentUserHelper.GetEmployeeId(User);

        var deleted = await _expenseClaimService
            .DeleteExpenseItemFromClaimAsync(
                travelRequestId,
                expenseItemId,
                employeeId);

        if (!deleted)
            return NotFound();

        return NoContent();
    }



    //POST /api/trips/{travelRequestId}/expense-claim/submit

    [HttpPost("submit")]
    public async Task<IActionResult> SubmitExpenseClaim(int travelRequestId)
    {
        var employeeId = CurrentUserHelper.GetEmployeeId(User);

        var expenseClaim = await _expenseClaimService
            .SubmitExpenseClaimForFinanceReviewAsync(
                travelRequestId,
                employeeId);

        if (expenseClaim == null)
            return NotFound();

        var response = _mapper.Map<ExpenseClaimResponseDto>(expenseClaim);

        return Ok(response);
    }



}