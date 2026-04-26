import { useState, useMemo } from "react";

const STORES = [
  "MOS 新宿店", "MOS 渋谷店", "MOS 池袋店", "MOS 銀座店", "MOS 秋葉原店",
  "MOS 横浜店", "MOS 川崎店", "MOS 大宮店", "MOS 千葉店", "MOS 吉祥寺店",
  "MOS 立川店", "MOS 町田店", "MOS 船橋店", "MOS 柏店", "MOS 府中店"
];
const STATUS_CONFIG = {
  "依頼中": { color: "#f59e0b", bg: "#fef3c7", icon: "📋" },
  "対応中": { color: "#3b82f6", bg: "#dbeafe", icon: "🔧" },
  "完了": { color: "#10b981", bg: "#d1fae5", icon: "✅" },
  "保留・中断": { color: "#ef4444", bg: "#fee2e2", icon: "⏸" },
};
const PRIORITY_CONFIG = {
  "緊急": { color: "#dc2626", label: "🔴 緊急" },
  "高": { color: "#f97316", label: "🟠 高" },
  "通常": { color: "#6b7280", label: "⚪ 通常" },
};
const SAMPLE_DATA = [
  { id: 1, store: "MOS 新宿店", category: "空調設備", description: "エアコン異音・冷却不良", status: "対応中", priority: "高", requestDate: "2026-04-10", dueDate: "2026-04-28", cost: 85000, assignee: "田中工務店", notes: "部品発注済み" },
  { id: 2, store: "MOS 渋谷店", category: "厨房機器", description: "フライヤー温度センサー交換", status: "完了", priority: "緊急", requestDate: "2026-04-05", dueDate: "2026-04-08", cost: 42000, assignee: "田中工務店", notes: "" },
  { id: 3, store: "MOS 池袋店", category: "内装", description: "床タイル割れ補修（厨房内）", status: "依頼中", priority: "通常", requestDate: "2026-04-20", dueDate: "2026-05-10", cost: null, assignee: "", notes: "見積り待ち" },
];
let nextId = 4;
const inputStyle = { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 14, boxSizing: "border-box" };
const selectStyle = { ...inputStyle, background: "#fff" };
function Field({ label, children, style }) {
  return <div style={style}><div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>{label}</div>{children}</div>;
}
function Select({ label, value, onChange, options }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>{label}</span><select value={value} onChange={e => onChange(e.target.value)} style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", fontSize: 13, background: "#fff" }}>{options.map(o => <option key={o}>{o}</option>)}</select></div>;
}
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status];
  return <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 600 }}>{cfg.icon} {status}</span>;
}
export default function App() {
  const [requests, setRequests] = useState(SAMPLE_DATA);
  const [view, setView] = useState("list");
  const [filterStore, setFilterStore] = useState("全店舗");
  const [filterStatus, setFilterStatus] = useState("全て");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [form, setForm] = useState({ store: STORES[0], category: "", description: "", status: "依頼中", priority: "通常", requestDate: new Date().toISOString().split("T")[0], dueDate: "", cost: "", assignee: "田中工務店", notes: "" });
  const filtered = useMemo(() => requests.filter(r => (filterStore === "全店舗" || r.store === filterStore) && (filterStatus === "全て" || r.status === filterStatus)), [requests, filterStore, filterStatus]);
  const storeStats = useMemo(() => STORES.map(store => { const items = requests.filter(r => r.store === store); const counts = {}; Object.keys(STATUS_CONFIG).forEach(s => counts[s] = items.filter(r => r.status === s).length); const urgent = items.filter(r => r.status !== "完了" && r.priority === "緊急").length; return { store, total: items.length, counts, urgent }; }), [requests]);
  const openNew = () => { setEditItem(null); setForm({ store: STORES[0], category: "", description: "", status: "依頼中", priority: "通常", requestDate: new Date().toISOString().split("T")[0], dueDate: "", cost: "", assignee: "田中工務店", notes: "" }); setShowModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ ...item, cost: item.cost !== null ? String(item.cost) : "" }); setShowModal(true); setSelectedDetail(null); };
  const saveForm = () => { if (!form.description || !form.category) return; const record = { ...form, cost: form.cost !== "" ? Number(form.cost) : null }; if (editItem) { setRequests(prev => prev.map(r => r.id === editItem.id ? { ...record, id: editItem.id } : r)); } else { setRequests(prev => [...prev, { ...record, id: nextId++ }]); } setShowModal(false); };
  const deleteItem = (id) => { if (window.confirm("削除しますか？")) { setRequests(prev => prev.filter(r => r.id !== id)); setSelectedDetail(null); } };
  const totalActive = requests.filter(r => r.status !== "完了").length;
  const totalUrgent = requests.filter(r => r.priority === "緊急" && r.status !== "完了").length;
  const totalCost = requests.filter(r => r.cost).reduce((s, r) => s + r.cost, 0);
  return (
    <div style={{ fontFamily: "'Noto Sans JP', sans-serif", background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(135deg, #c8102e 0%, #8b0000 100%)", color: "#fff", padding: "0 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, paddingBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, background: "#fff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🍔</div>
              <div><div style={{ fontWeight: 800, fontSize: 18 }}>店舗修繕管理システム</div><div style={{ fontSize: 11, opacity: 0.8 }}>MOS BURGER 店舗運営管理</div></div>
            </div>
            <button onClick={openNew} style={{ background: "#fff", color: "#c8102e", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>＋ 新規依頼</button>
          </div>
          <div style={{ display: "flex", gap: 16, paddingBottom: 16, paddingTop: 8, flexWrap: "wrap" }}>
            {[{ label: "対応中の依頼", value: totalActive, sub: "件" }, { label: "緊急対応", value: totalUrgent, sub: "件" }, { label: "今月費用合計", value: totalCost.toLocaleString(), sub: "円" }, { label: "管理店舗数", value: 15, sub: "店舗" }].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 18px" }}><div style={{ fontSize: 11, opacity: 0.85 }}>{s.label}</div><div style={{ fontSize: 22, fontWeight: 800 }}>{s.value}<span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>{s.sub}</span></div></div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[["list", "📋 依頼一覧"], ["store", "🏪 店舗別"]].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{ background: view === v ? "#c8102e" : "#fff", color: view === v ? "#fff" : "#374151", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{label}</button>
          ))}
        </div>
        {view === "list" && (<>
          <div style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", marginBottom: 14, display: "flex", gap: 12, flexWrap: "wrap", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            <Select label="店舗" value={filterStore} onChange={setFilterStore} options={["全店舗", ...STORES]} />
            <Select label="ステータス" value={filterStatus} onChange={setFilterStatus} options={["全て", ...Object.keys(STATUS_CONFIG)]} />
            <div style={{ marginLeft: "auto", color: "#6b7280", fontSize: 13, alignSelf: "center" }}>{filtered.length}件表示</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.length === 0 && <div style={{ background: "#fff", borderRadius: 12, padding: 40, textAlign: "center", color: "#9ca3af" }}>該当する依頼がありません</div>}
            {filtered.map(item => (
              <div key={item.id} onClick={() => setSelectedDetail(selectedDetail?.id === item.id ? null : item)} style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)", cursor: "pointer", borderLeft: `4px solid ${STATUS_CONFIG[item.status].color}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{item.store}</span>
                      <span style={{ background: "#f3f4f6", borderRadius: 4, padding: "1px 8px", fontSize: 12 }}>{item.category}</span>
                      <StatusBadge status={item.status} />
                      <span style={{ fontSize: 12, color: PRIORITY_CONFIG[item.priority].color, fontWeight: 600 }}>{PRIORITY_CONFIG[item.priority].label}</span>
                    </div>
                    <div style={{ fontSize: 14, color: "#374151", marginBottom: 4 }}>{item.description}</div>
                    <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#9ca3af", flexWrap: "wrap" }}>
                      <span>依頼日: {item.requestDate}</span>
                      {item.dueDate && <span>完了予定: {item.dueDate}</span>}
                      {item.assignee && <span>担当: {item.assignee}</span>}
                      {item.cost && <span style={{ color: "#374151", fontWeight: 600 }}>¥{item.cost.toLocaleString()}</span>}
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); openEdit(item); }} style={{ background: "#f3f4f6", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>編集</button>
                </div>
                {selectedDetail?.id === item.id && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f3f4f6" }}>
                    {item.notes && <div style={{ background: "#fef9c3", borderRadius: 6, padding: "8px 12px", fontSize: 13, marginBottom: 8 }}>📝 {item.notes}</div>}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={e => { e.stopPropagation(); openEdit(item); }} style={{ background: "#c8102e", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>✏️ 編集</button>
                      <button onClick={e => { e.stopPropagation(); deleteItem(item.id); }} style={{ background: "#fff", color: "#ef4444", border: "1px solid #fca5a5", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>🗑 削除</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>)}
        {view === "store" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {storeStats.map(({ store, total, counts, urgent }) => (
              <div key={store} style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", position: "relative" }}>
                {urgent > 0 && <div style={{ position: "absolute", top: 12, right: 12, background: "#dc2626", color: "#fff", borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>緊急 {urgent}</div>}
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>{store}</div>
                {total === 0 ? <div style={{ fontSize: 13, color: "#9ca3af" }}>依頼なし</div> : (
                  <><div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>{Object.entries(STATUS_CONFIG).map(([status, cfg]) => counts[status] > 0 && <span key={status} style={{ background: cfg.bg, color: cfg.color, borderRadius: 6, padding: "3px 8px", fontSize: 12, fontWeight: 600 }}>{cfg.icon} {status} {counts[status]}</span>)}</div>
                  <button onClick={() => { setFilterStore(store); setView("list"); }} style={{ background: "#f3f4f6", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>詳細を見る →</button></>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 18 }}>{editItem ? "依頼を編集" : "新規依頼を追加"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="店舗 *"><select value={form.store} onChange={e => setForm(f => ({ ...f, store: e.target.value }))} style={selectStyle}>{STORES.map(s => <option key={s}>{s}</option>)}</select></Field>
              <div style={{ display: "flex", gap: 10 }}>
                <Field label="カテゴリ *" style={{ flex: 1 }}><input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="例: 空調設備" style={inputStyle} /></Field>
                <Field label="優先度" style={{ flex: 1 }}><select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={selectStyle}>{Object.keys(PRIORITY_CONFIG).map(p => <option key={p}>{p}</option>)}</select></Field>
              </div>
              <Field label="依頼内容 *"><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: "vertical" }} /></Field>
              <Field label="ステータス"><select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={selectStyle}>{Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}</select></Field>
              <div style={{ display: "flex", gap: 10 }}>
                <Field label="依頼日" style={{ flex: 1 }}><input type="date" value={form.requestDate} onChange={e => setForm(f => ({ ...f, requestDate: e.target.value }))} style={inputStyle} /></Field>
                <Field label="完了予定日" style={{ flex: 1 }}><input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} style={inputStyle} /></Field>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Field label="費用（円）" style={{ flex: 1 }}><input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} style={inputStyle} /></Field>
                <Field label="担当会社" style={{ flex: 1 }}><input value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))} style={inputStyle} /></Field>
              </div>
              <Field label="備考・メモ"><input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={inputStyle} /></Field>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={saveForm} style={{ background: "#c8102e", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", flex: 1 }}>{editItem ? "更新する" : "追加する"}</button>
              <button onClick={() => setShowModal(false)} style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer" }}>キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
                                                                                                            }
