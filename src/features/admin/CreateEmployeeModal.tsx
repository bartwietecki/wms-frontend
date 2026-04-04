import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { createEmployee } from "../../api/admin/employeesApi";
import type { CreateEmployeeRequest } from "../../api/admin/employeesApi";

interface CreateEmployeeModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const EMPTY_FORM: CreateEmployeeRequest = {
  firstName: "",
  lastName: "",
  email: "",
  position: "",
  employmentType: "",
  active: true,
};

export default function CreateEmployeeModal({ onClose, onCreated }: CreateEmployeeModalProps) {
  const [form, setForm] = useState<CreateEmployeeRequest>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function set<K extends keyof CreateEmployeeRequest>(key: K, value: CreateEmployeeRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createEmployee(form);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create employee");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle} role="dialog" aria-modal="true" aria-labelledby="create-emp-title">
        {/* Header */}
        <div style={headerStyle}>
          <h2 id="create-emp-title" style={titleStyle}>Add Employee</h2>
          <button style={closeBtnStyle} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>First name</label>
            <input
              className="form-input"
              type="text"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Last name</label>
            <input
              className="form-input"
              type="text"
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              required
            />
          </div>

          <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Email</label>
            <input
              className="form-input"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Position</label>
            <input
              className="form-input"
              type="text"
              value={form.position}
              onChange={(e) => set("position", e.target.value)}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Employment type</label>
            <select
              className="form-input"
              value={form.employmentType}
              onChange={(e) => set("employmentType", e.target.value)}
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
                onChange={(e) => set("active", e.target.checked)}
                style={{ width: "auto", marginRight: 8 }}
              />
              Active employee
            </label>
          </div>

          <div style={{ ...footerStyle, gridColumn: "1 / -1" }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Creating…" : "Create employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 200,
  padding: "var(--space-6)",
};

const modalStyle: CSSProperties = {
  background: "var(--color-surface)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  width: "100%",
  maxWidth: 500,
  overflow: "hidden",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "var(--space-5) var(--space-6)",
  borderBottom: "1px solid var(--color-border)",
};

const titleStyle: CSSProperties = {
  fontSize: "var(--font-size-md)",
  fontWeight: 700,
  color: "var(--color-text)",
};

const closeBtnStyle: CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 16,
  color: "var(--color-text-muted)",
  cursor: "pointer",
  padding: "2px 6px",
  borderRadius: "var(--radius-sm)",
  lineHeight: 1,
};

const errorStyle: CSSProperties = {
  background: "var(--color-danger-bg)",
  color: "var(--color-danger-text)",
  border: "1px solid var(--color-danger-border)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-3) var(--space-4)",
  margin: "var(--space-4) var(--space-6) 0",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
};

const formStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "var(--space-4)",
  padding: "var(--space-5) var(--space-6) var(--space-6)",
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

const checkboxLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
  color: "var(--color-text-muted)",
  cursor: "pointer",
};

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "var(--space-3)",
  paddingTop: "var(--space-2)",
};
