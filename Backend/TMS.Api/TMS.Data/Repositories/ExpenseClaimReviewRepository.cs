using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TMS.Business.Entities;
using TMS.Business.Enums;
using TMS.Business.Interfaces.Repositories;
using TMS.Data.Context;

namespace TMS.Data.Repositories
{
    public class ExpenseClaimReviewRepository: IExpenseClaimReviewRepository
    {
        private readonly ApplicationDbContext _context;

        public ExpenseClaimReviewRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ExpenseClaim>> GetSubmittedExpenseClaimsForFinanceAsync()
        {
            return await _context.ExpenseClaims
                .AsNoTracking()
                .Include(claim => claim.TravelRequest)
                    .ThenInclude(request => request.Employee)
                        .ThenInclude(employee => employee.User)
                .Include(claim => claim.ExpenseItems)
                    .ThenInclude(item => item.Receipts)
                .Where(claim => claim.Status == ExpenseClaimStatus.Submitted)
                .OrderBy(claim => claim.SubmittedAtUtc)
                .ToListAsync();
        }

        public async Task<ExpenseClaim?> GetExpenseClaimForFinanceReviewAsync(int expenseClaimId)
        {
            return await _context.ExpenseClaims
                .Include(claim => claim.TravelRequest)
                    .ThenInclude(request => request.Employee)
                        .ThenInclude(employee => employee.User)
                .Include(claim => claim.ExpenseItems)
                    .ThenInclude(item => item.Receipts)
                .FirstOrDefaultAsync(claim =>
                    claim.Id == expenseClaimId &&
                    claim.Status == ExpenseClaimStatus.Submitted);
        }

        public async Task<List<ExpenseClaimReview>> GetExpenseClaimReviewHistoryAsync(int expenseClaimId)
        {
            return await _context.ExpenseClaimReviews
                .AsNoTracking()
                .Include(review => review.FinanceEmployee)
                    .ThenInclude(employee => employee.User)
                .Where(review => review.ExpenseClaimId == expenseClaimId)
                .OrderByDescending(review => review.ReviewedAtUtc)
                .ThenByDescending(review => review.Id)
                .ToListAsync();
        }

        public async Task SaveFinanceExpenseClaimDecisionAsync(
    ExpenseClaim expenseClaim,
    ExpenseClaimReview review,
    Reimbursement? reimbursement = null)
        {
            await _context.ExpenseClaimReviews.AddAsync(review);

            if (reimbursement != null)
            {
                await _context.Reimbursements.AddAsync(reimbursement);
            }

            await _context.SaveChangesAsync();
        }
    }
}
