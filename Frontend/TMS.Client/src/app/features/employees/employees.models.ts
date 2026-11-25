export interface RoleDto {
  id: number;
  name: string;
}

export interface EmployeeDto {
  employeeId: number;
  userId: number;
  fullName: string;
  email: string;
  employeeCode: string;
  roleId: number;
  roleName: string;
  departmentId: number;
  departmentName: string;
  designation: string;
  managerId: number | null;
  tmsAccountCreatedAt: string;
}

export interface CreateEmployeePayload {
  fullName: string;
  email: string;
  password: string;
  roleId: number;
  employeeCode: string;
  departmentId: number;
  designation: string;
  gradeId: number;
  managerId: number | null;
}

export interface DepartmentOption {
  id: number;
  name: string;
}

/**
 * Seeded EmployeeGrades from backend migration AddEmployeeGradesAndTravelPolicies_null
 * (used as reference choices until a dedicated /api/grades endpoint is added).
 */
export const SEEDED_GRADE_OPTIONS: readonly { id: number; label: string }[] = [
  { id: 1, label: 'G1 — Junior' },
  { id: 2, label: 'G2 — Associate' },
  { id: 3, label: 'G3 — Senior' },
  { id: 4, label: 'G4 — Manager' },
  { id: 5, label: 'G5 — Head of Department (HOD)' },
  { id: 6, label: 'G6 — Executive / Manager' },
];
