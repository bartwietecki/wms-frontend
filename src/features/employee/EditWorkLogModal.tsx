import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import type { WorkEntry } from "../../api/employee/types";
import { updateMyWorkEntry, resolveWorkEntryError } from "../../api/employee/workEntriesApi";
import { formatHours, formatDate } from "../../utils/time";

interface EditWorkLogModalProps {
  entry: WorkEntry;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditWorkLogModal({ entry, onClose, onSaved }: EditWorkLogModalProps) {
  const [workDate, setWorkDate] = useState(entry.workDate);
  const [minutes, setMinutes] = useState(String(entry.minutes));
  const [description, setDescription] = useState(entry.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateMyWorkEntry(entry.id, {
        workDate,
        minutes: Number(minutes),
        description: description.trim(),
      });
      onSaved();
    } catch (err) {
      setError(resolveWorkEntryError(err));
    } finally {
      setSaving(false);
    }
  }

  const minutesNum = Number(minutes);
  const hoursHint = minutesNum > 0 ? formatHours(minutesNum) : null;

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle} role="dialog" aria-modal="true" aria-labelledby="edit-log-title">
        <div style={headerStyle}>
          <div>
            <h2 id="edit-log-title" style={titleStyle}>Edit Work Log</h2>
            <p style={subtitleStyle}>{formatDate(entry.workDate)}</p>
          </div>
          <button style={closeBtnStyle} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Date</label>
            <input
              className="form-input"
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>
              Minutes
              {hoursHint && <span style={hintStyle}> — {hoursHint}</span>}
            </label>
            <input
              className="form-input"
              type="number"
              min="1"
              step="1"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              required
            />
          </div>

          <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Description <span style={optionalStyle}>(optional)</span></label>
            <textarea
              className="form-input"
              style={{ resize: "vertical", minHeight: 80 }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

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
  position: "fixed", inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 200, padding: "var(--space-6)",
};
const modalStyle: CSSProperties = {
  background: "var(--color-surface)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  width: "100%", maxWidth: 480, overflow: "hidden",
};
const headerStyle: CSSProperties = {
  display: "flex", alignItems: "flex-start", justifyContent: "space-between",
  padding: "var(--space-5) var(--space-6)",
  borderBottom: "1px solid var(--color-border)",
};
const titleStyle: CSSProperties = { fontSize: "var(--font-size-md)", fontWeight: 700, color: "var(--color-text)" };
const subtitleStyle: CSSProperties = { fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", marginTop: "var(--space-1)" };
const closeBtnStyle: CSSProperties = { background: "none", border: "none", fontSize: 16, color: "var(--color-text-muted)", cursor: "pointer", padding: "2px 6px", borderRadius: "var(--radius-sm)", lineHeight: 1 };
const errorStyle: CSSProperties = {
  background: "var(--color-danger-bg)", color: "var(--color-danger-text)",
  border: "1px solid var(--color-danger-border)", borderRadius: "var(--radius-sm)",
  padding: "var(--space-3) var(--space-4)", margin: "var(--space-4) var(--space-6) 0",
  fontSize: "var(--font-size-sm)", fontWeight: 500,
};
const formStyle: CSSProperties = {
  display: "grid", gridTemplateColumns: "1fr 1fr",
  gap: "var(--space-4)", padding: "var(--space-5) var(--space-6) var(--space-6)",
};
const fieldStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: "var(--space-1)" };
const labelStyle: CSSProperties = { fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--color-text-muted)" };
const hintStyle: CSSProperties = { fontWeight: 400, color: "var(--color-primary)" };
const optionalStyle: CSSProperties = { fontWeight: 400, color: "var(--color-text-subtle)" };
const footerStyle: CSSProperties = { display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", paddingTop: "var(--space-2)" };
