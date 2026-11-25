using TMS.Business.Entities;
using TMS.Business.Enums;
using TMS.Business.Interfaces.Repositories;
using TMS.Business.Interfaces.Services;
using TMS.Business.Models.Expense;

namespace TMS.Business.Services;

public class ExpenseClaimService : IExpenseClaimService
{
    private readonly IExpenseClaimRepository _expenseClaimRepository;
    private readonly ITravelRequestRepository _travelRequestRepository;

    private readonly IExpenseReceiptStorage _receiptStorage;

    public ExpenseClaimService(
        IExpenseClaimRepository expenseClaimRepository,
        ITravelRequestRepository travelRequestRepository,
        IExpenseReceiptStorage receiptStorage)
    {
        _expenseClaimRepository = expenseClaimRepository;
        _travelRequestRepository = travelRequestRepository;
        _receiptStorage = receiptStorage;
    }

    public async Task<ExpenseClaim> CreateExpenseClaimForTripAsync(
        int travelRequestId,
        int employeeId)
    {
        // 1. Retrieve the employee's travel request.
        var travelRequest =
            await _travelRequestRepository.GetTravelRequestForUpdateAsync(
                travelRequestId,
                employeeId);

        if (travelRequest == null)
        {
            throw new KeyNotFoundException(
                "Travel request was not found.");
        }

        // 2. Only approved trips can have expense claims.
        if (travelRequest.Status != TravelRequestStatus.Approved)
        {
            throw new InvalidOperationException(
                "An expense claim can only be created for an approved trip.");
        }

        // 3. Prevent duplicate claims for the same trip.
        var existingClaim =
            await _expenseClaimRepository.GetExpenseClaimByTravelRequestIdAsync(
                travelRequestId);

        if (existingClaim != null)
        {
            throw new InvalidOperationException(
                "An expense claim already exists for this trip.");
        }

        // 4. Create the draft claim.
        var expenseClaim = new ExpenseClaim
        {
            TravelRequestId = travelRequestId
        };

        return await _expenseClaimRepository.CreateExpenseClaimAsync(
            expenseClaim);
    }

    public async Task<ExpenseClaim?> GetExpenseClaimForTripAsync(
        int travelRequestId,
        int employeeId)
    {
        return await _expenseClaimRepository.GetExpenseClaimForEmployeeAsync(
            travelRequestId,
            employeeId);
    }


    public async Task<ExpenseItem?> AddExpenseItemToClaimAsync(
        int travelRequestId,
        int employeeId,
        AddExpenseItemCommand command)
    {
        var expenseClaim = await _expenseClaimRepository
            .GetExpenseClaimForEmployeeAsync(travelRequestId, employeeId);

        if (expenseClaim == null)
            return null;

        if (expenseClaim.Status != ExpenseClaimStatus.Draft &&
            expenseClaim.Status != ExpenseClaimStatus.ResubmissionRequested)
        {
            throw new InvalidOperationException(
                "Expense items cannot be added in the current claim status.");
        }

        if (string.IsNullOrWhiteSpace(command.Description))
            throw new ArgumentException("Expense description is required.");

        if (command.Amount <= 0)
            throw new ArgumentException("Expense amount must be greater than zero.");

        var expenseItem = new ExpenseItem
        {
            ExpenseDate = command.ExpenseDate,
            Description = command.Description.Trim(),
            Amount = command.Amount
        };

        expenseClaim.ExpenseItems.Add(expenseItem);

        await _expenseClaimRepository.SaveExpenseClaimChangesAsync();

        return expenseItem;
    }



    private const long MaxReceiptSize = 5 * 1024 * 1024;

