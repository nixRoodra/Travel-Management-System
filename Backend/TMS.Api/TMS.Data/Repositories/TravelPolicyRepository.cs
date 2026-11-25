using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TMS.Business.Entities;
using TMS.Business.Interfaces.Repositories;
using TMS.Data.Context;

namespace TMS.Data.Repositories
{
    public class TravelPolicyRepository:ITravelPolicyRepository
    {
        private readonly ApplicationDbContext _context;

        public TravelPolicyRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<List<TravelPolicy>> GetApplicablePoliciesAsync(int gradeId, DateTime evaluationDateUtc)
        {
            return await _context.TravelPolicies
                .Where(policy=> 
                                policy.IsActive &&
                                policy.EffectiveFromUtc <= evaluationDateUtc &&
                                (policy.EffectiveToUtc == null || policy.EffectiveToUtc >= evaluationDateUtc) &&
                                (policy.GradeId== null || policy.GradeId== gradeId))
                        .ToListAsync();
        }
    }
}
