
using AutoMapper;
using TMS.Api.DTOs.Expense;
using TMS.Api.DTOs.FinanceExpenseClaimReview;
using TMS.Api.DTOs.Responses;
using TMS.Business.Entities;
using TMS.Business.Models.Expense;

namespace TMS.Api.Mappings;

public class ExpenseClaimProfile : Profile
{
    public ExpenseClaimProfile()
    {
        CreateMap<ExpenseClaim, ExpenseClaimResponseDto>();
        CreateMap<ExpenseItem, ExpenseItemResponseDto>();
        CreateMap<ExpenseReceipt, ExpenseReceiptResponseDto>();
        CreateMap<AddExpenseItemRequestDto, AddExpenseItemCommand>();


        CreateMap<ExpenseClaim, FinanceExpenseClaimQueueResponseDto>()
            .ForMember(
                dest => dest.ExpenseClaimId,
                opt => opt.MapFrom(src => src.Id))
            .ForMember(
                dest => dest.EmployeeName,
                opt => opt.MapFrom(src => src.TravelRequest.Employee.User.FullName))
            .ForMember(
                dest => dest.EmployeeCode,
                opt => opt.MapFrom(src => src.TravelRequest.Employee.EmployeeCode))
            .ForMember(
                dest => dest.Destination,
                opt => opt.MapFrom(src => src.TravelRequest.Destination))
            .ForMember(
                dest => dest.Purpose,
                opt => opt.MapFrom(src => src.TravelRequest.Purpose))
            .ForMember(
                dest => dest.DepartureDate,
                opt => opt.MapFrom(src => src.TravelRequest.DepartureDate))
            .ForMember(
                dest => dest.ReturnDate,
                opt => opt.MapFrom(src => src.TravelRequest.ReturnDate))
            .ForMember(
                dest => dest.TotalClaimedAmount,
                opt => opt.MapFrom(src => src.ExpenseItems.Sum(item => item.Amount)))
            .ForMember(
                dest => dest.ExpenseItemCount,
                opt => opt.MapFrom(src => src.ExpenseItems.Count));



        CreateMap<ExpenseClaim, FinanceExpenseClaimDetailResponseDto>()
            .ForMember(
                dest => dest.ExpenseClaimId,
                opt => opt.MapFrom(src => src.Id))
            .ForMember(
                dest => dest.EmployeeName,
                opt => opt.MapFrom(src => src.TravelRequest.Employee.User.FullName))
            .ForMember(
                dest => dest.EmployeeCode,
                opt => opt.MapFrom(src => src.TravelRequest.Employee.EmployeeCode))
            .ForMember(
                dest => dest.Destination,
                opt => opt.MapFrom(src => src.TravelRequest.Destination))
            .ForMember(
                dest => dest.Purpose,
                opt => opt.MapFrom(src => src.TravelRequest.Purpose))
            .ForMember(
                dest => dest.DepartureDate,
                opt => opt.MapFrom(src => src.TravelRequest.DepartureDate))
            .ForMember(
                dest => dest.ReturnDate,
                opt => opt.MapFrom(src => src.TravelRequest.ReturnDate))
            .ForMember(
                dest => dest.TotalClaimedAmount,
                opt => opt.MapFrom(src => src.ExpenseItems.Sum(item => item.Amount)));

        CreateMap<ExpenseItem, FinanceExpenseItemResponseDto>()
            .ForMember(
                dest => dest.ExpenseItemId,
                opt => opt.MapFrom(src => src.Id));

        CreateMap<ExpenseReceipt, FinanceExpenseReceiptResponseDto>()
            .ForMember(
                dest => dest.ReceiptId,
                opt => opt.MapFrom(src => src.Id));


        CreateMap<ExpenseClaimReview, ExpenseClaimReviewHistoryResponseDto>()
            .ForMember(
                dest => dest.ReviewId,
                opt => opt.MapFrom(src => src.Id))
            .ForMember(
                dest => dest.FinanceEmployeeName,
                opt => opt.MapFrom(src => src.FinanceEmployee.User.FullName));


        CreateMap<Reimbursement, FinanceReimbursementResponseDto>()
            .ForMember(
                dest => dest.ReimbursementId,
                opt => opt.MapFrom(src => src.Id))
            .ForMember(
                dest => dest.EmployeeName,
                opt => opt.MapFrom(src => src.ExpenseClaim.TravelRequest.Employee.User.FullName))
            .ForMember(
                dest => dest.EmployeeCode,
                opt => opt.MapFrom(src => src.ExpenseClaim.TravelRequest.Employee.EmployeeCode))
            .ForMember(
                dest => dest.Destination,
                opt => opt.MapFrom(src => src.ExpenseClaim.TravelRequest.Destination))
            .ForMember(
                dest => dest.Purpose,
                opt => opt.MapFrom(src => src.ExpenseClaim.TravelRequest.Purpose));


        CreateMap<Reimbursement, ReimbursementDetailResponseDto>()
            .ForMember(
                dest => dest.ReimbursementId,
                opt => opt.MapFrom(src => src.Id))
            .ForMember(
                dest => dest.EmployeeName,
                opt => opt.MapFrom(src => src.ExpenseClaim.TravelRequest.Employee.User.FullName))
            .ForMember(
                dest => dest.EmployeeCode,
                opt => opt.MapFrom(src => src.ExpenseClaim.TravelRequest.Employee.EmployeeCode))
            .ForMember(
                dest => dest.Destination,
                opt => opt.MapFrom(src => src.ExpenseClaim.TravelRequest.Destination))
            .ForMember(
                dest => dest.Purpose,
                opt => opt.MapFrom(src => src.ExpenseClaim.TravelRequest.Purpose))
            .ForMember(
                dest => dest.PaidByEmployeeName,
                opt => opt.MapFrom(src => src.PaidByEmployee != null
                    ? src.PaidByEmployee.User.FullName
                    : null));


        CreateMap<Reimbursement, EmployeeReimbursementResponseDto>()
            .ForMember(
                dest => dest.ReimbursementId,
                opt => opt.MapFrom(src => src.Id))
            .ForMember(
                dest => dest.Destination,
                opt => opt.MapFrom(src => src.ExpenseClaim.TravelRequest.Destination))
            .ForMember(
                dest => dest.Purpose,
                opt => opt.MapFrom(src => src.ExpenseClaim.TravelRequest.Purpose));
    }
}