    private static readonly Dictionary<string, byte[]> AllowedFileSignatures = new()
    {
        [".jpg"] = new byte[] { 0xFF, 0xD8, 0xFF },
        [".jpeg"] = new byte[] { 0xFF, 0xD8, 0xFF },
        [".png"] = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A },
        [".pdf"] = new byte[] { 0x25, 0x50, 0x44, 0x46 }
    };

    public async Task<ExpenseReceipt?> UploadExpenseReceiptAsync(
        int travelRequestId,
        int expenseItemId,
        int employeeId,
        UploadExpenseReceiptCommand command)
    {
        var expenseClaim = await _expenseClaimRepository
            .GetExpenseClaimForEmployeeAsync(travelRequestId, employeeId);

        if (expenseClaim == null)
            return null;

        if (expenseClaim.Status != ExpenseClaimStatus.Draft &&
            expenseClaim.Status != ExpenseClaimStatus.ResubmissionRequested)
        {
            throw new InvalidOperationException(
                "Receipts cannot be uploaded in the current claim status.");
        }

        var expenseItem = expenseClaim.ExpenseItems
            .FirstOrDefault(item => item.Id == expenseItemId);

        if (expenseItem == null)
            return null;

        if (command.FileSize <= 0 || command.FileSize > MaxReceiptSize)
            throw new ArgumentException("Receipt must be between 1 byte and 5 MB.");

        var extension = Path.GetExtension(command.OriginalFileName)
            .ToLowerInvariant();

        if (!AllowedFileSignatures.TryGetValue(extension, out var signature))
            throw new ArgumentException("Only JPG, JPEG, PNG and PDF files are allowed.");

        if (!command.FileStream.CanSeek)
            throw new ArgumentException("The uploaded file stream must support seeking.");

        var buffer = new byte[signature.Length];

        var originalPosition = command.FileStream.Position;

        try
        {
            var bytesRead = await command.FileStream.ReadAsync(buffer.AsMemory());

            if (bytesRead != signature.Length ||
                !buffer.SequenceEqual(signature))
            {
                throw new ArgumentException("The uploaded file content is invalid.");
            }
        }
        finally
        {
            command.FileStream.Position = originalPosition;
        }

        var storedFileName = await _receiptStorage.SaveExpenseReceiptAsync(
            command.FileStream,
            extension);

        try
        {
            var receipt = new ExpenseReceipt
            {
                ExpenseItemId = expenseItemId,
                FileName = Path.GetFileName(command.OriginalFileName),
                FilePath = storedFileName
            };

            expenseItem.Receipts.Add(receipt);

            await _expenseClaimRepository.SaveExpenseClaimChangesAsync();

            return receipt;
        }
        catch
        {
            await _receiptStorage.DeleteExpenseReceiptAsync(storedFileName);
            throw;
        }
    }


    public async Task<ExpenseReceiptDownload?> DownloadExpenseReceiptAsync(
        int travelRequestId,
        int expenseItemId,
        int receiptId,
        int employeeId)
    {
        var expenseClaim = await _expenseClaimRepository
            .GetExpenseClaimForEmployeeAsync(travelRequestId, employeeId);

        if (expenseClaim == null)
            return null;

        var receipt = expenseClaim.ExpenseItems
            .Where(item => item.Id == expenseItemId)
            .SelectMany(item => item.Receipts)
            .FirstOrDefault(receipt => receipt.Id == receiptId);

        if (receipt == null)
            return null;

        var fileStream = await _receiptStorage.OpenExpenseReceiptAsync(
            receipt.FilePath);

        if (fileStream == null)
            return null;

        return new ExpenseReceiptDownload
        {
            FileStream = fileStream,
            FileName = receipt.FileName
        };
    }


    public async Task<ExpenseItem?> UpdateExpenseItemInClaimAsync(
        int travelRequestId,
        int expenseItemId,
        int employeeId,
        UpdateExpenseItemCommand command)
    {
        var expenseClaim = await _expenseClaimRepository
            .GetExpenseClaimForEmployeeAsync(travelRequestId, employeeId);

        if (expenseClaim == null)
            return null;

        if (expenseClaim.Status != ExpenseClaimStatus.Draft &&
            expenseClaim.Status != ExpenseClaimStatus.ResubmissionRequested)
        {
            throw new InvalidOperationException(
                "Expense items cannot be modified in the current claim status.");
        }

        var expenseItem = expenseClaim.ExpenseItems
            .FirstOrDefault(item => item.Id == expenseItemId);

        if (expenseItem == null)
            return null;

        if (string.IsNullOrWhiteSpace(command.Description))
            throw new ArgumentException("Expense description is required.");

        if (command.Amount <= 0)
            throw new ArgumentException("Expense amount must be greater than zero.");

        expenseItem.ExpenseDate = command.ExpenseDate;
        expenseItem.Description = command.Description.Trim();
        expenseItem.Amount = command.Amount;

        await _expenseClaimRepository.SaveExpenseClaimChangesAsync();

        return expenseItem;
    }


    public async Task<bool> DeleteExpenseItemFromClaimAsync(
        int travelRequestId,
        int expenseItemId,
        int employeeId)
    {
        var expenseClaim = await _expenseClaimRepository
            .GetExpenseClaimForEmployeeAsync(travelRequestId, employeeId);

        if (expenseClaim == null)
            return false;

        if (expenseClaim.Status != ExpenseClaimStatus.Draft &&
            expenseClaim.Status != ExpenseClaimStatus.ResubmissionRequested)
        {
            throw new InvalidOperationException(
                "Expense items cannot be deleted in the current claim status.");
        }

        var expenseItem = expenseClaim.ExpenseItems
            .FirstOrDefault(item => item.Id == expenseItemId);

        if (expenseItem == null)
            return false;

        // Delete physical receipt files first.
        foreach (var receipt in expenseItem.Receipts)
        {
            await _receiptStorage.DeleteExpenseReceiptAsync(receipt.FilePath);
        }

        expenseClaim.ExpenseItems.Remove(expenseItem);

        await _expenseClaimRepository.SaveExpenseClaimChangesAsync();

        return true;
    }



    public async Task<ExpenseClaim?> SubmitExpenseClaimForFinanceReviewAsync(
        int travelRequestId,
        int employeeId)
    {
        var expenseClaim = await _expenseClaimRepository
            .GetExpenseClaimForEmployeeAsync(travelRequestId, employeeId);

        if (expenseClaim == null)
            return null;

        if (expenseClaim.Status != ExpenseClaimStatus.Draft &&
            expenseClaim.Status != ExpenseClaimStatus.ResubmissionRequested)
        {
            throw new InvalidOperationException(
                "This expense claim cannot be submitted in its current status.");
        }

        if (!expenseClaim.ExpenseItems.Any())
        {
            throw new InvalidOperationException(
                "Add at least one expense item before submitting the claim.");
        }

        expenseClaim.Status = ExpenseClaimStatus.Submitted;
        expenseClaim.SubmittedAtUtc = DateTime.UtcNow;

        await _expenseClaimRepository.SaveExpenseClaimChangesAsync();

        return expenseClaim;
    }





}