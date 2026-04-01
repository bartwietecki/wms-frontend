// Re-exported so admin code doesn't import from the employee folder.
export type { WorkEntry, WorkEntryStatus } from "../employee/types";

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
