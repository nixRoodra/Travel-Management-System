using Microsoft.EntityFrameworkCore;
using TMS.Business.Entities;
using TMS.Business.Interfaces.Repositories;
using TMS.Data.Context;

namespace TMS.Data.Repositories;

public class ExpenseClaimRepository : IExpenseClaimRepository
{
    private readonly ApplicationDbContext _context;

    public ExpenseClaimRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ExpenseClaim?> GetExpenseClaimByTravelRequestIdAsync(
        int travelRequestId)
    {
        return await _context.ExpenseClaims
            .Include(claim => claim.ExpenseItems)
                .ThenInclude(item => item.Receipts)
            .FirstOrDefaultAsync(claim =>
                claim.TravelRequestId == travelRequestId);
    }

    public async Task<ExpenseClaim?> GetExpenseClaimForEmployeeAsync(
        int travelRequestId,
        int employeeId)
    {
        return await _context.ExpenseClaims
            .Include(claim => claim.ExpenseItems)
                .ThenInclude(item => item.Receipts)
            .FirstOrDefaultAsync(claim =>
                claim.TravelRequestId == travelRequestId &&
                claim.TravelRequest.EmployeeId == employeeId);
    }

    public async Task<ExpenseClaim> CreateExpenseClaimAsync(
    ExpenseClaim expenseClaim)
    {
        await _context.ExpenseClaims.AddAsync(expenseClaim);
        await _context.SaveChangesAsync();

        return expenseClaim;
    }

    public async Task SaveExpenseClaimChangesAsync()
    {
        await _context.SaveChangesAsync();
    }


    public async Task DeleteExpenseItemAsync(ExpenseItem expenseItem)
{
    _context.ExpenseItems.Remove(expenseItem);

    await _context.SaveChangesAsync();
}

public async Task DeleteExpenseReceiptAsync(ExpenseReceipt receipt)
{
    _context.ExpenseReceipts.Remove(receipt);

    await _context.SaveChangesAsync();
}
}