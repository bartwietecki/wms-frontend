import { useEffect, useState } from "react";
import { createWorkEntry, getMyWorkEntries } from "../api/workEntriesApi";
import type { WorkEntry } from "../api/types";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
}

export default function EmployeePage() {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [from, setFrom] = useState(getMonthStart());
  const [to, setTo] = useState(getToday());

  const [workDate, setWorkDate] = useState(getToday());
  const [minutes, setMinutes] = useState("480");
  const [description, setDescription] = useState("");

  async function loadEntries() {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyWorkEntries(from, to);
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load work logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  async function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      await createWorkEntry({
        workDate,
        minutes: Number(minutes),
        description: description.trim(),
      });

      setWorkDate(getToday());
      setMinutes("480");
      setDescription("");

      await loadEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create work log");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFilterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadEntries();
  }

  return (
    <div>
      <h2>Employee Panel</h2>

      <section style={sectionStyle}>
        <h3>Add Work Log</h3>

        <form onSubmit={handleCreateSubmit} style={formStyle}>
          <label>
            Date
            <br />
            <input
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              required
            />
          </label>

          <label>
            Minutes
            <br />
            <input
              type="number"
              min="1"
              step="1"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              required
            />
          </label>

          <label>
            Description
            <br />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Add Work Log"}
          </button>
        </form>
      </section>

      <section style={sectionStyle}>
        <h3>My Work Logs</h3>

        <form onSubmit={handleFilterSubmit} style={filtersStyle}>
          <label>
            From
            <br />
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
            />
          </label>

          <label>
            To
            <br />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </form>

        {error && <p style={errorStyle}>{error}</p>}

        {loading && <p>Loading work logs...</p>}

        {!loading && entries.length === 0 && <p>No work logs found.</p>}

        {!loading && entries.length > 0 && (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Minutes</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td style={tdStyle}>{entry.workDate}</td>
                  <td style={tdStyle}>{entry.minutes}</td>
                  <td style={tdStyle}>{entry.description?.trim() || "-"}</td>
                  <td style={tdStyle}>{entry.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

const sectionStyle: React.CSSProperties = {
  marginBottom: 32,
};

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  maxWidth: 420,
  padding: 16,
  border: "1px solid #ddd",
  borderRadius: 8,
  background: "#fff",
};

const filtersStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "end",
  flexWrap: "wrap",
  marginBottom: 16,
};

const errorStyle: React.CSSProperties = {
  color: "crimson",
  fontWeight: 600,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: 12,
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: 12,
};