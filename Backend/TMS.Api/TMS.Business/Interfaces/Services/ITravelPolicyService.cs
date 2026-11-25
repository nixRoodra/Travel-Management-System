using TMS.Business.Entities;

namespace TMS.Business.Interfaces.Services
{
    public interface ITravelPolicyService
    {

        Task<List<TravelRequestPolicyViolation>> EvaluateTravelRequestPoliciesAsync(TravelRequest travelRequest,int gradeId);
    }
}
