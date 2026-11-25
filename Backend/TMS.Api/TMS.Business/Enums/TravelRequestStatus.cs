namespace TMS.Business.Enums
{
    public enum TravelRequestStatus
    {
        Draft=1,
        PendingManagerApproval = 2,
        PendingFinanceApproval = 3,
        Approved = 4,
        Rejected = 5,
        Completed = 6,
        Cancelled = 7
    }
}
