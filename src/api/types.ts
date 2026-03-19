export type WorkEntryStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface WorkEntry {
    id: number;
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