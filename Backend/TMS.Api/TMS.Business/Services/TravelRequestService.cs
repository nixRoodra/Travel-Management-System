using TMS.Business.Entities;
using TMS.Business.Enums;
using TMS.Business.Interfaces.Repositories;
using TMS.Business.Interfaces.Services;
using TMS.Business.Models.TravelRequests;

namespace TMS.Business.Services
{
    public class TravelRequestService : ITravelRequestService
    {
        private readonly ITravelRequestRepository _travelRequestRepository;
        private readonly ITravelPolicyService _travelPolicyService;
        public TravelRequestService(ITravelRequestRepository travelRequestRepository,ITravelPolicyService travelPolicyService)
        {
            _travelRequestRepository = travelRequestRepository;
            _travelPolicyService = travelPolicyService;
        }
        public async Task<TravelRequest> CreateTravelRequestAsync(CreateTravelRequestCommand command)
        {
           
            ValidateTravelRequest(command);


        var travelRequest = new TravelRequest
            {
                EmployeeId = command.EmployeeId,
                Destination = command.Destination.Trim(),
                Purpose = command.Purpose.Trim(),
                TravelMode = command.TravelMode,
                FlightClass = command.FlightClass,
                TrainClass = command.TrainClass,
                DepartureDate = command.DepartureDate,
                ReturnDate = command.ReturnDate,
                EstimatedCost = command.EstimatedCost,
                Status = TravelRequestStatus.Draft,
                CreatedAtUtc = DateTime.UtcNow,
            };

            return await _travelRequestRepository.CreateTravelRequestAsync(travelRequest);

        }

        public async Task<TravelRequest?> GetTravelRequestByIdAsync(int travelRequestId, int employeeId)
        {
            return await _travelRequestRepository
                .GetTravelRequestByIdAsync(travelRequestId, employeeId);
        }

        public async Task<List<TravelRequest>> GetEmployeeTravelRequestsAsync(int employeeId)
        {
            return await _travelRequestRepository.GetEmployeeTravelRequestsAsync(employeeId);
        }

        public async Task<TravelRequest?> UpdateTravelRequestAsync(int travelRequestId, CreateTravelRequestCommand command)
        {
            var travelRequest = await _travelRequestRepository.GetTravelRequestForUpdateAsync(travelRequestId, command.EmployeeId);

            if (travelRequest is null) 
            {
                return null;
            }

            ValidateDraftStatus(travelRequest);
            ValidateTravelRequest(command);

            travelRequest.Destination = command.Destination.Trim();
            travelRequest.Purpose = command.Purpose.Trim();
            travelRequest.TravelMode = command.TravelMode;
            travelRequest.FlightClass = command.FlightClass;
            travelRequest.TrainClass = command.TrainClass;
            travelRequest.DepartureDate = command.DepartureDate;
            travelRequest.ReturnDate = command.ReturnDate;
            travelRequest.EstimatedCost = command.EstimatedCost;

            await _travelRequestRepository.SaveChangesAsync();

            return travelRequest;

        }

        public async Task<TravelRequest?> SubmitTravelRequestAsync(int travelRequestId, int employeeId)
        {
            var travelRequest = await _travelRequestRepository.GetTravelRequestForUpdateAsync(travelRequestId, employeeId);

            if(travelRequest is null) 
                return null;

            ValidateDraftStatus(travelRequest);

            var gradeId = travelRequest.Employee.GradeId;

            //if an employee has no assigned manager later we'll add some thing to 
            var managerId = travelRequest.Employee.ManagerId;

            if (managerId is null)
            {
                throw new InvalidOperationException(
                    "Your employee profile does not have an assigned manager. Please contact HR.");
            }

            var violations = await _travelPolicyService.EvaluateTravelRequestPoliciesAsync(travelRequest, gradeId);

            var managerApproval = new TravelApproval
            {
                TravelRequestId = travelRequest.Id,
                ApprovalType = ApprovalType.Manager,
                ApprovalStatus = ApprovalStatus.Pending,
                ApproverEmployeeId = managerId.Value
            };

            travelRequest.Status=TravelRequestStatus.PendingManagerApproval;
            travelRequest.SubmittedAtUtc = DateTime.UtcNow;

            await _travelRequestRepository.SaveTravelRequestSubmissionAsync(travelRequest, violations, managerApproval);

            return travelRequest;
        }









        //Helper Methods
        private static void ValidateTravelRequest(CreateTravelRequestCommand command)
        {
            ValidateDates(command.DepartureDate, command.ReturnDate);
            ValidateEstimatedCost(command.EstimatedCost);
            ValidateRequiredFields(command.Destination, command.Purpose);
            ValidateTravelModeAndClass(command);
        }

        private static void ValidateDates(DateOnly departureDate, DateOnly returnDate)
        {
            if (departureDate > returnDate)
                throw new ArgumentException(
                    "Departure date cannot be after return date.");
        }

        private static void ValidateEstimatedCost(decimal estimatedCost)
        {
            if (estimatedCost <= 0)
                throw new ArgumentException(
                    "Estimated cost must be greater than zero.");
        }

        private static void ValidateRequiredFields(string destination, string purpose)
        {
            if (string.IsNullOrWhiteSpace(destination))
                throw new ArgumentException("Destination is required.");

            if (string.IsNullOrWhiteSpace(purpose))
                throw new ArgumentException("Purpose is required.");
        }

        private static void ValidateDraftStatus(TravelRequest travelRequest)
        {
            if (travelRequest.Status != TravelRequestStatus.Draft)
                throw new InvalidOperationException(
                    "Only draft travel requests can be updated.");
        }
        private static void ValidateTravelModeAndClass(CreateTravelRequestCommand command)
        {
            switch (command.TravelMode)
            {
                case TravelMode.Flight:
                    if (!Enum.IsDefined(command.TravelMode))
                        throw new ArgumentException("Invalid travel mode.");    

                    if (!command.FlightClass.HasValue ||
                        !Enum.IsDefined(command.FlightClass.Value))
                        throw new ArgumentException("Select a valid flight class.");

                    if (command.TrainClass.HasValue)
                        throw new ArgumentException("Train class must not be provided for flight travel.");

                    break;

                case TravelMode.Train:
                    if (!command.TrainClass.HasValue ||
                        !Enum.IsDefined(command.TrainClass.Value))
                        throw new ArgumentException("Select a valid train class.");

                    if (command.FlightClass.HasValue)
                        throw new ArgumentException("Flight class must not be provided for train travel.");

                    break;

                default:
                    throw new ArgumentException("Invalid travel mode.");
            }
        }
    }
}

