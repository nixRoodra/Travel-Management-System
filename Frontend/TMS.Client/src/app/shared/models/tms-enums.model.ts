import { TmsStatus } from './status.model';

// Numeric enum values match ASP.NET Core System.Text.Json default serialization.
export enum TravelMode {
  Flight = 1,
  Train = 2,
}

export enum FlightClass {
  Economy = 1,
  PremiumEconomy = 2,
  Business = 3,
  FirstClass = 4,
}

export enum TrainClass {
  Sleeper = 1,
  AC3Tier = 2,
  AC2Tier = 3,
  AC1Tier = 4,
}

export enum TravelRequestStatus {
  Draft = 1,
  PendingManagerApproval = 2,
  PendingFinanceApproval = 3,
  Approved = 4,
  Rejected = 5,
  Completed = 6,
  Cancelled = 7,
}

export enum ExpenseClaimStatus {
  Draft = 1,
  Submitted = 2,
  ResubmissionRequested = 3,
  Approved = 4,
  Rejected = 5,
}

export enum ReimbursementStatus {
  PendingPayment = 1,
  Paid = 2,
}

export enum ApprovalType {
  Manager = 1,
  Finance = 2,
}

export enum ApprovalStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
}

export enum ExpenseClaimReviewDecision {
  Approved = 1,
  Rejected = 2,
  ResubmissionRequested = 3,
}

export const TRAVEL_MODE_OPTIONS: readonly { value: TravelMode; label: string }[] = [
  { value: TravelMode.Flight, label: 'Flight' },
  { value: TravelMode.Train, label: 'Train' },
];

export const FLIGHT_CLASS_OPTIONS: readonly { value: FlightClass; label: string }[] = [
  { value: FlightClass.Economy, label: 'Economy' },
  { value: FlightClass.PremiumEconomy, label: 'Premium Economy' },
  { value: FlightClass.Business, label: 'Business' },
  { value: FlightClass.FirstClass, label: 'First Class' },
];

export const TRAIN_CLASS_OPTIONS: readonly { value: TrainClass; label: string }[] = [
  { value: TrainClass.Sleeper, label: 'Sleeper' },
  { value: TrainClass.AC3Tier, label: 'AC 3-Tier' },
  { value: TrainClass.AC2Tier, label: 'AC 2-Tier' },
  { value: TrainClass.AC1Tier, label: 'AC 1-Tier' },
];

export function formatTravelMode(mode: TravelMode): string {
  return TRAVEL_MODE_OPTIONS.find((o) => o.value === mode)?.label ?? 'Unknown';
}

export function formatFlightClass(flightClass: FlightClass | null): string {
  if (flightClass == null) return '—';
  return FLIGHT_CLASS_OPTIONS.find((o) => o.value === flightClass)?.label ?? 'Unknown';
}

export function formatTrainClass(trainClass: TrainClass | null): string {
  if (trainClass == null) return '—';
  return TRAIN_CLASS_OPTIONS.find((o) => o.value === trainClass)?.label ?? 'Unknown';
}

export function mapTravelRequestStatus(status: TravelRequestStatus): TmsStatus {
  switch (status) {
    case TravelRequestStatus.Draft:
      return 'Draft';
    case TravelRequestStatus.PendingManagerApproval:
      return 'PendingManagerApproval';
    case TravelRequestStatus.PendingFinanceApproval:
      return 'PendingFinanceApproval';
    case TravelRequestStatus.Approved:
      return 'Approved';
    case TravelRequestStatus.Rejected:
      return 'Rejected';
    case TravelRequestStatus.Completed:
      return 'Completed';
    case TravelRequestStatus.Cancelled:
      return 'Cancelled';
    default:
      return 'Draft';
  }
}

export function mapExpenseClaimStatus(status: ExpenseClaimStatus): TmsStatus {
  switch (status) {
    case ExpenseClaimStatus.Draft:
      return 'Draft';
    case ExpenseClaimStatus.Submitted:
      return 'Submitted';
    case ExpenseClaimStatus.ResubmissionRequested:
      return 'ResubmissionRequested';
    case ExpenseClaimStatus.Approved:
      return 'Approved';
    case ExpenseClaimStatus.Rejected:
      return 'Rejected';
    default:
      return 'Draft';
  }
}

export function mapReimbursementStatus(status: ReimbursementStatus): TmsStatus {
  switch (status) {
    case ReimbursementStatus.PendingPayment:
      return 'PendingPayment';
    case ReimbursementStatus.Paid:
      return 'Paid';
    default:
      return 'PendingPayment';
  }
}

export function mapApprovalStatus(status: ApprovalStatus): TmsStatus {
  switch (status) {
    case ApprovalStatus.Pending:
      return 'Pending';
    case ApprovalStatus.Approved:
      return 'Approved';
    case ApprovalStatus.Rejected:
      return 'Rejected';
    default:
      return 'Pending';
  }
}

export function mapExpenseReviewDecision(decision: ExpenseClaimReviewDecision): TmsStatus {
  switch (decision) {
    case ExpenseClaimReviewDecision.Approved:
      return 'Approved';
    case ExpenseClaimReviewDecision.Rejected:
      return 'Rejected';
    case ExpenseClaimReviewDecision.ResubmissionRequested:
      return 'ResubmissionRequested';
    default:
      return 'Submitted';
  }
}
