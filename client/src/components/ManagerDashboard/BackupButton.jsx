import React, { useState } from "react";

export default function BackupButton({ jwtToken }) {
  const [status, setStatus] = useState(null);

  async function handleBackup() {
    if (!window.confirm("Create backup now and prune/truncate DB if successful?")) return;
    setStatus("Starting...");
    try {
      const r = await fetch("/api/backup-now", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + jwtToken,
          "Content-Type": "application/json",
        },
      });
      const data = await r.json();
      if (!r.ok) {
        setStatus("Failed: " + JSON.stringify(data));
        return;
      }
      setStatus("✅ Backup done: " + JSON.stringify(data.result || data));
    } catch (err) {
      setStatus("Error: " + String(err));
    }
  }

  return (
    <div>
      <button onClick={handleBackup}>Backup Now</button>
      {status && <div style={{ marginTop: 8 }}>{status}</div>}
    </div>
  );
}
