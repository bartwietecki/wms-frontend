import type { CSSProperties } from "react";
import { formatHours } from "../../utils/time";
import Card from "../../components/ui/Card";

interface WorkLogFormProps {
  workDate: string;
  minutes: string;
  description: string;
  submitting: boolean;
  onWorkDateChange: (v: string) => void;
  onMinutesChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function WorkLogForm({
  workDate,
  minutes,
  description,
  submitting,
  onWorkDateChange,
  onMinutesChange,
  onDescriptionChange,
  onSubmit,
}: WorkLogFormProps) {
  const minutesNum = Number(minutes);
  const hoursHint = minutesNum > 0 ? formatHours(minutesNum) : null;

  return (
    <Card style={{ maxWidth: 500, marginBottom: "var(--space-8)" }}>
      <h2 style={cardTitleStyle}>Log Work Hours</h2>
      <form onSubmit={onSubmit} style={formGridStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Date</label>
          <input
            className="form-input"
            type="date"
            value={workDate}
            onChange={(e) => onWorkDateChange(e.target.value)}
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
            onChange={(e) => onMinutesChange(e.target.value)}
            required
          />
          <span style={fieldHelpStyle}>e.g. 480 = 8 hours, 60 = 1 hour</span>
        </div>

        <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
          <label style={labelStyle}>
            Description <span style={optionalStyle}>(optional)</span>
          </label>
          <textarea
            className="form-input"
            style={{ resize: "vertical", minHeight: 80 }}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={3}
            placeholder="What did you work on?"
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Submit Work Log"}
          </button>
        </div>
      </form>
    </Card>
  );
}

const cardTitleStyle: CSSProperties = {
  fontSize: "var(--font-size-md)",
  fontWeight: 600,
  color: "var(--color-text)",
  marginBottom: "var(--space-5)",
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "var(--space-4)",
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
  color: "var(--color-primary)",
};

const optionalStyle: CSSProperties = {
  fontWeight: 400,
  color: "var(--color-text-subtle)",
};

const fieldHelpStyle: CSSProperties = {
  fontSize: "var(--font-size-xs)",
  color: "var(--color-text-subtle)",
};
