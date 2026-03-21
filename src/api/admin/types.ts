// Admin domain uses the same WorkEntry shape from the backend.
// Re-exported here so admin code doesn't import from the employee folder.
export type { WorkEntry, WorkEntryStatus } from "../employee/types";
