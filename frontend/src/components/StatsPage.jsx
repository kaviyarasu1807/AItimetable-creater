import React, { useMemo } from "react";
import { C, card } from "../styles/theme";
import { Heading } from "./Common";
import { subjectColor } from "../logic/utils";

function Bar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: C.text, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>{label}</span>
        <span style={{ color: C.textSm, fontWeight: 500 }}>{value}h</span>
      </div>
      <div style={{ height: 8, background: C.bg2, borderRadius: 6, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 6, transition: "width .6s cubic-bezier(.34,1.56,.64,1)" }} />
      </div>
    </div>
  );
}

function PieSlice({ cx, cy, r, startAngle, endAngle, color }) {
  const toRad = deg => (deg - 90) * Math.PI / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill={color} stroke="#fff" strokeWidth={2} />;
}

export function StatsPage({ staff, classes, subjects, rooms, result }) {
  const stats = useMemo(() => {
    // Teacher weekly hours
    const teacherHours = staff.map(t => ({
      name: t.name,
      hours: subjects.filter(s => s.teacherId === t.id).reduce((a, s) => a + s.hoursPerWeek, 0),
      max: t.maxHrsDay * 5,
    }));

    // Subject distribution
    const subjectMap = {};
    subjects.forEach(s => { subjectMap[s.name] = (subjectMap[s.name] || 0) + s.hoursPerWeek; });
    const subjectDist = Object.entries(subjectMap).map(([name, hrs]) => ({ name, hrs })).sort((a, b) => b.hrs - a.hrs);

    // Room utilization (from result if available)
    const roomUtil = rooms.map(r => {
      let used = 0;
      if (result?.timetable) {
        Object.values(result.timetable).forEach(days => {
          Object.values(days).forEach(slots => {
            Object.values(slots).forEach(cell => {
              if (cell && !cell.isLunch && cell.roomName === r.name) used++;
            });
          });
        });
      }
      const total = 5 * 7; // 5 days * 7 usable slots
      return { name: r.name, used, pct: Math.round((used / total) * 100), isLab: r.isLab };
    });

    // Dept breakdown
    const deptMap = {};
    staff.forEach(t => { deptMap[t.dept] = (deptMap[t.dept] || 0) + 1; });

    return { teacherHours, subjectDist, roomUtil, deptMap };
  }, [staff, classes, subjects, rooms, result]);

  const maxHours = Math.max(...stats.teacherHours.map(t => t.max), 1);

  // Pie chart for subject distribution
  const totalSubHrs = stats.subjectDist.reduce((a, s) => a + s.hrs, 0);
  let cumAngle = 0;
  const pieSlices = stats.subjectDist.slice(0, 8).map((s, i) => {
    const angle = (s.hrs / totalSubHrs) * 360;
    const slice = { ...s, startAngle: cumAngle, endAngle: cumAngle + angle, color: subjectColor(s.name) };
    cumAngle += angle;
    return slice;
  });

  return (
    <div>
      <Heading sub="Overview of workload, usage and distribution">Analytics & Stats</Heading>

      {/* Summary cards */}
      <div className="grid-stats" style={{ marginBottom: 24 }}>
        {[
          { label: "Total Staff", value: staff.length, color: C.indigo, bg: C.indigoLt },
          { label: "Total Classes", value: classes.length, color: C.sky, bg: "#E0F2FE" },
          { label: "Total Subjects", value: subjects.length, color: C.amber, bg: C.amberLt },
          { label: "Total Rooms", value: rooms.length, color: "#7C3AED", bg: "#F5F3FF" },
          { label: "Weekly Hours", value: subjects.reduce((a, s) => a + s.hoursPerWeek, 0), color: C.green, bg: C.greenLt },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "16px 18px", border: `1.5px solid ${s.color}22` }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "'Playfair Display',serif" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: s.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20 }}>

        {/* Teacher workload bars */}
        <div style={card()}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: C.text }}>Teacher Weekly Workload</h3>
          {stats.teacherHours.length === 0 && <div style={{ color: C.textSm, fontSize: 13 }}>No staff added yet.</div>}
          {stats.teacherHours.map(t => {
            const pct = t.max > 0 ? t.hours / t.max : 0;
            const color = pct > 0.85 ? C.red : pct > 0.6 ? C.amber : C.green;
            return <Bar key={t.name} label={t.name} value={t.hours} max={t.max} color={color} />;
          })}
          <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: 11 }}>
            <span style={{ color: C.green }}>● Light</span>
            <span style={{ color: C.amber }}>● Moderate</span>
            <span style={{ color: C.red }}>● Heavy</span>
          </div>
        </div>

        {/* Subject distribution pie */}
        <div style={card()}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: C.text }}>Subject Distribution</h3>
          {totalSubHrs === 0
            ? <div style={{ color: C.textSm, fontSize: 13 }}>No subjects added yet.</div>
            : (
              <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                <svg width={130} height={130} viewBox="0 0 130 130">
                  {pieSlices.map((s, i) => (
                    <PieSlice key={i} cx={65} cy={65} r={55} startAngle={s.startAngle} endAngle={s.endAngle} color={s.color} />
                  ))}
                </svg>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  {pieSlices.map(s => (
                    <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                      <span style={{ color: C.text, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                      <span style={{ color: C.textSm }}>{s.hrs}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Room utilization */}
        <div style={card()}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: C.text }}>Room Utilization</h3>
          {rooms.length === 0 && <div style={{ color: C.textSm, fontSize: 13 }}>No rooms added yet.</div>}
          {stats.roomUtil.map(r => (
            <div key={r.name} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: C.text }}>{r.name} {r.isLab ? "⚗" : ""}</span>
                <span style={{ color: C.textSm }}>{result ? `${r.pct}%` : "—"}</span>
              </div>
              <div style={{ height: 8, background: C.bg2, borderRadius: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: result ? `${r.pct}%` : "0%", background: r.isLab ? C.amber : C.indigo, borderRadius: 6, transition: "width .6s" }} />
              </div>
            </div>
          ))}
          {!result && <div style={{ fontSize: 11, color: C.textSm, marginTop: 8 }}>Generate a timetable to see room usage.</div>}
        </div>

        {/* Department breakdown */}
        <div style={card()}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: C.text }}>Staff by Department</h3>
          {Object.keys(stats.deptMap).length === 0 && <div style={{ color: C.textSm, fontSize: 13 }}>No staff added yet.</div>}
          {Object.entries(stats.deptMap).map(([dept, count], i) => {
            const colors = [C.indigo, C.sky, C.amber, C.green, "#7C3AED", C.red];
            const color = colors[i % colors.length];
            return (
              <div key={dept} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: C.bg2, borderRadius: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{dept || "Unassigned"}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color, background: color + "18", padding: "2px 10px", borderRadius: 20 }}>{count} staff</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
