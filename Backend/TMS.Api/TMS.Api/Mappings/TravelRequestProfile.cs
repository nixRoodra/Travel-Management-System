using AutoMapper;
using TMS.Api.DTOs.Approvals;
using TMS.Api.DTOs.TravelRequest;
using TMS.Business.Entities;
using TMS.Business.Models.TravelRequests;

namespace TMS.Api.Mappings
{
    public class TravelRequestProfile:Profile
    {
        public TravelRequestProfile() {

            // DTO to Command
            CreateMap<CreateTravelRequestDto, CreateTravelRequestCommand>();

            // Entity to DTO 
            CreateMap<TravelRequest, TravelRequestResponseDto>();

            CreateMap<TravelApproval, ManagerApprovalResponseDto>()
                .ForMember(
                    dest => dest.EmployeeName,
                    opt => opt.MapFrom(src => src.TravelRequest.Employee.User.FullName))
                .ForMember(
                    dest => dest.EmployeeCode,
                    opt => opt.MapFrom(src => src.TravelRequest.Employee.EmployeeCode));
                    }
    }
}
