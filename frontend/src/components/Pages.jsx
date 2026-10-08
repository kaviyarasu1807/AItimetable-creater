import React, { useState, useEffect, useRef } from "react";
import { supabase, mapStaff, mapClass, mapSubject, mapRoom, mapTimetable } from "../api/supabase";
import { C, card, inp, lbl, btn, tag, thStyle, tdStyle, editBtn, dangerBtn, ghostBtn, outlineBtn } from "../styles/theme";
import { Heading, Spinner, Toast } from "./Common";
import { DEFAULT_DAYS, DEFAULT_SLOTS, subjectColor, runCSP, runGA } from "../logic/utils";

export function StaffPage({ staff, setStaff, show }) {
  const [form, setForm] = useState({ name: "", subject: "", dept: "", email: "", maxHrsDay: 4, preferMorning: false, availability: [...DEFAULT_DAYS] });
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);

  const toggleDay = d => setForm(p => ({ ...p, availability: p.availability.includes(d) ? p.availability.filter(x => x !== d) : [...p.availability, d] }));

  const save = async () => {
    if (!form.name || !form.subject) return;
    setSaving(true);
    try {
      const p = { name: form.name, subject: form.subject, dept: form.dept, email: form.email, availability: form.availability, max_hrs_day: form.maxHrsDay, prefer_morning: form.preferMorning };
      if (edit) {
        const { data, error } = await supabase.from("staff").update(p).eq("id", edit).select().single();
        if (error) throw error;
        setStaff(prev => prev.map(t => t.id === edit ? mapStaff(data) : t));
        show("Staff member updated", "success"); setEdit(null);
      } else {
        const { data, error } = await supabase.from("staff").insert(p).select().single();
        if (error) throw error;
        setStaff(prev => [...prev, mapStaff(data)]);
        show("Staff member added", "success");
      }
      setForm({ name: "", subject: "", dept: "", email: "", maxHrsDay: 4, preferMorning: false, availability: [...DEFAULT_DAYS] });
    } catch (e) { show(e.message); }
    setSaving(false);
  };

  const del = async id => {
    if (!confirm("Remove this staff member?")) return;
    const { error } = await supabase.from("staff").delete().eq("id", id);
    if (error) { show(error.message); return; }
    setStaff(prev => prev.filter(x => x.id !== id));
    show("Staff member removed", "success");
  };

  return (
    <div>
      <Heading sub="Manage Faculty">Staff Management</Heading>
      <div style={card({ borderTop: `3px solid ${edit ? C.amber : C.indigo}` })}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: edit ? C.amber : C.indigo, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 16px" }}>
          {edit ? "✎ Edit Staff Member" : "+ Add New Staff Member"}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}><label style={lbl}>Name</label><input style={inp()} placeholder="Dr. Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}><label style={lbl}>Subject</label><input style={inp()} placeholder="Mathematics" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}><label style={lbl}>Dept</label><input style={inp()} placeholder="Science" value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })} /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}><label style={lbl}>Max Hrs/Day</label><input style={inp()} type="number" value={form.maxHrsDay} onChange={e => setForm({ ...form, maxHrsDay: +e.target.value })} /></div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Availability</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DEFAULT_DAYS.map(d => (
              <label key={d} onClick={() => toggleDay(d)} style={{ cursor: "pointer", padding: "6px 12px", borderRadius: 8, fontSize: 12, background: form.availability.includes(d) ? C.indigoLt : C.bg2, border: `1.5px solid ${form.availability.includes(d) ? C.indigoBd : C.border}`, color: form.availability.includes(d) ? C.indigo : C.textMd, fontWeight: form.availability.includes(d) ? 600 : 400 }}>{d.slice(0, 3)}</label>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={btn(edit ? C.amber : C.indigo)} onClick={save} disabled={saving}>{saving ? "Saving..." : edit ? "✎ Update" : "+ Add Staff"}</button>
          {edit && <button style={ghostBtn()} onClick={() => { setEdit(null); setForm({ name: "", subject: "", dept: "", email: "", maxHrsDay: 4, preferMorning: false, availability: [...DEFAULT_DAYS] }); }}>Cancel</button>}
        </div>
      </div>
      <div style={card()}>
        <div className="table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Name", "Subject", "Dept", "Days", "Max", "Actions"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>{staff.map(t => (
              <tr key={t.id}>
                <td style={tdStyle}><b>{t.name}</b></td>
                <td style={tdStyle}><span style={tag(subjectColor(t.subject))}>{t.subject}</span></td>
                <td style={tdStyle}>{t.dept}</td>
                <td style={tdStyle}>{t.availability.length}d</td>
                <td style={tdStyle}>{t.maxHrsDay}h</td>
                <td style={tdStyle}>
                  <button style={editBtn} onClick={() => { setForm({ ...t }); setEdit(t.id); }}>✎</button>
                  <button style={{ ...dangerBtn, marginLeft: 8 }} onClick={() => del(t.id)}>✕</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ClassesPage({ classes, setClasses, show }) {
  const [form, setForm] = useState({ name: "", year: 1, section: "", dept: "", capacity: 60 });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.from("classes").insert(form).select().single();
      if (error) throw error;
      setClasses(prev => [...prev, mapClass(data)]);
      show("Class added", "success");
      setForm({ name: "", year: 1, section: "", dept: "", capacity: 60 });
    } catch (e) { show(e.message); }
    setSaving(false);
  };

  const del = async id => {
    if (!confirm("Remove this class?")) return;
    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (error) { show(error.message); return; }
    setClasses(prev => prev.filter(c => c.id !== id));
    show("Class removed", "success");
  };

  return (
    <div>
      <Heading sub="Manage Sections">Classes Management</Heading>
      <div style={card()}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 16 }}>
          <input style={inp()} placeholder="Class Name (e.g. CS-A)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input style={inp()} type="number" placeholder="Year" value={form.year} onChange={e => setForm({ ...form, year: +e.target.value })} />
          <input style={inp()} placeholder="Dept" value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })} />
          <button style={btn()} onClick={save} disabled={saving}>{saving ? "Saving..." : "Add Class"}</button>
        </div>
      </div>
      <div className="grid-auto">
        {classes.map(c => (
          <div key={c.id} style={card({ marginBottom: 0 })}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: C.indigo }}>{c.name}</span>
              <button style={dangerBtn} onClick={() => del(c.id)}>✕</button>
            </div>
            <p style={{ fontSize: 12, color: C.textSm, margin: 0 }}>Year {c.year} · {c.dept} · {c.capacity} seats</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SubjectsPage({ subjects, setSubjects, staff, classes, show }) {
  const [form, setForm] = useState({ classId: "", teacherId: "", name: "", hoursPerWeek: 3, isLab: false });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.classId || !form.teacherId || !form.name) return;
    setSaving(true);
    try {
      const payload = { class_id: form.classId, teacher_id: form.teacherId, name: form.name, hours_per_week: form.hoursPerWeek, is_lab: form.isLab };
      const { data, error } = await supabase.from("subjects").insert(payload).select().single();
      if (error) throw error;
      setSubjects(prev => [...prev, mapSubject(data)]);
      show("Subject assigned", "success");
      setForm({ classId: "", teacherId: "", name: "", hoursPerWeek: 3, isLab: false });
    } catch (e) { show(e.message); }
    setSaving(false);
  };

  const del = async id => {
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) { show(error.message); return; }
    setSubjects(prev => prev.filter(s => s.id !== id));
    show("Assignment removed", "success");
  };

  return (
    <div>
      <Heading sub="Assign subjects to classes">Subjects Management</Heading>
      <div style={card()}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12, marginBottom: 16 }}>
          <select style={inp()} value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })}>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select style={inp()} value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}>
            <option value="">Select Teacher</option>
            {staff.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input style={inp()} placeholder="Subject Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input style={inp()} type="number" value={form.hoursPerWeek} onChange={e => setForm({ ...form, hoursPerWeek: +e.target.value })} />
          <button style={btn()} onClick={save} disabled={saving}>{saving ? "Saving..." : "Assign Subject"}</button>
        </div>
      </div>
      <div style={card()}>
        <div className="table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={thStyle}>Class</th><th style={thStyle}>Subject</th><th style={thStyle}>Teacher</th><th style={thStyle}>Hrs</th><th style={thStyle}></th></tr></thead>
            <tbody>{subjects.map(s => {
              const cls = classes.find(c => c.id === s.classId);
              const tch = staff.find(t => t.id === s.teacherId);
              return (
                <tr key={s.id}>
                  <td style={tdStyle}><b>{cls?.name}</b></td>
                  <td style={tdStyle}><span style={tag(subjectColor(s.name))}>{s.name}</span></td>
                  <td style={tdStyle}>{tch?.name}</td>
                  <td style={tdStyle}>{s.hoursPerWeek}h</td>
                  <td style={tdStyle}><button style={dangerBtn} onClick={() => del(s.id)}>✕</button></td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function RoomsPage({ rooms, setRooms, show }) {
  const [form, setForm] = useState({ name: "", capacity: 60, isLab: false });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.from("rooms").insert({ name: form.name, capacity: form.capacity, is_lab: form.isLab }).select().single();
      if (error) throw error;
      setRooms(prev => [...prev, mapRoom(data)]);
      show("Room added", "success");
      setForm({ name: "", capacity: 60, isLab: false });
    } catch (e) { show(e.message); }
    setSaving(false);
  };

  const del = async id => {
    const { error } = await supabase.from("rooms").delete().eq("id", id);
    if (error) { show(error.message); return; }
    setRooms(prev => prev.filter(r => r.id !== id));
    show("Room removed", "success");
  };

  return (
    <div>
      <Heading sub="Track rooms and labs">Rooms Management</Heading>
      <div style={card()}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginBottom: 16 }}>
          <input style={inp()} placeholder="Room Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <input type="checkbox" checked={form.isLab} onChange={e => setForm({ ...form, isLab: e.target.checked })} /> Lab
          </label>
          <button style={btn()} onClick={save} disabled={saving}>{saving ? "Saving..." : "Add Room"}</button>
        </div>
      </div>
      <div className="grid-auto">
        {rooms.map(r => (
          <div key={r.id} style={card({ background: r.isLab ? C.amberLt : C.bg1, border: `1.5px solid ${r.isLab ? C.amberBd : C.border}`, marginBottom: 0 })}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: r.isLab ? C.amber : C.text }}>{r.name}</div>
              <button style={dangerBtn} onClick={() => del(r.id)}>✕</button>
            </div>
            <p style={{ fontSize: 12, color: C.textMd, margin: 0 }}>Cap: {r.capacity} · {r.isLab ? "Lab" : "Classroom"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimeSlotsPage({ slots, setSlots, days, setDays, show }) {
  const [newSlot, setNewSlot] = useState({ label: "", start: "09:00", end: "10:00", isLunch: false });
  const [activeTab, setActiveTab] = useState("slots");
  const addSlot = () => {
    if (!newSlot.label) return;
    const id = "sl_" + Math.random().toString(36).slice(2, 7);
    setSlots(p => [...p, { ...newSlot, id, isMorning: parseInt(newSlot.start) < 12 }]);
    setNewSlot({ label: "", start: "09:00", end: "10:00", isLunch: false });
    show("Time slot added", "success");
  };
  const removeSlot = id => { setSlots(p => p.filter(s => s.id !== id)); show("Removed", "success"); };
  const toggleDay = d => setDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);
  const sortedSlots = [...slots].sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div>
      <Heading sub="Manage daily schedule and working days">Time Slots & Days</Heading>
      <div style={{ display: "flex", background: C.bg2, padding: 4, borderRadius: 12, marginBottom: 20, width: "fit-content", border: `1.5px solid ${C.border}` }}>
        <button onClick={() => setActiveTab("slots")} style={{ padding: "8px 16px", borderRadius: 9, background: activeTab === "slots" ? C.bg1 : "transparent", border: "none", fontWeight: 600, color: activeTab === "slots" ? C.indigo : C.textSm, fontSize: 13, cursor: "pointer" }}>Time Slots</button>
        <button onClick={() => setActiveTab("days")} style={{ padding: "8px 16px", borderRadius: 9, background: activeTab === "days" ? C.bg1 : "transparent", border: "none", fontWeight: 600, color: activeTab === "days" ? C.indigo : C.textSm, fontSize: 13, cursor: "pointer" }}>Working Days</button>
      </div>
      {activeTab === "slots" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
          <div style={card()}>
            <h3 style={{ margin: "0 0 16px" }}>+ Add New Time Slot</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={lbl}>Label</label><input style={inp()} placeholder="1st Hour" value={newSlot.label} onChange={e => setNewSlot({ ...newSlot, label: e.target.value })} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={lbl}>Start</label><input style={inp()} type="time" value={newSlot.start} onChange={e => setNewSlot({ ...newSlot, start: e.target.value })} /></div>
                <div><label style={lbl}>End</label><input style={inp()} type="time" value={newSlot.end} onChange={e => setNewSlot({ ...newSlot, end: e.target.value })} /></div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={newSlot.isLunch} onChange={e => setNewSlot({ ...newSlot, isLunch: e.target.checked })} /> Break / Lunch slot?
              </label>
              <button style={btn()} onClick={addSlot}>Add Time Slot</button>
            </div>
          </div>
          <div style={card()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Defined Slots</h3>
              <button style={{ ...ghostBtn(), fontSize: 12, color: C.indigo }} onClick={() => { setSlots([...DEFAULT_SLOTS]); show("Standard hours loaded", "success"); }}>Load Standard</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sortedSlots.map(s => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: s.isLunch ? C.lunchBg : C.bg2, border: `1.5px solid ${s.isLunch ? C.amberBd : C.border}`, borderRadius: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: s.isLunch ? C.lunch : C.text }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: C.textSm }}>{s.start} — {s.end}</div>
                  </div>
                  <button style={dangerBtn} onClick={() => removeSlot(s.id)}>✕</button>
                </div>
              ))}
              {slots.length === 0 && <div style={{ color: C.textSm, textAlign: "center", padding: 20 }}>No slots defined.</div>}
            </div>
          </div>
        </div>
      )}
      {activeTab === "days" && (
        <div style={card()}>
          <h3 style={{ margin: "0 0 16px" }}>Working Days</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => (
              <label key={d} onClick={() => toggleDay(d)} style={{ cursor: "pointer", padding: "12px 20px", borderRadius: 10, fontSize: 14, background: days.includes(d) ? C.indigoLt : C.bg2, border: `2px solid ${days.includes(d) ? C.indigoBd : C.border}`, color: days.includes(d) ? C.indigo : C.textSm, fontWeight: days.includes(d) ? 700 : 400 }}>{d}</label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ConfigPage() {
  return (
    <div>
      <Heading sub="System settings">Configuration</Heading>
      <div style={card()}>Advanced university settings coming soon.</div>
    </div>
  );
}

export function GeneratePage({ staff, classes, subjects, rooms, days, slots, setResult, setHistory, setPage, show }) {
  const [algo, setAlgo] = useState("csp");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const logRef = useRef(null);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

  const run = async () => {
    if (!staff.length || !classes.length || !subjects.length) { show("Please add Staff, Classes, and Subjects before generating.", "error"); return; }
    setRunning(true); setProgress(10); setLogs(["[INIT] Starting AI Engine..."]);
    try {
      setProgress(30); setLogs(p => [...p, "[AI] Running generation..."]);
      const logCb = m => setLogs(p => [...p, m]);
      const data = algo === "ga" ? runGA(staff, classes, subjects, days, slots, {}, logCb) : runCSP(staff, classes, subjects, days, slots, rooms, logCb);
      setProgress(80);
      if (data.error) throw new Error(data.error);
      setLogs(p => [...p, "[AI] Generation completed", `[AI] Conflicts: ${data.conflicts}`]);
      const { data: dbData, error } = await supabase.from("timetables").insert({ timetable_data: data.timetable, teacher_view: data.teacherView, utilization: data.utilization, violations: data.violations, conflicts: data.conflicts, algorithm: algo }).select().single();
      if (error) throw error;
      setLogs(p => [...p, "[DB] Result stored"]); setProgress(100);
      const mapped = mapTimetable(dbData);
      setResult(mapped); setHistory(prev => [mapped, ...prev]);
      setTimeout(() => setPage("timetable"), 500);
    } catch (e) { setLogs(p => [...p, `[ERROR] ${e.message}`]); show(e.message); }
    setRunning(false);
  };

  return (
    <div>
      <Heading sub="AI Scheduler">Generate Timetable</Heading>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20, marginBottom: 20 }}>
        <div style={card()}>
          <h3 style={{ margin: "0 0 16px" }}>Generation Engine</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ cursor: "pointer", padding: 12, borderRadius: 10, background: algo === "csp" ? C.indigoLt : C.bg2, border: `1.5px solid ${algo === "csp" ? C.indigoBd : C.border}` }}>
              <input type="radio" checked={algo === "csp"} onChange={() => setAlgo("csp")} style={{ marginRight: 10 }} /><b>CSP (Deterministic)</b> — High speed.
            </label>
            <label style={{ cursor: "pointer", padding: 12, borderRadius: 10, background: algo === "ga" ? C.indigoLt : C.bg2, border: `1.5px solid ${algo === "ga" ? C.indigoBd : C.border}` }}>
              <input type="radio" checked={algo === "ga"} onChange={() => setAlgo("ga")} style={{ marginRight: 10 }} /><b>Genetic Algorithm</b> — Better for complex datasets.
            </label>
            <button style={{ ...btn(), marginTop: 10, padding: 14, fontSize: 15 }} onClick={run} disabled={running}>{running ? "Processing..." : "Run Generator"}</button>
            {running && <div style={{ height: 6, background: C.bg2, borderRadius: 4 }}><div style={{ height: "100%", background: C.indigo, width: `${progress}%`, borderRadius: 4, transition: "width .3s" }} /></div>}
          </div>
        </div>
        <div style={card({ background: C.text, color: "#fff" })}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.6 }}>CONSOLE</span>
            {running && <span style={{ fontSize: 10, color: C.green }}>ACTIVE</span>}
          </div>
          <div ref={logRef} style={{ height: 200, overflowY: "auto", fontFamily: "monospace", fontSize: 12, lineHeight: 1.6 }}>
            {logs.map((l, i) => <div key={i}>{l}</div>)}
            {!logs.length && <div style={{ color: "#555" }}>Ready...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TimetablePage({ result, setResult, staff, classes, days, slots, subjects, show }) {
  const [view, setView] = useState("class");
  const [selClass, setSelClass] = useState(classes[0]?.id || "");
  const [selTeacher, setSelTeacher] = useState(staff[0]?.id || "");
  const [dragging, setDragging] = useState(null);
  const [over, setOver] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [overrideMode, setOverrideMode] = useState(false);
  const [editCell, setEditCell] = useState(null);
  const [editForm, setEditForm] = useState({ subjectId: "", teacherId: "", custom: "" });

  if (!result) return <div style={card()}>No result yet. Go to Generate.</div>;

  const { timetable, teacherView, violations = [] } = result;
  const classSubjects = (subjects || []).filter(s => s.classId === selClass);

  const onDragStart = (day, sid) => { if (!overrideMode) setDragging({ day, slotId: sid }); };
  const onDragOver = (e, day, sid) => { if (!overrideMode) { e.preventDefault(); setOver({ day, slotId: sid }); } };
  const onDrop = (day, sid) => {
    if (overrideMode || !dragging || view !== "class" || !selClass) { setDragging(null); setOver(null); return; }
    const from = dragging;
    if (from.day === day && from.slotId === sid) { setDragging(null); setOver(null); return; }
    setResult(prev => {
      const tt = JSON.parse(JSON.stringify(prev.timetable));
      const A = tt[selClass]?.[from.day]?.[from.slotId];
      const B = tt[selClass]?.[day]?.[sid];
      if (A?.isLunch || B?.isLunch) return prev;
      tt[selClass][from.day][from.slotId] = B;
      tt[selClass][day][sid] = A;
      return { ...prev, timetable: tt, conflicts: 0 };
    });
    setDragging(null); setOver(null);
  };

  const openEdit = (day, slotId) => {
    if (!overrideMode || view !== "class") return;
    const cell = timetable[selClass]?.[day]?.[slotId];
    if (cell?.isLunch) return;
    setEditCell({ day, slotId });
    setEditForm({ subjectId: "", teacherId: cell?.teacherId || "", custom: cell?.subject || "" });
  };

  const applyOverride = () => {
    if (!editCell) return;
    const { day, slotId } = editCell;
    const sub = classSubjects.find(s => s.id === editForm.subjectId);
    const teacher = staff.find(t => t.id === (sub?.teacherId || editForm.teacherId));
    const subjectName = sub?.name || editForm.custom;
    if (!subjectName) { clearCell(); return; }
    let conflict = false;
    if (teacher) {
      Object.entries(timetable).forEach(([cid, days_]) => {
        if (cid === selClass) return;
        const existing = days_[day]?.[slotId];
        if (existing && !existing.isLunch && existing.teacherId === teacher.id) conflict = true;
      });
    }
    if (conflict) { show(`${teacher.name} is already assigned in another class at this slot`, "error"); return; }
    setResult(prev => {
      const tt = JSON.parse(JSON.stringify(prev.timetable));
      tt[selClass][day][slotId] = { subject: subjectName, teacherId: teacher?.id || null, teacherName: teacher?.name || "—", isLab: sub?.isLab || false, roomName: null, isLunch: false };
      return { ...prev, timetable: tt };
    });
    show("Cell updated", "success");
    setEditCell(null);
  };

  const clearCell = () => {
    if (!editCell) return;
    const { day, slotId } = editCell;
    setResult(prev => { const tt = JSON.parse(JSON.stringify(prev.timetable)); tt[selClass][day][slotId] = null; return { ...prev, timetable: tt }; });
    show("Cell cleared", "success");
    setEditCell(null);
  };

  const saveSwap = async () => {
    if (!result.id) return;
    const { error } = await supabase.from("timetables").update({ timetable_data: result.timetable }).eq("id", result.id);
    if (error) show(error.message); else show("Changes saved", "success");
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const loadScript = src => new Promise((res, rej) => { if (document.querySelector(`script[src="${src}"]`)) { res(); return; } const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      doc.text("TimetableAI - Schedule", 14, 15);
      const rows = slots.map(slot => { const row = [slot.label]; days.forEach(day => { const entry = view === "class" ? timetable[selClass]?.[day]?.[slot.id] : teacherView[selTeacher]?.[day]?.[slot.id]; row.push(entry ? (entry.isLunch ? "LUNCH" : entry.subject) : ""); }); return row; });
      doc.autoTable({ head: [["Time", ...days]], body: rows, startY: 20 });
      doc.save("timetable.pdf");
    } catch (e) { show("PDF Failed: " + e.message); }
    setExporting(false);
  };

  const currentGrid = view === "class" ? (timetable[selClass] || {}) : (teacherView[selTeacher] || {});

  return (
    <div>
      {editCell && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: C.bg1, borderRadius: 16, padding: 28, width: "100%", maxWidth: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700 }}>Edit Slot — {editCell.day} / {slots.find(s => s.id === editCell.slotId)?.label}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={lbl}>Subject (from class)</label>
                <select style={inp()} value={editForm.subjectId} onChange={e => { const sub = classSubjects.find(s => s.id === e.target.value); setEditForm({ subjectId: e.target.value, teacherId: sub?.teacherId || "", custom: "" }); }}>
                  <option value="">— pick subject —</option>
                  {classSubjects.map(s => { const t = staff.find(x => x.id === s.teacherId); return <option key={s.id} value={s.id}>{s.name} ({t?.name || "No teacher"})</option>; })}
                </select>
              </div>
              <div style={{ textAlign: "center", fontSize: 11, color: C.textSm }}>— or custom —</div>
              <div>
                <label style={lbl}>Custom Subject</label>
                <input style={inp()} placeholder="e.g. Guest Lecture" value={editForm.custom} onChange={e => setEditForm({ ...editForm, custom: e.target.value, subjectId: "" })} />
              </div>
              {editForm.custom && (
                <div>
                  <label style={lbl}>Assign Teacher</label>
                  <select style={inp()} value={editForm.teacherId} onChange={e => setEditForm({ ...editForm, teacherId: e.target.value })}>
                    <option value="">— none —</option>
                    {staff.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                <button style={btn(C.indigo)} onClick={applyOverride}>Apply</button>
                <button style={btn(C.red)} onClick={clearCell}>Clear Cell</button>
                <button style={ghostBtn()} onClick={() => setEditCell(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <Heading sub={overrideMode ? "Click any cell to assign manually" : "Drag cells to swap slots"}>Weekly Schedule</Heading>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={() => { setOverrideMode(o => !o); setEditCell(null); }} style={{ padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", background: overrideMode ? C.amber : C.amberLt, border: `1.5px solid ${C.amberBd}`, color: overrideMode ? "#fff" : C.amber, fontFamily: "'DM Sans',sans-serif" }}>
            {overrideMode ? "✎ Override ON" : "✎ Override OFF"}
          </button>
          <button style={ghostBtn()} onClick={saveSwap}>Save Changes</button>
          <button style={outlineBtn(C.indigo)} onClick={exportPDF} disabled={exporting}>{exporting ? "Exporting..." : "Export PDF"}</button>
        </div>
      </div>

      {overrideMode && (
        <div style={{ background: C.amberLt, border: `1.5px solid ${C.amberBd}`, borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: C.amber, fontWeight: 600 }}>
          Override mode ON — click any cell in Class view to assign or clear a subject.
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", background: C.bg2, padding: 3, borderRadius: 10, border: `1.5px solid ${C.border}` }}>
          <button onClick={() => setView("class")} style={{ padding: "6px 14px", borderRadius: 7, background: view === "class" ? C.bg1 : "transparent", border: "none", color: view === "class" ? C.indigo : C.textMd, fontWeight: 600, cursor: "pointer" }}>Class</button>
          <button onClick={() => setView("teacher")} style={{ padding: "6px 14px", borderRadius: 7, background: view === "teacher" ? C.bg1 : "transparent", border: "none", color: view === "teacher" ? C.indigo : C.textMd, fontWeight: 600, cursor: "pointer" }}>Teacher</button>
        </div>
        {view === "class"
          ? <select style={inp({ width: 180 })} value={selClass} onChange={e => setSelClass(e.target.value)}>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          : <select style={inp({ width: 180 })} value={selTeacher} onChange={e => setSelTeacher(e.target.value)}>{staff.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
        }
      </div>

      <div className="table-scroll">
        <table style={{ borderCollapse: "separate", borderSpacing: "4px", width: "100%", minWidth: 600 }}>
          <thead>
            <tr>
              <th style={thStyle}>Time</th>
              {days.map(d => <th key={d} style={{ ...thStyle, textAlign: "center" }}>{d.slice(0, 3).toUpperCase()}</th>)}
            </tr>
          </thead>
          <tbody>
            {slots.map(slot => (
              <tr key={slot.id}>
                <td style={{ ...tdStyle, fontWeight: 700, fontSize: 11, color: C.textSm, whiteSpace: "nowrap" }}>{slot.label}</td>
                {days.map(day => {
                  const cell = currentGrid[day]?.[slot.id];
                  const isOver = over?.day === day && over?.slotId === slot.id;
                  const isDragging = dragging?.day === day && dragging?.slotId === slot.id;
                  const isEditTarget = editCell?.day === day && editCell?.slotId === slot.id;
                  if (cell?.isLunch) return <td key={day} style={{ ...tdStyle, background: C.lunchBg, textAlign: "center", fontWeight: 700, fontSize: 11, color: C.lunch, borderRadius: 8 }}>LUNCH</td>;
                  return (
                    <td key={day}
                      draggable={!overrideMode && view === "class"}
                      onDragStart={() => onDragStart(day, slot.id)}
                      onDragOver={e => onDragOver(e, day, slot.id)}
                      onDrop={() => onDrop(day, slot.id)}
                      onClick={() => openEdit(day, slot.id)}
                      style={{ ...tdStyle, borderRadius: 8, cursor: overrideMode && view === "class" ? "pointer" : view === "class" ? "grab" : "default", background: isEditTarget ? C.amberLt : isOver ? C.indigoLt : isDragging ? C.bg3 : cell ? C.bg1 : C.bg2, border: isEditTarget ? `2px solid ${C.amber}` : isOver ? `1.5px solid ${C.indigoBd}` : `1px solid ${C.border}`, minWidth: 90, transition: "background .15s" }}>
                      {cell ? (
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12, color: C.indigo }}>{cell.subject}</div>
                          <div style={{ fontSize: 10, color: C.textSm, marginTop: 2 }}>{cell.teacherName || cell.className}</div>
                          {cell.roomName && <div style={{ fontSize: 10, color: C.textSm }}>{cell.roomName}</div>}
                          {cell.isLab && <span style={{ fontSize: 9, background: C.amberLt, color: C.amber, padding: "1px 5px", borderRadius: 4, marginTop: 2, display: "inline-block" }}>LAB</span>}
                          {overrideMode && view === "class" && <div style={{ fontSize: 9, color: C.amber, marginTop: 3 }}>click to edit</div>}
                        </div>
                      ) : (
                        overrideMode && view === "class"
                          ? <span style={{ color: C.amber, fontSize: 11, fontWeight: 600 }}>+ assign</span>
                          : <span style={{ color: C.textSm, fontSize: 11 }}>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {violations.length > 0 && (
        <div style={card({ marginTop: 20, borderTop: `3px solid ${C.amber}` })}>
          <h3 style={{ margin: "0 0 12px", color: C.amber }}>Violations ({violations.length})</h3>
          {violations.map((v, i) => <div key={i} style={{ fontSize: 12, color: C.textMd, padding: "4px 0", borderBottom: `1px solid ${C.bg2}` }}>{v}</div>)}
        </div>
      )}
    </div>
  );
}
