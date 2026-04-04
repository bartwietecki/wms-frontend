import type { CSSProperties } from "react";
import type { CreateEmployeeRequest } from "../../api/admin/employeesApi";

interface EmployeeFormFieldsProps {
  form: CreateEmployeeRequest;
  onChange: <K extends keyof CreateEmployeeRequest>(key: K, value: CreateEmployeeRequest[K]) => void;
  autoFocusFirst?: boolean;
}

export default function EmployeeFormFields({ form, onChange, autoFocusFirst }: EmployeeFormFieldsProps) {
  return (
    <>
      <div style={fieldStyle}>
        <label style={labelStyle}>First name</label>
        <input
          className="form-input"
          type="text"
          value={form.firstName}
          onChange={(e) => onChange("firstName", e.target.value)}
          required
          autoFocus={autoFocusFirst}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Last name</label>
        <input
          className="form-input"
          type="text"
          value={form.lastName}
          onChange={(e) => onChange("lastName", e.target.value)}
          required
        />
      </div>

      <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
        <label style={labelStyle}>Email</label>
        <input
          className="form-input"
          type="email"
          value={form.email}
          onChange={(e) => onChange("email", e.target.value)}
          required
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Position</label>
        <input
          className="form-input"
          type="text"
          value={form.position}
          onChange={(e) => onChange("position", e.target.value)}
          required
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Employment type</label>
        <select
          className="form-input"
          value={form.employmentType}
          onChange={(e) => onChange("employmentType", e.target.value)}
          required
        >
          <option value="" disabled>Select…</option>
          <option value="FULL_TIME">Full-time</option>
          <option value="PART_TIME">Part-time</option>
          <option value="CONTRACT">Contract</option>
          <option value="INTERNSHIP">Internship</option>
        </select>
      </div>

      <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
        <label style={checkboxLabelStyle}>
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => onChange("active", e.target.checked)}
            style={{ width: "auto", marginRight: 8 }}
          />
          Active employee
        </label>
      </div>
    </>
  );
}

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

const checkboxLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
  color: "var(--color-text-muted)",
  cursor: "pointer",
};
