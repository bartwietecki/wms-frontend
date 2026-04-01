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