"use client";

import { useState } from "react";
import { bulkCreateVipAccounts } from "@/app/actions";

const S = {
  night: "#0B0909",
  slate: "#212922",
  volt: "#E3F643",
  silver: "#FAF7F4",
  clay: "#94958B",
  line: "#2E332E",
  lineStrong: "#3F4640",
  fontMono: '"Space Grotesk", monospace',
  pill: "999px",
};

const cell: React.CSSProperties = {
  padding: "11px 14px",
  borderBottom: `1px solid ${S.line}`,
  fontSize: "13px",
  color: S.silver,
  verticalAlign: "middle",
};
const headCell: React.CSSProperties = {
  ...cell,
  fontSize: "9px",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: S.clay,
  background: S.slate,
};

type ParsedAccount = {
  name: string;
  email: string;
  company: string;
  title: string;
  password: string;
};

type ImportResult = ParsedAccount & { success: boolean; error?: string };

function generatePassword(name: string): string {
  const first = name.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, "") || "vip";
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${first}${num}`;
}

function parseCSV(raw: string): { accounts: ParsedAccount[]; parseError: string } {
  const lines = raw.trim().split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { accounts: [], parseError: "No rows found." };

  const firstLower = lines[0].toLowerCase();
  const hasHeaders = firstLower.includes("name") || firstLower.includes("email") || firstLower.includes("company");
  const dataLines = hasHeaders ? lines.slice(1) : lines;
  if (dataLines.length === 0) return { accounts: [], parseError: "Only a header row was found — no data rows." };

  const accounts: ParsedAccount[] = [];
  for (const line of dataLines) {
    const cols = splitCSVLine(line);
    const [name = "", email = "", company = "", title = "", password = ""] = cols;
    if (!name.trim() || !email.trim()) continue;
    accounts.push({
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      title: title.trim(),
      password: password.trim() || generatePassword(name),
    });
  }
  if (accounts.length === 0) return { accounts: [], parseError: "No valid rows found. Make sure each row has at least Name and Email." };
  return { accounts, parseError: "" };
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === "," && !inQuotes) { result.push(current); current = ""; continue; }
    current += ch;
  }
  result.push(current);
  return result;
}

function downloadCSV(rows: (ParsedAccount | ImportResult)[], filename: string) {
  const header = "Name,Email,Company,Title,Password,Status";
  const lines = rows.map((r) => {
    const status = "success" in r ? (r.success ? "Imported" : `Failed: ${r.error ?? "unknown"}`) : "Pending";
    return `"${r.name}","${r.email}","${r.company}","${r.title}","${r.password}","${status}"`;
  });
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BulkImportTab() {
  const [csvText, setCsvText] = useState("");
  const [parsed, setParsed] = useState<ParsedAccount[] | null>(null);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [parseError, setParseError] = useState("");

  const handleParse = () => {
    const { accounts, parseError: err } = parseCSV(csvText);
    if (err) { setParseError(err); return; }
    setParseError("");
    setParsed(accounts);
    setResults(null);
  };

  const handleImport = async () => {
    if (!parsed || parsed.length === 0) return;
    setLoading(true);
    try {
      const { results: importResults } = await bulkCreateVipAccounts(parsed);
      setResults(importResults);
      setParsed(null);
    } catch {
      setParseError("Import failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = (index: number, value: string) => {
    if (!parsed) return;
    const updated = [...parsed];
    updated[index] = { ...updated[index], password: value };
    setParsed(updated);
  };

  const successCount = results?.filter((r) => r.success).length ?? 0;
  const failCount = results?.filter((r) => !r.success).length ?? 0;

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontFamily: S.fontMono, fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: S.silver, margin: "0 0 8px" }}>
          Bulk Import VIP Accounts
        </h2>
        <p style={{ fontFamily: S.fontMono, fontSize: "12px", color: S.clay, margin: 0 }}>
          Paste a CSV with columns: <span style={{ color: S.silver }}>Name, Email, Company, Title</span> — passwords are auto-generated if omitted.
        </p>
      </div>

      {/* ── STEP 1: Paste CSV ── */}
      {!parsed && !results && (
        <div>
          {/* Format example */}
          <div style={{ background: S.night, border: `1px solid ${S.line}`, borderRadius: "8px", padding: "14px 18px", marginBottom: "16px", fontFamily: S.fontMono, fontSize: "11px", color: S.clay, lineHeight: 1.7 }}>
            <div style={{ color: S.volt, marginBottom: "4px", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Expected format</div>
            <div>Name,Email,Company,Title</div>
            <div>John Smith,john@nike.com,Nike,VP Marketing</div>
            <div>Jane Doe,jane@pepsi.com,PepsiCo,SVP Brand Strategy</div>
          </div>

          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste CSV here…"
            style={{
              width: "100%",
              minHeight: "220px",
              background: S.night,
              border: `1px solid ${S.line}`,
              borderRadius: "8px",
              color: S.silver,
              fontFamily: S.fontMono,
              fontSize: "12px",
              padding: "16px",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              lineHeight: 1.6,
            }}
          />

          {parseError && (
            <p style={{ fontFamily: S.fontMono, fontSize: "11px", color: "#FF6060", marginTop: "8px" }}>{parseError}</p>
          )}

          <div style={{ marginTop: "16px" }}>
            <button
              onClick={handleParse}
              disabled={!csvText.trim()}
              style={{
                background: S.volt, color: S.night, border: "none",
                fontFamily: S.fontMono, fontSize: "11px", fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "12px 28px", borderRadius: S.pill, cursor: csvText.trim() ? "pointer" : "not-allowed",
                opacity: csvText.trim() ? 1 : 0.4,
              }}
            >
              Parse CSV →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Preview & edit ── */}
      {parsed && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span style={{ fontFamily: S.fontMono, fontSize: "13px", fontWeight: 700, color: S.silver }}>
                {parsed.length} account{parsed.length !== 1 ? "s" : ""} ready
              </span>
              <span style={{ fontFamily: S.fontMono, fontSize: "11px", color: S.clay, marginLeft: "12px" }}>
                Edit passwords below before importing
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => { setParsed(null); setParseError(""); }}
                style={{ background: "transparent", border: `1px solid ${S.line}`, color: S.clay, fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "10px 18px", borderRadius: S.pill, cursor: "pointer" }}
              >
                Back
              </button>
              <button
                onClick={() => downloadCSV(parsed, "wave-vip-preview.csv")}
                style={{ background: "transparent", border: `1px solid ${S.volt}`, color: S.volt, fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "10px 18px", borderRadius: S.pill, cursor: "pointer" }}
              >
                Download Preview
              </button>
              <button
                onClick={handleImport}
                disabled={loading}
                style={{ background: S.volt, color: S.night, border: "none", fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "10px 22px", borderRadius: S.pill, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Importing…" : `Import ${parsed.length} Accounts`}
              </button>
            </div>
          </div>

          <div style={{ border: `1px solid ${S.line}`, borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Name", "Email", "Company", "Title", "Password (editable)"].map((h) => (
                    <th key={h} style={headCell}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsed.map((acc, i) => (
                  <tr key={i}>
                    <td style={cell}>{acc.name}</td>
                    <td style={{ ...cell, color: S.clay }}>{acc.email}</td>
                    <td style={cell}>{acc.company}</td>
                    <td style={{ ...cell, color: S.clay }}>{acc.title}</td>
                    <td style={cell}>
                      <input
                        value={acc.password}
                        onChange={(e) => updatePassword(i, e.target.value)}
                        style={{
                          background: S.night, border: `1px solid ${S.lineStrong}`,
                          borderRadius: "6px", color: S.volt, fontFamily: S.fontMono,
                          fontSize: "12px", padding: "5px 10px", width: "140px", outline: "none",
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── STEP 3: Results ── */}
      {results && (
        <div>
          {/* Summary chips */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
            <div style={{ background: "rgba(11,221,101,0.12)", border: "1px solid rgba(11,221,101,0.3)", borderRadius: S.pill, padding: "8px 18px", fontFamily: S.fontMono, fontSize: "12px", fontWeight: 700, color: "#0BDD65" }}>
              ✓ {successCount} imported
            </div>
            {failCount > 0 && (
              <div style={{ background: "rgba(255,96,96,0.12)", border: "1px solid rgba(255,96,96,0.3)", borderRadius: S.pill, padding: "8px 18px", fontFamily: S.fontMono, fontSize: "12px", fontWeight: 700, color: "#FF6060" }}>
                ✕ {failCount} failed
              </div>
            )}
            <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
              <button
                onClick={() => { setResults(null); setParsed(null); setCsvText(""); setParseError(""); }}
                style={{ background: "transparent", border: `1px solid ${S.line}`, color: S.clay, fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "10px 18px", borderRadius: S.pill, cursor: "pointer" }}
              >
                Import More
              </button>
              <button
                onClick={() => downloadCSV(results, "wave-vip-credentials.csv")}
                style={{ background: S.volt, color: S.night, border: "none", fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "10px 22px", borderRadius: S.pill, cursor: "pointer" }}
              >
                Download Credentials CSV
              </button>
            </div>
          </div>

          <div style={{ border: `1px solid ${S.line}`, borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Name", "Email", "Company", "Password", "Status"].map((h) => (
                    <th key={h} style={headCell}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} style={{ background: r.success ? "transparent" : "rgba(255,96,96,0.04)" }}>
                    <td style={cell}>{r.name}</td>
                    <td style={{ ...cell, color: S.clay }}>{r.email}</td>
                    <td style={cell}>{r.company}</td>
                    <td style={{ ...cell, fontFamily: S.fontMono, fontSize: "12px", color: S.volt }}>{r.password}</td>
                    <td style={cell}>
                      {r.success ? (
                        <span style={{ fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, color: "#0BDD65", background: "rgba(11,221,101,0.1)", border: "1px solid rgba(11,221,101,0.25)", borderRadius: S.pill, padding: "3px 10px" }}>Imported</span>
                      ) : (
                        <span style={{ fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, color: "#FF6060", background: "rgba(255,96,96,0.1)", border: "1px solid rgba(255,96,96,0.25)", borderRadius: S.pill, padding: "3px 10px" }}>{r.error ?? "Failed"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
