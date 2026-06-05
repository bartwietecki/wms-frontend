import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import type { WorkEntry } from "../../api/admin/types";
import { deleteWorkEntry } from "../../api/admin/workEntriesApi";
import { formatDate } from "../../utils/time";

interface DeleteWorkEntryModalProps {
  entry: WorkEntry;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteWorkEntryModal({ entry, onClose, onDeleted }: DeleteWorkEntryModalProps) {
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
      await deleteWorkEntry(entry.id);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete entry");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle} role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
        <div style={modalHeaderStyle}>
          <h2 id="delete-modal-title" style={titleStyle}>Delete Work Entry</h2>
          <button style={closeBtnStyle} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div style={bodyStyle}>
          <p style={messageStyle}>
            Are you sure you want to delete this work entry? This action cannot be undone.
          </p>
          <div style={entryPreviewStyle}>
            <span style={previewLabelStyle}>Employee</span>
            <span>{entry.employeeName}</span>
            <span style={previewLabelStyle}>Date</span>
            <span>{formatDate(entry.workDate)}</span>
            <span style={previewLabelStyle}>Duration</span>
            <span>{entry.minutes} min</span>
          </div>

          {error && <div style={errorStyle}>{error}</div>}
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

const modalHeaderStyle: CSSProperties = {
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

const entryPreviewStyle: CSSProperties = {
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
  fontWeight: 500,
};

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "var(--space-3)",
  padding: "var(--space-4) var(--space-6) var(--space-5)",
  borderTop: "1px solid var(--color-border)",
};
