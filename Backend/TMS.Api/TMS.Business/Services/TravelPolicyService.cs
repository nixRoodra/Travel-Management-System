using TMS.Business.Entities;
using TMS.Business.Enums;
using TMS.Business.Interfaces.Repositories;
using TMS.Business.Interfaces.Services;
using System.Globalization;

namespace TMS.Business.Services
{
    public class TravelPolicyService : ITravelPolicyService
    {
        private readonly ITravelPolicyRepository _travelPolicyRepository;

        public TravelPolicyService(
            ITravelPolicyRepository travelPolicyRepository)
        {
            _travelPolicyRepository = travelPolicyRepository;
        }

        public async Task<List<TravelRequestPolicyViolation>>
    EvaluateTravelRequestPoliciesAsync(
        TravelRequest travelRequest,
        int gradeId)
        {
            var evaluationDateUtc = DateTime.UtcNow;

            var policies = await _travelPolicyRepository
                .GetApplicablePoliciesAsync(
                    gradeId,
                    evaluationDateUtc);

            var violations = new List<TravelRequestPolicyViolation>();

            EvaluateBudgetPolicy(
                travelRequest,
                policies,
                violations,
                evaluationDateUtc,
                gradeId);


            EvaluateFlightClassPolicy(
                travelRequest,
                policies,
                violations,
                evaluationDateUtc,
                gradeId);

            EvaluateTrainClassPolicy(
                travelRequest,
                policies,
                violations,
                evaluationDateUtc,
                gradeId);

            return violations;
        }




        //Helper 

        private static List<TravelPolicy> GetSelectedPolicies(
    List<TravelPolicy> policies,
    TravelPolicyType policyType,
    int gradeId)
        {
            var gradePolicies = policies
                .Where(policy =>
                    policy.PolicyType == policyType &&
                    policy.GradeId == gradeId)
                .ToList();

            if (gradePolicies.Count > 0)
                return gradePolicies;

            return policies
                .Where(policy =>
                    policy.PolicyType == policyType &&
                    policy.GradeId == null)
                .ToList();
        }
        private static void EvaluateBudgetPolicy(TravelRequest travelRequest,
    List<TravelPolicy> policies,
    List<TravelRequestPolicyViolation> violations,
    DateTime evaluationDateUtc,
    int gradeId)
        {
            var budgetPolicies = GetSelectedPolicies(
                policies,
                TravelPolicyType.MaxEstimatedCost,
                gradeId);

            if (budgetPolicies.Count == 0)
                return;


            if (budgetPolicies.Count > 1)
                throw new InvalidOperationException(
                    "Multiple budget policies exist for the selected scope.");

            var selectedPolicy = budgetPolicies[0];

            if (!selectedPolicy.NumericValue.HasValue)
                throw new InvalidOperationException(
                    "The selected budget policy has no numeric value.");

            var maximumAllowedBudget = selectedPolicy.NumericValue!.Value;

            if (travelRequest.EstimatedCost > maximumAllowedBudget)
            {
                violations.Add(new TravelRequestPolicyViolation
                {
                    TravelRequestId = travelRequest.Id,
                    TravelPolicyId = selectedPolicy.Id,
                    PolicyType = TravelPolicyType.MaxEstimatedCost,

                    Description = "Estimated travel cost exceeds the permitted budget.",

                    ActualValue = travelRequest.EstimatedCost.ToString(
                        "0.00", CultureInfo.InvariantCulture),

                    AllowedValue = maximumAllowedBudget.ToString("0.00", CultureInfo.InvariantCulture),

                    DetectedAtUtc = evaluationDateUtc
                });
            }
        }

        private static void EvaluateFlightClassPolicy(
    TravelRequest travelRequest,
    List<TravelPolicy> policies,
    List<TravelRequestPolicyViolation> violations,
    DateTime evaluationDateUtc,
    int gradeId)
        {

            if (travelRequest.TravelMode != TravelMode.Flight)
                return;

            var flightPolicies = GetSelectedPolicies(
                policies,
                TravelPolicyType.AllowedFlightClass,
                gradeId);

            if (flightPolicies.Count == 0)
                return;


            var allowedClasses = flightPolicies
                .Where(policy => policy.FlightClass.HasValue)
                .Select(policy => policy.FlightClass!.Value)
                .ToHashSet();

            if (travelRequest.FlightClass.HasValue &&
                !allowedClasses.Contains(travelRequest.FlightClass.Value))
            {
                violations.Add(new TravelRequestPolicyViolation
                {
                    TravelRequestId = travelRequest.Id,

                    TravelPolicyId = flightPolicies.Count == 1
                        ? flightPolicies[0].Id
                        : null,

                    PolicyType = TravelPolicyType.AllowedFlightClass,
                    Description = "Requested flight class is not permitted.",
                    ActualValue = travelRequest.FlightClass.Value.ToString(),

                    AllowedValue = string.Join(", ", allowedClasses.OrderBy(c => c)),

                    DetectedAtUtc = evaluationDateUtc
                });
            }
        }

        private static void EvaluateTrainClassPolicy(
            TravelRequest travelRequest,
            List<TravelPolicy> policies,
            List<TravelRequestPolicyViolation> violations,
            DateTime evaluationDateUtc,
            int gradeId)
        {

            if (travelRequest.TravelMode != TravelMode.Train)
                return;

            var trainPolicies = GetSelectedPolicies(
    policies,
    TravelPolicyType.AllowedTrainClass,
    gradeId);

            if (trainPolicies.Count == 0)
                return;

            var allowedClasses = trainPolicies
                .Where(policy => policy.TrainClass.HasValue)
                .Select(policy => policy.TrainClass!.Value)
                .ToHashSet();


            if(travelRequest.TrainClass.HasValue && !allowedClasses.Contains(travelRequest.TrainClass.Value))
            {
                violations.Add(new TravelRequestPolicyViolation
                {
                    TravelRequestId = travelRequest.Id,

                    TravelPolicyId = trainPolicies.Count == 1
                        ? trainPolicies[0].Id
                        : null,

                    PolicyType = TravelPolicyType.AllowedTrainClass,
                    Description = "Requested train class is not permitted.",
                    ActualValue = travelRequest.TrainClass.Value.ToString(),

                    AllowedValue = string.Join(", ", allowedClasses.OrderBy(c => c)),

                    DetectedAtUtc = evaluationDateUtc
                });
            }
        }
    }
}