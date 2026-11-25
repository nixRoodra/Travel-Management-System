using System;
using System.Collections.Generic;
using System.Text;
using TMS.Business.Entities;

namespace TMS.Business.Interfaces.Repositories
{
    public interface ITravelPolicyRepository
    {
        Task<List<TravelPolicy>> GetApplicablePoliciesAsync(int gradeId,DateTime evaluationDateUtc);
    }
}
