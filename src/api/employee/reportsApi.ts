import { http } from "../http";
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
