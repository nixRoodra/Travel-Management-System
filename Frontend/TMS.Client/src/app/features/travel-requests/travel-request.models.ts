import {
  FlightClass,
  TrainClass,
  TravelMode,
  TravelRequestStatus,
} from '../../shared/models/tms-enums.model';

export interface CreateTravelRequestPayload {
  destination: string;
  purpose: string;
  travelMode: TravelMode;
  flightClass: FlightClass | null;
  trainClass: TrainClass | null;
  departureDate: string; // YYYY-MM-DD (DateOnly)
  returnDate: string; // YYYY-MM-DD (DateOnly)
  estimatedCost: number;
}

export interface TravelRequestDto {
  id: number;
  employeeId: number;
  destination: string;
  purpose: string;
  travelMode: TravelMode;
  flightClass: FlightClass | null;
  trainClass: TrainClass | null;
  departureDate: string;
  returnDate: string;
  estimatedCost: number;
  status: TravelRequestStatus;
  createdAtUtc: string;
  submittedAtUtc: string | null;
}
