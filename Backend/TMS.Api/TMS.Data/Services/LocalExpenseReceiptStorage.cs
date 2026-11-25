
using Microsoft.Extensions.Configuration;
using TMS.Business.Interfaces.Services;

namespace TMS.Data.Services;

public class LocalExpenseReceiptStorage : IExpenseReceiptStorage
{
    private readonly string _storageDirectory;

    public LocalExpenseReceiptStorage(IConfiguration configuration)
    {
        var configuredPath = configuration["ReceiptStorage:RootPath"];

        _storageDirectory = Path.GetFullPath(
            configuredPath ?? Path.Combine(
                AppContext.BaseDirectory,
                "App_Data",
                "ExpenseReceipts"));
    }

    public async Task<string> SaveExpenseReceiptAsync(
        Stream fileStream,
        string fileExtension)
    {
        Directory.CreateDirectory(_storageDirectory);

        // Generate a unique filename.
        var generatedFileName = $"{Guid.NewGuid():N}{fileExtension}";

        var fullPath = Path.Combine(
            _storageDirectory,
            generatedFileName);

        await using var outputStream = new FileStream(
            fullPath,
            FileMode.CreateNew,
            FileAccess.Write,
            FileShare.None);

        await fileStream.CopyToAsync(outputStream);

        // Store only the relative filename in the database.
        return generatedFileName;
    }

    public Task DeleteExpenseReceiptAsync(string filePath)
    {
        if (string.IsNullOrWhiteSpace(filePath) ||
            filePath != Path.GetFileName(filePath))
        {
            throw new ArgumentException("Invalid receipt file path.");
        }

        var fullPath = Path.Combine(_storageDirectory, filePath);

        if (File.Exists(fullPath))
            File.Delete(fullPath);

        return Task.CompletedTask;
    }

    public Task<Stream?> OpenExpenseReceiptAsync(string filePath)
    {
        if (string.IsNullOrWhiteSpace(filePath) ||
            filePath != Path.GetFileName(filePath))
        {
            throw new ArgumentException("Invalid receipt file path.");
        }

        var fullPath = Path.Combine(_storageDirectory, filePath);

        if (!File.Exists(fullPath))
            return Task.FromResult<Stream?>(null);

        Stream stream = new FileStream(
            fullPath,
            FileMode.Open,
            FileAccess.Read,
            FileShare.Read);

        return Task.FromResult<Stream?>(stream);
    }
}
