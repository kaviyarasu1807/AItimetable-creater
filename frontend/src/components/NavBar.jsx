import React, { useState, useRef, useEffect } from "react";
import { C } from "../styles/theme";
import { isDemo } from "../api/supabase";

export function NavBar({ page, setPage, onLogout, hasResult, userEmail }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const items = [
    { id: "dashboard", label: "Dashboard", icon: "⊞" },
    { id: "staff",     label: "Staff",     icon: "◉" },
    { id: "classes",   label: "Classes",   icon: "◫" },
    { id: "subjects",  label: "Subjects",  icon: "◎" },
    { id: "rooms",     label: "Rooms",     icon: "▣" },
    { id: "slots",     label: "Time Slots",icon: "🕒" },
    { id: "generate",  label: "Generate",  icon: "⚡" },
    { id: "timetable", label: "Timetable", icon: "📋", badge: hasResult },
    { id: "stats",     label: "Stats",     icon: "📊" },
  ];

  const navBtnStyle = (active) => ({
    position: "relative", padding: "6px 13px", borderRadius: 8,
    background: active ? C.indigoLt : "transparent",
    border: active ? `1.5px solid ${C.indigoBd}` : "1.5px solid transparent",
    color: active ? C.indigo : C.textMd, fontSize: 12, fontWeight: 600,
    cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
    display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
  });

  const navigate = (id) => { setPage(id); setMenuOpen(false); };

  const initials = userEmail ? userEmail[0].toUpperCase() : "?";
  const joinedDate = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  return (
    <nav style={{
      background: C.bg1, borderBottom: `1.5px solid ${C.border}`,
      padding: "0 20px", display: "flex", alignItems: "center", height: 58, gap: 2,
      position: "sticky", top: 0, zIndex: 200,
      boxShadow: "0 1px 4px rgba(28,25,23,.06)"
    }}>
      {/* Logo */}
      <div style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <img src="/image.png" alt="Logo" style={{ width: 38, height: 38, borderRadius: 8, objectFit: "contain" }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>RVSCET.AI</span>
          <span style={{ fontSize: 9, color: C.textSm, letterSpacing: "0.05em", textTransform: "uppercase" }}>DEPT OF IT</span>
        </div>
        <span style={{ fontSize: 10, color: isDemo ? C.amber : C.green, background: isDemo ? C.amberLt : C.greenLt, padding: "2px 8px", borderRadius: 10, border: `1px solid ${isDemo ? C.amberBd : C.greenBd}`, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
          {isDemo ? "● Local" : "● Live"}
        </span>
      </div>

      {/* Desktop nav links */}
      <div className="navbar-links">
        {items.map(n => (
          <button key={n.id} onClick={() => navigate(n.id)} style={navBtnStyle(page === n.id)}>
            <span style={{ fontSize: 11 }}>{n.icon}</span>{n.label}
            {n.badge && <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: C.green, border: `2px solid ${C.bg1}` }} />}
          </button>
        ))}
      </div>

      {/* Profile + Sign out */}
      <div style={{ marginLeft: 10, display: "flex", alignItems: "center", gap: 8 }}>

        {/* Profile avatar with dropdown */}
        {userEmail && (
          <div ref={profileRef} style={{ position: "relative" }}>
            <div
              onClick={() => setProfileOpen(o => !o)}
              style={{
                width: 34, height: 34, borderRadius: "50%", background: profileOpen ? C.indigo : C.indigoLt,
                border: `1.5px solid ${C.indigoBd}`, color: profileOpen ? "#fff" : C.indigo,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, cursor: "pointer", flexShrink: 0,
                transition: "all .15s", userSelect: "none",
              }}>
              {initials}
            </div>

            {/* Dropdown */}
            {profileOpen && (
              <div style={{
                position: "absolute", top: 42, right: 0, background: C.bg1,
                border: `1.5px solid ${C.border}`, borderRadius: 14,
                boxShadow: "0 8px 24px rgba(28,25,23,.12)",
                minWidth: 260, zIndex: 300, overflow: "hidden",
              }}>
                {/* Header */}
                <div style={{ background: C.indigoLt, padding: "20px 20px 16px", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.indigo, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{userEmail.split("@")[0]}</div>
                      <div style={{ fontSize: 11, color: C.textSm, marginTop: 2 }}>{userEmail}</div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: C.textSm, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Role</span>
                      <span style={{ fontSize: 12, color: C.text, fontWeight: 600, background: C.indigoLt, padding: "2px 10px", borderRadius: 20, border: `1px solid ${C.indigoBd}` }}>Admin</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: C.textSm, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Database</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: isDemo ? C.amber : C.green, background: isDemo ? C.amberLt : C.greenLt, padding: "2px 10px", borderRadius: 20, border: `1px solid ${isDemo ? C.amberBd : C.greenBd}` }}>
                        {isDemo ? "Local Mode" : "Supabase"}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: C.textSm, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Institution</span>
                      <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>RVSCET</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: C.textSm, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Session</span>
                      <span style={{ fontSize: 11, color: C.textSm }}>{joinedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Sign out */}
                <div style={{ padding: "0 14px 14px" }}>
                  <button
                    onClick={() => { setProfileOpen(false); onLogout(); }}
                    style={{ width: "100%", padding: "9px 0", background: C.redLt, border: `1.5px solid ${C.redBd}`, borderRadius: 8, color: C.red, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hamburger */}
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          style={{ background: "transparent", border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", display: "none", flexDirection: "column", gap: 4, alignItems: "center", justifyContent: "center" }}>
          <span style={{ display: "block", width: 18, height: 2, background: C.text, borderRadius: 2 }} />
          <span style={{ display: "block", width: 18, height: 2, background: C.text, borderRadius: 2 }} />
          <span style={{ display: "block", width: 18, height: 2, background: C.text, borderRadius: 2 }} />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      <div className={`navbar-mobile-menu${menuOpen ? " open" : ""}`}>
        {items.map(n => (
          <button key={n.id} onClick={() => navigate(n.id)} style={{ ...navBtnStyle(page === n.id), width: "100%", justifyContent: "flex-start", padding: "10px 14px" }}>
            <span style={{ fontSize: 13 }}>{n.icon}</span>{n.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
