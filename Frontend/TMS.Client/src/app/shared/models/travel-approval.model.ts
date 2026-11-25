import { TravelRequestDto } from '../../features/travel-requests/travel-request.models';
import { ApprovalStatus, ApprovalType } from './tms-enums.model';

export interface TravelApprovalItemDto {
  id: number;
  travelRequestId: number;
  approvalType: ApprovalType;
  approvalStatus: ApprovalStatus;
  comments: string | null;
  createdAtUtc: string;
  actionDateUtc: string | null;
  employeeName: string;
  employeeCode: string;
  travelRequest: TravelRequestDto;
}

export interface ApproveTravelRequestPayload {
  comments?: string | null;
}

export interface RejectTravelRequestPayload {
  comments: string;
}
