export type WorkEntryStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface WorkEntry {
    id: number;
    employeeId: number;
    employeeName: string;
    workDate: string;
    minutes: number;
    description: string;
    status: WorkEntryStatus;
}

export interface CreateWorkEntryRequest {
    workDate: string;
    minutes: number;
    description: string;
}

export interface EmployeeDashboard {
    totalHoursThisMonth: number;
    pendingEntriesCount: number;
    approvedEntriesCount: number;
    rejectedEntriesCount: number;
    leaveDaysRemaining: number;
}

export interface EmployeeProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    employmentType: string;
    active: boolean;
    departmentName: string;
    positionName: string;
}

export interface UpdateProfileRequest {
    firstName: string;
    lastName: string;
}

export type LeaveRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type LeaveRequestType = "HOLIDAY" | "SICK_LEAVE";

export interface LeaveRequest {
    id: number;
    employeeId: number;
    employeeName: string;
    type: LeaveRequestType;
    startDate: string;
    endDate: string;
    status: LeaveRequestStatus;
    reason: string | null;
    createdAt: string;
}

export interface CreateLeaveRequestRequest {
    type: LeaveRequestType;
    startDate: string;
    endDate: string;
    reason?: string;
}