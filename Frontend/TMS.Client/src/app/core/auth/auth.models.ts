import { UserRole } from '../../shared/models/role.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;
  refreshTokenExpiresAtUtc: string;
  userId: number;
  employeeId: number;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface AuthUser {
  userId: number;
  employeeId: number;
  fullName: string;
  email: string;
  role: UserRole;
}
