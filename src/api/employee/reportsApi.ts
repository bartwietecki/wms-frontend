import { http } from "../http";
import { downloadPdf } from "../../utils/downloadPdf";
import type { MonthlyReportPreview, MyReport } from "./types";

export function getMonthlyPreview(year: number, month: number) {
  return http<MonthlyReportPreview>("/api/reports/monthly/preview", {
    queryParams: { year: String(year), month: String(month) },
  });
}

export function submitMonthlyReport(year: number, month: number) {
  return http<MyReport>("/api/reports/monthly/submit", {
    method: "POST",
    queryParams: { year: String(year), month: String(month) },
  });
}

export function getMyReports() {
  return http<MyReport[]>("/api/reports/my");
}

export function downloadMonthlyReportPdf(reportId: number, year: number, month: number): Promise<void> {
  return downloadPdf(`/api/reports/${reportId}/pdf`, `monthly-report-${year}-${month}.pdf`);
}
