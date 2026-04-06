import type { CSSProperties } from "react";
import type { WorkEntryFilters } from "../../api/admin/workEntriesApi";
import Card from "../../components/ui/Card";

interface WorkEntryFilterBarProps {
  filters: WorkEntryFilters;
  search: string;
  validationError: string | null;
  onFiltersChange: (filters: WorkEntryFilters) => void;
  onSearchChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function WorkEntryFilterBar({
  filters,
  search,
  validationError,
  onFiltersChange,
  onSearchChange,
  onApply,
  onReset,
}: WorkEntryFilterBarProps) {
  function set<K extends keyof WorkEntryFilters>(key: K, value: string) {
    onFiltersChange({ ...filters, [key]: value || undefined });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onApply();
  }

  return (
    <Card style={{ marginBottom: "var(--space-6)" }}>
      <form onSubmit={handleSubmit}>
        <div style={gridStyle}>
          {/* Status */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Status</label>
            <select
              className="form-input"
              value={filters.status ?? ""}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Employee ID */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Employee ID</label>
            <input
              className="form-input"
              type="number"
              min="1"
              placeholder="e.g. 5"
              value={filters.employeeId ?? ""}
              onChange={(e) => set("employeeId", e.target.value)}
            />
          </div>

          {/* From */}
          <div style={fieldStyle}>
            <label style={labelStyle}>From</label>
            <input
              className="form-input"
              type="date"
              value={filters.from ?? ""}
              onChange={(e) => set("from", e.target.value)}
            />
          </div>

          {/* To */}
          <div style={fieldStyle}>
            <label style={labelStyle}>To</label>
            <input
              className="form-input"
              type="date"
              value={filters.to ?? ""}
              onChange={(e) => set("to", e.target.value)}
            />
          </div>

          {/* Client-side search */}
          <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Search <span style={hintStyle}>(filters current page by name or description)</span></label>
            <input
              className="form-input"
              type="text"
              placeholder="Employee name or description…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {validationError && <p style={validationStyle}>{validationError}</p>}

        <div style={footerStyle}>
          <button type="button" className="btn-secondary" onClick={onReset}>
            Reset
          </button>
          <button type="submit" className="btn-primary">
            Apply filters
          </button>
        </div>
      </form>
    </Card>
  );
}

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "var(--space-4)",
  marginBottom: "var(--space-4)",
};

const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-1)",
};

const labelStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
  color: "var(--color-text-muted)",
};

const hintStyle: CSSProperties = {
  fontWeight: 400,
  color: "var(--color-text-subtle)",
};

const validationStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  color: "var(--color-danger-text)",
  marginBottom: "var(--space-3)",
};

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "var(--space-3)",
};
