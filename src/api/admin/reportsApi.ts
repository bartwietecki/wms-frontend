import { http } from "../http";
import { downloadPdf } from "../../utils/downloadPdf";
import type { AdminReport, AdminReportDetail, Page } from "./types";

export interface ReportFilters {
  status?: string;
  employeeId?: string;
  year?: string;
  month?: string;
}

export function getAdminReports(filters: ReportFilters = {}, page = 0, size = 20) {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.status) params.status = filters.status;
  if (filters.employeeId) params.employeeId = filters.employeeId;
  if (filters.year) params.year = filters.year;
  if (filters.month) params.month = filters.month;
  return http<Page<AdminReport>>("/api/admin/reports", { queryParams: params });
}

export function getAdminReport(id: number) {
  return http<AdminReportDetail>(`/api/admin/reports/${id}`);
}

export function approveReport(id: number) {
  return http<AdminReportDetail>(`/api/admin/reports/${id}/approve`, { method: "POST" });
}

export function rejectReport(id: number, adminComment: string) {
  return http<AdminReportDetail>(`/api/admin/reports/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ adminComment }),
  });
}

export function downloadAdminMonthlyReportPdf(
  reportId: number,
  employeeId: number,
  year: number,
  month: number
): Promise<void> {
  return downloadPdf(
    `/api/admin/reports/${reportId}/pdf`,
    `monthly-report-${employeeId}-${year}-${month}.pdf`
  );
}
