import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [data, setData] = useState<string>("loading...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ping")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>WMS</h1>
      <p>Backend ping: {error ? `ERROR: ${error}` : data}</p>
    </div>
  );
}
