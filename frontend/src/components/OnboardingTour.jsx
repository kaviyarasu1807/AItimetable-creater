import React, { useState, useEffect } from "react";
import { C, btn, ghostBtn } from "../styles/theme";

const STEPS = [
  {
    title: "Welcome to RVSCET Timetable AI",
    desc: "This quick tour will show you how to set up and generate your college timetable in minutes.",
    page: null,
    icon: "👋",
  },
  {
    title: "Step 1 — Add Staff",
    desc: "Go to the Staff page to add faculty members. Enter their name, subject, department, and available days.",
    page: "staff",
    icon: "◉",
  },
  {
    title: "Step 2 — Add Classes",
    desc: "Go to Classes and add your sections like CS-A, IT-B etc. with year and department info.",
    page: "classes",
    icon: "◫",
  },
  {
    title: "Step 3 — Assign Subjects",
    desc: "In Subjects, link each subject to a class and a teacher, and set how many hours per week.",
    page: "subjects",
    icon: "◎",
  },
  {
    title: "Step 4 — Add Rooms",
    desc: "Add classrooms and labs under Rooms. Mark labs separately so the engine assigns them correctly.",
    page: "rooms",
    icon: "▣",
  },
  {
    title: "Step 5 — Configure Time Slots",
    desc: "Under Time Slots, define your daily schedule — periods, lunch break, and working days.",
    page: "slots",
    icon: "🕒",
  },
  {
    title: "Step 6 — Generate Timetable",
    desc: "Hit Generate and choose CSP or Genetic Algorithm. The AI will build a conflict-free timetable automatically.",
    page: "generate",
    icon: "⚡",
  },
  {
    title: "Step 7 — View & Edit",
    desc: "On the Timetable page, view by class or teacher. Use Override mode to manually adjust any slot.",
    page: "timetable",
    icon: "📋",
  },
  {
    title: "You're all set!",
    desc: "Check the Stats page for workload analytics. Your data is saved to Supabase automatically when logged in.",
    page: null,
    icon: "🎉",
  },
];

export function OnboardingTour({ onFinish, setPage }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  useEffect(() => {
    if (current.page) setPage(current.page);
  }, [step]);

  return (
    <>
      {/* Dim overlay */}
      <div className="tour-overlay" />

      {/* Tour card */}
      <div style={{
        position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
        background: C.bg1, border: `2px solid ${C.indigoBd}`,
        borderRadius: 18, padding: "24px 28px", width: "90%", maxWidth: 440,
        zIndex: 1002, boxShadow: "0 12px 40px rgba(67,56,202,.18)",
        fontFamily: "'DM Sans',sans-serif",
      }}>
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 5, marginBottom: 18, justifyContent: "center" }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 20 : 7, height: 7, borderRadius: 4, background: i === step ? C.indigo : i < step ? C.indigoBd : C.bg3, transition: "all .3s" }} />
          ))}
        </div>

        {/* Icon + content */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>{current.icon}</div>
          <div>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: C.text }}>{current.title}</h3>
            <p style={{ margin: 0, fontSize: 13, color: C.textMd, lineHeight: 1.6 }}>{current.desc}</p>
          </div>
        </div>

        {/* Step counter */}
        <div style={{ fontSize: 11, color: C.textSm, textAlign: "center", marginBottom: 14 }}>
          {step + 1} of {STEPS.length}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          {step > 0 && (
            <button style={{ ...ghostBtn(), flex: 1 }} onClick={() => setStep(s => s - 1)}>← Back</button>
          )}
          <button
            style={{ ...btn(C.indigo), flex: 2, justifyContent: "center", display: "flex" }}
            onClick={() => isLast ? onFinish() : setStep(s => s + 1)}>
            {isLast ? "Get Started →" : "Next →"}
          </button>
          <button style={{ ...ghostBtn(), padding: "8px 12px", fontSize: 11, color: C.textSm }} onClick={onFinish}>Skip</button>
        </div>
      </div>
    </>
  );
}

export function useTour() {
  const [tourDone, setTourDone] = useState(() => localStorage.getItem("rvs_tour_done") === "1");
  const finishTour = () => { localStorage.setItem("rvs_tour_done", "1"); setTourDone(true); };
  const resetTour = () => { localStorage.removeItem("rvs_tour_done"); setTourDone(false); };
  return { showTour: !tourDone, finishTour, resetTour };
}
