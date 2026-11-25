
namespace TMS.Business.Interfaces.Services;

public interface IExpenseReceiptStorage
{
    Task<string> SaveExpenseReceiptAsync(Stream fileStream, string fileExtension);

    Task<Stream?> OpenExpenseReceiptAsync(string filePath);

    Task DeleteExpenseReceiptAsync(string filePath);


}
