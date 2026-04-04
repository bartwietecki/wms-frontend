import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { updateEmployee } from "../../api/admin/employeesApi";
import type { UpdateEmployeeRequest } from "../../api/admin/employeesApi";
import type { Employee } from "../../api/admin/types";
import EmployeeFormFields from "./EmployeeFormFields";

interface EditEmployeeModalProps {
  employee: Employee;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditEmployeeModal({ employee, onClose, onSaved }: EditEmployeeModalProps) {
  const [form, setForm] = useState<UpdateEmployeeRequest>({
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    position: employee.position,
    employmentType: employee.employmentType,
    active: employee.active,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleChange<K extends keyof UpdateEmployeeRequest>(key: K, value: UpdateEmployeeRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateEmployee(employee.id, form);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle} role="dialog" aria-modal="true" aria-labelledby="edit-emp-title">
        <div style={headerStyle}>
          <div>
            <h2 id="edit-emp-title" style={titleStyle}>Edit Employee</h2>
            <p style={subtitleStyle}>{employee.firstName} {employee.lastName}</p>
          </div>
          <button style={closeBtnStyle} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          <EmployeeFormFields form={form} onChange={handleChange} />

          <div style={{ ...footerStyle, gridColumn: "1 / -1" }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
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
  alignItems: "flex-start",
  justifyContent: "space-between",
  padding: "var(--space-5) var(--space-6)",
  borderBottom: "1px solid var(--color-border)",
};

const titleStyle: CSSProperties = {
  fontSize: "var(--font-size-md)",
  fontWeight: 700,
  color: "var(--color-text)",
};

const subtitleStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-muted)",
  marginTop: "var(--space-1)",
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

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "var(--space-3)",
  paddingTop: "var(--space-2)",
};
