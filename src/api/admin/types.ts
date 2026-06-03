import type { ReportStatus, ReportEntry } from "../employee/types";

// Re-exported so admin code doesn't import from the employee folder.
export type { WorkEntry, WorkEntryStatus } from "../employee/types";
export type { LeaveRequest, LeaveRequestStatus, LeaveRequestType } from "../employee/types";
export type { ReportStatus, ReportEntry };

export interface AdminDashboard {
  pendingApprovalsCount: number;
  activeEmployeesCount: number;
  employeesOnLeaveToday: number;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  employmentType: string;
  active: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;   // current page (0-indexed)
  size: number;
}

export interface AdminReport {
  id: number;
  employeeId: number;
  employeeName: string;
  year: number;
  month: number;
  totalHours: number;
  totalMinutes: number;
  status: ReportStatus;
  submittedAt: string;
  reviewedAt: string | null;
  adminComment: string | null;
}

export interface AdminReportDetail extends AdminReport {
  entries: ReportEntry[];
}
