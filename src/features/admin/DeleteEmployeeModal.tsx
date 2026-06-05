import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import type { Employee } from "../../api/admin/types";
import { deleteEmployee } from "../../api/admin/employeesApi";
import { parseApiError } from "../../utils/apiError";

interface DeleteEmployeeModalProps {
  employee: Employee;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteEmployeeModal({ employee, onClose, onDeleted }: DeleteEmployeeModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleConfirm() {
    setDeleting(true);
    setError(null);
    try {
      await deleteEmployee(employee.id);
      onDeleted();
    } catch (err) {
      setError(parseApiError(err, "Failed to delete employee"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle} role="dialog" aria-modal="true" aria-labelledby="delete-emp-title">
        <div style={headerStyle}>
          <h2 id="delete-emp-title" style={titleStyle}>Delete Employee</h2>
          <button style={closeBtnStyle} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div style={bodyStyle}>
          <p style={messageStyle}>
            Are you sure you want to delete this employee? This action cannot be undone.
          </p>
          <div style={previewStyle}>
            <span style={previewLabelStyle}>Name</span>
            <span>{employee.firstName} {employee.lastName}</span>
            <span style={previewLabelStyle}>Email</span>
            <span>{employee.email}</span>
            <span style={previewLabelStyle}>Position</span>
            <span>{employee.position}</span>
          </div>

          {error && (
            <div style={errorStyle}>
              <strong>Cannot delete employee.</strong> {error}
            </div>
          )}
        </div>

        <div style={footerStyle}>
          <button className="btn-secondary" onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button className="btn-danger" onClick={handleConfirm} disabled={deleting}>
            {deleting ? "Deleting…" : "Yes, delete"}
          </button>
        </div>
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
  maxWidth: 420,
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
  color: "var(--color-danger-text)",
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

const bodyStyle: CSSProperties = {
  padding: "var(--space-5) var(--space-6)",
};

const messageStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-muted)",
  marginBottom: "var(--space-4)",
};

const previewStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: "var(--space-1) var(--space-4)",
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-3) var(--space-4)",
  fontSize: "var(--font-size-sm)",
};

const previewLabelStyle: CSSProperties = {
  color: "var(--color-text-muted)",
  fontWeight: 500,
};

const errorStyle: CSSProperties = {
  background: "var(--color-danger-bg)",
  color: "var(--color-danger-text)",
  border: "1px solid var(--color-danger-border)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-3) var(--space-4)",
  marginTop: "var(--space-4)",
  fontSize: "var(--font-size-sm)",
};

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "var(--space-3)",
  padding: "var(--space-4) var(--space-6) var(--space-5)",
  borderTop: "1px solid var(--color-border)",
};
