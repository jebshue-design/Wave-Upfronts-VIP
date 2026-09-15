"use client";

import { useActionState, useEffect, useState } from "react";
import { createVipAccount, updateVipAccount, deleteVipAccount } from "@/app/actions";

const S = {
  night:   "#0B0909",
  slate:   "#212922",
  volt:    "#E3F643",
  silver:  "#FAF7F4",
  clay:    "#94958B",
  line:    "#2E332E",
  fontMono: '"Space Grotesk", monospace',
};

const AES = ["Tom Defina","Gabby Davino","Larry Menkes","Ethan Abrams","Liane Sousa","Megan Rall","Austie Montgomery","Dean Markus","Meg Jones"];

const selectStyle: React.CSSProperties = {
  background: "#0B0909",
  border: "1px solid #2E332E",
  borderRadius: "6px",
  color: "#FAF7F4",
  fontFamily: '"Space Grotesk", monospace',
  fontSize: "13px",
  padding: "10px 14px",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

type Account = { id?: string; name: string; email: string; company: string; title: string; created_at: string; point_of_contact?: string; phone?: string; account?: string };

const inputStyle: React.CSSProperties = {
  background: S.night,
  border: `1px solid ${S.line}`,
  borderRadius: "6px",
  color: S.silver,
  fontFamily: S.fontMono,
  fontSize: "13px",
  padding: "10px 14px",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: S.clay,
  marginBottom: "6px",
};

export default function VipAccountManager({ initialAccounts }: { initialAccounts: Account[] }) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [state, action, isPending] = useActionState(createVipAccount, { error: "", success: false });
  const [formKey, setFormKey] = useState(0);
  const [justCreated, setJustCreated] = useState<Account | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", company: "", title: "", point_of_contact: "", phone: "", account: "" });
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const startEdit = (acc: Account) => {
    setEditingId(acc.id ?? acc.email);
    setEditForm({ name: acc.name, email: acc.email, company: acc.company, title: acc.title, point_of_contact: acc.point_of_contact ?? "", phone: acc.phone ?? "", account: acc.account ?? "" });
    setEditError("");
    setConfirmDeleteId(null);
  };

  const handleSave = async () => {
    if (!editingId) return;
    setEditSaving(true);
    const result = await updateVipAccount(editingId, {
      name: editForm.name,
      email: editForm.email,
      company: editForm.company,
      title: editForm.title,
      point_of_contact: editForm.point_of_contact || undefined,
      phone: editForm.phone || undefined,
      account: editForm.account || undefined,
    });
    setEditSaving(false);
    if (result.success) {
      setAccounts((prev) => prev.map((a) => (a.id === editingId || a.email === editingId) ? { ...a, ...editForm } : a));
      setEditingId(null);
    } else {
      setEditError(result.error);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    const result = await deleteVipAccount(confirmDeleteId);
    setDeleting(false);
    if (result.success) {
      setAccounts((prev) => prev.filter((a) => a.id !== confirmDeleteId && a.email !== confirmDeleteId));
      setEditingId(null);
      setConfirmDeleteId(null);
    } else {
      setEditError(result.error);
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    if (state.success && state.account) {
      setAccounts((prev) => [state.account!, ...prev]);
      setJustCreated(state.account!);
      setFormKey((k) => k + 1);
    }
  }, [state.success, state.account]);

  return (
    <div>
      {/* Create form */}
      <div style={{ background: S.slate, border: `1px solid ${S.line}`, borderRadius: "12px", padding: "28px", marginBottom: "32px" }}>
        <h2 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay, marginBottom: "20px" }}>
          Create VIP Account
        </h2>

        {justCreated && (
          <div style={{ background: "#0c1a0c", border: `1px solid ${S.volt}`, borderRadius: "8px", padding: "16px 20px", marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: S.volt, marginBottom: "6px" }}>Account Created</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: S.silver }}>{justCreated.name} · {justCreated.company}</div>
            <div style={{ fontSize: "13px", color: S.clay, marginTop: "4px" }}>{justCreated.email}</div>
          </div>
        )}

        <form key={formKey} action={action}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input name="name" type="text" placeholder="Jane Smith" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input name="email" type="email" placeholder="jane@company.com" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Brand / Agency</label>
              <input name="company" type="text" placeholder="Omnicom" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Account</label>
              <input name="account" type="text" placeholder="Nike" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Title</label>
              <input name="title" type="text" placeholder="VP of Sales" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Cell Phone</label>
              <input name="phone" type="tel" placeholder="+1 555 000 0000" style={inputStyle} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Seller (AE)</label>
              <select name="point_of_contact" style={selectStyle}>
                <option value="">— Unassigned —</option>
                {AES.map((ae) => <option key={ae} value={ae}>{ae}</option>)}
              </select>
            </div>
          </div>

          {state.error && (
            <div style={{ color: "#ff6b6b", fontSize: "12px", marginBottom: "12px" }}>{state.error}</div>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{ background: S.volt, color: S.night, border: "none", borderRadius: "6px", fontFamily: S.fontMono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 28px", cursor: isPending ? "wait" : "pointer", opacity: isPending ? 0.7 : 1 }}
          >
            {isPending ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>

      {/* Accounts list */}
      <div>
        <h2 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay, marginBottom: "16px" }}>
          All VIP Accounts ({accounts.length})
        </h2>
        <div style={{ border: `1px solid ${S.line}`, borderRadius: "8px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: S.slate }}>
                {["Name", "Title", "Brand / Agency", "Account", "Phone", "Seller", "Created", ""].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay, borderBottom: `1px solid ${S.line}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: "32px 16px", color: S.clay, textAlign: "center" }}>No accounts yet — create one above</td></tr>
              ) : accounts.map((acc) => {
                const rowId = acc.id ?? acc.email;
                const isEditing = editingId === rowId;
                const p = { padding: "10px 12px", borderBottom: `1px solid ${S.line}` } as React.CSSProperties;
                const smallInput: React.CSSProperties = { background: S.night, border: `1px solid ${S.line}`, borderRadius: "4px", color: S.silver, fontFamily: S.fontMono, fontSize: "12px", padding: "6px 10px", width: "100%", outline: "none", boxSizing: "border-box" };
                const smallSelect: React.CSSProperties = { ...smallInput, cursor: "pointer" };

                if (isEditing) {
                  return (
                    <tr key={rowId} style={{ background: "#141c14" }}>
                      <td style={p}><input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} style={smallInput} /><input value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} style={{ ...smallInput, marginTop: "4px" }} /></td>
                      <td style={p}><input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} style={smallInput} /></td>
                      <td style={p}><input value={editForm.company} onChange={(e) => setEditForm((f) => ({ ...f, company: e.target.value }))} style={smallInput} /></td>
                      <td style={p}><input value={editForm.account} onChange={(e) => setEditForm((f) => ({ ...f, account: e.target.value }))} style={smallInput} /></td>
                      <td style={p}><input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} style={smallInput} /></td>
                      <td style={p}><select value={editForm.point_of_contact} onChange={(e) => setEditForm((f) => ({ ...f, point_of_contact: e.target.value }))} style={smallSelect}><option value="">— Unassigned —</option>{AES.map((ae) => <option key={ae} value={ae}>{ae}</option>)}</select></td>
                      <td style={p} />
                      <td style={{ ...p, whiteSpace: "nowrap" }}>
                        {editError && <div style={{ color: "#ff6b6b", fontSize: "11px", marginBottom: "6px" }}>{editError}</div>}

                        {confirmDeleteId === rowId ? (
                          <div>
                            <div style={{ fontSize: "11px", color: "#ff6b6b", marginBottom: "8px", fontWeight: 600 }}>Are you sure?</div>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button onClick={handleDelete} disabled={deleting} style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: "4px", fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "6px 12px", cursor: deleting ? "wait" : "pointer" }}>
                                {deleting ? "Deleting…" : "Yes, Delete"}
                              </button>
                              <button onClick={() => setConfirmDeleteId(null)} style={{ background: "transparent", color: S.clay, border: `1px solid ${S.line}`, borderRadius: "4px", fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "6px 12px", cursor: "pointer" }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={handleSave} disabled={editSaving} style={{ background: S.volt, color: S.night, border: "none", borderRadius: "4px", fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "6px 12px", cursor: editSaving ? "wait" : "pointer" }}>
                              {editSaving ? "Saving…" : "Save"}
                            </button>
                            <button onClick={() => setConfirmDeleteId(rowId)} style={{ background: "transparent", color: "#c0392b", border: "1px solid #c0392b", borderRadius: "4px", fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "6px 12px", cursor: "pointer" }}>
                              Delete
                            </button>
                            <button onClick={() => setEditingId(null)} style={{ background: "transparent", color: S.clay, border: `1px solid ${S.line}`, borderRadius: "4px", fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "6px 12px", cursor: "pointer" }}>
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={rowId} style={{ borderBottom: `1px solid ${S.line}` }}>
                    <td style={{ ...p, fontWeight: 700, color: S.silver }}>{acc.name}<div style={{ fontSize: "11px", color: S.clay, fontWeight: 400 }}>{acc.email}</div></td>
                    <td style={{ ...p, color: S.clay }}>{acc.title}</td>
                    <td style={{ ...p, color: S.clay }}>{acc.company}</td>
                    <td style={{ ...p, color: S.clay }}>{acc.account ?? "—"}</td>
                    <td style={{ ...p, color: S.clay }}>{acc.phone ?? "—"}</td>
                    <td style={{ ...p, color: acc.point_of_contact ? S.volt : S.clay, fontSize: "12px" }}>{acc.point_of_contact ?? "—"}</td>
                    <td style={{ ...p, color: S.clay, fontSize: "12px" }}>{new Date(acc.created_at).toLocaleDateString()}</td>
                    <td style={p}>
                      <button onClick={() => startEdit(acc)} style={{ background: "transparent", color: S.clay, border: `1px solid ${S.line}`, borderRadius: "4px", fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "5px 12px", cursor: "pointer" }}>
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
