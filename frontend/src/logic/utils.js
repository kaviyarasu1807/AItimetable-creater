export const PALETTE = [
  "#4338CA","#0891B2","#059669","#D97706","#DC2626",
  "#7C3AED","#0284C7","#16A34A","#CA8A04","#E11D48",
  "#6D28D9","#0369A1","#15803D","#B45309","#BE185D",
];

export const subjectColor = name => {
  if (!name) return PALETTE[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h*31 + name.charCodeAt(i)) & 0xffffffff;
  return PALETTE[Math.abs(h) % PALETTE.length];
};

export const DEFAULT_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
export const DEFAULT_SLOTS = [
  { id:"sl1", label:"9:00 AM",  start:"09:00", end:"10:00", isLunch:false, isMorning:true  },
  { id:"sl2", label:"10:00 AM", start:"10:00", end:"11:00", isLunch:false, isMorning:true  },
  { id:"sl3", label:"11:00 AM", start:"11:00", end:"12:00", isLunch:false, isMorning:true  },
  { id:"sl4", label:"12:00 PM", start:"12:00", end:"13:00", isLunch:true,  isMorning:false },
  { id:"sl5", label:"1:00 PM",  start:"13:00", end:"14:00", isLunch:false, isMorning:false },
  { id:"sl6", label:"2:00 PM",  start:"14:00", end:"15:00", isLunch:false, isMorning:false },
  { id:"sl7", label:"3:00 PM",  start:"15:00", end:"16:00", isLunch:false, isMorning:false },
  { id:"sl8", label:"4:00 PM",  start:"16:00", end:"17:00", isLunch:false, isMorning:false },
];

// ── Timetable Engine (client-side) ────────────────────────────

function buildGrids(assigned, teachers, classes, subjects, days, slots) {
  const timetable = {};
  classes.forEach(cls => {
    timetable[cls.id] = {};
    days.forEach(day => {
      timetable[cls.id][day] = {};
      slots.forEach(slot => {
        timetable[cls.id][day][slot.id] = slot.isLunch ? { subject: "LUNCH", isLunch: true } : null;
      });
    });
  });

  assigned.forEach(a => {
    const t = teachers.find(x => x.id === a.teacherId);
    if (timetable[a.classId]?.[a.day]) {
      timetable[a.classId][a.day][a.slotId] = {
        subject: a.name, teacherId: a.teacherId, teacherName: t?.name || "TBA",
        isLab: a.isLab, roomName: a.roomName || null, isLunch: false,
      };
    }
  });

  const teacherView = {};
  teachers.forEach(t => {
    teacherView[t.id] = {};
    days.forEach(day => {
      teacherView[t.id][day] = {};
      slots.forEach(slot => { teacherView[t.id][day][slot.id] = null; });
    });
  });

  assigned.forEach(a => {
    if (teacherView[a.teacherId]) {
      const cls = classes.find(c => c.id === a.classId);
      teacherView[a.teacherId][a.day][a.slotId] = { className: cls?.name || "?", subject: a.name, isLab: a.isLab };
    }
  });

  const utilization = {};
  teachers.forEach(t => {
    const count = assigned.filter(a => a.teacherId === t.id).length;
    utilization[t.id] = Math.round((count / (days.length * slots.filter(s => !s.isLunch).length)) * 100);
  });

  return { timetable, teacherView, utilization, violations: [], conflicts: 0 };
}

export function runCSP(teachers, classes, subjects, days, slots, rooms, logCb) {
  const usable = slots.filter(s => !s.isLunch);
  const emit = m => logCb?.(m);

  const tasks = [];
  subjects.forEach(sub => {
    let remaining = sub.hoursPerWeek;
    while (remaining > 0) {
      const size = (sub.isLab && remaining >= 2) ? 2 : 1;
      tasks.push({ ...sub, sessionSize: size });
      remaining -= size;
    }
  });

  const teacherLoad = {};
  teachers.forEach(t => { teacherLoad[t.id] = t.availability?.length || 5; });
  tasks.sort((a, b) => {
    if (a.sessionSize !== b.sessionSize) return b.sessionSize - a.sessionSize;
    if (a.isLab !== b.isLab) return b.isLab ? 1 : -1;
    return (teacherLoad[a.teacherId] || 5) - (teacherLoad[b.teacherId] || 5);
  });

  emit(`[CSP] Solver starting with ${tasks.length} sessions.`);

  const tBusy = {}, cBusy = {}, rBusy = {}, tDayCount = {};
  const solution = [];
  let iterations = 0;
  const MAX_ITERATIONS = 50000;

  function solve(taskIndex) {
    iterations++;
    if (iterations > MAX_ITERATIONS) return false;
    if (taskIndex >= tasks.length) return true;

    const task = tasks[taskIndex];
    const teacher = teachers.find(t => t.id === task.teacherId);
    const availDays = teacher?.availability?.length ? teacher.availability : days;
    const maxHrsPerDay = teacher?.maxHrsDay || 5;
    const tryDays = [...availDays].filter(d => days.includes(d)).sort(() => Math.random() - 0.5);

    for (const day of tryDays) {
      for (let i = 0; i <= usable.length - task.sessionSize; i++) {
        const sessionSlots = usable.slice(i, i + task.sessionSize);

        let consecutive = true;
        for (let j = 1; j < sessionSlots.length; j++) {
          if (slots.indexOf(sessionSlots[j]) !== slots.indexOf(sessionSlots[j - 1]) + 1) { consecutive = false; break; }
        }
        if (!consecutive) continue;

        const canPlace = sessionSlots.every(slot => {
          return !tBusy[`${task.teacherId}|${day}|${slot.id}`] && !cBusy[`${task.classId}|${day}|${slot.id}`];
        });
        if (!canPlace) continue;

        if ((tDayCount[`${task.teacherId}|${day}`] || 0) + task.sessionSize > maxHrsPerDay) continue;

        const hasRooms = (rooms || []).length > 0;
        const room = hasRooms
          ? rooms.find(r => r.isLab === task.isLab && sessionSlots.every(s => !rBusy[`${r.id}|${day}|${s.id}`]))
          : null;
        if (hasRooms && !room) continue;

        sessionSlots.forEach(s => {
          tBusy[`${task.teacherId}|${day}|${s.id}`] = true;
          cBusy[`${task.classId}|${day}|${s.id}`] = true;
          if (room) rBusy[`${room.id}|${day}|${s.id}`] = true;
          solution.push({ ...task, day, slotId: s.id, roomId: room?.id || null, roomName: room?.name || null });
        });
        tDayCount[`${task.teacherId}|${day}`] = (tDayCount[`${task.teacherId}|${day}`] || 0) + task.sessionSize;

        if (solve(taskIndex + 1)) return true;

        sessionSlots.forEach(() => {
          const last = solution.pop();
          tBusy[`${task.teacherId}|${day}|${last.slotId}`] = false;
          cBusy[`${task.classId}|${day}|${last.slotId}`] = false;
          if (room) rBusy[`${room.id}|${day}|${last.slotId}`] = false;
        });
        tDayCount[`${task.teacherId}|${day}`] -= task.sessionSize;
      }
    }
    return false;
  }

  const success = solve(0);
  if (!success) emit("[WARN] Some sessions could not be placed due to constraints.");
  emit(`[CSP] Finished in ${iterations} iterations.`);
  return buildGrids(solution, teachers, classes, subjects, days, slots);
}

export function runGA(teachers, classes, subjects, days, slots, params, logCb) {
  const { generations = 80, popSize = 40 } = params || {};
  const usable = slots.filter(s => !s.isLunch);
  const emit = m => logCb?.(m);

  let pop = Array.from({ length: popSize }, () =>
    subjects.flatMap(sub => {
      const t = teachers.find(x => x.id === sub.teacherId);
      const avail = (t?.availability || days).filter(d => days.includes(d));
      return Array.from({ length: sub.hoursPerWeek }, () => ({
        ...sub,
        day: avail[Math.floor(Math.random() * avail.length)],
        slotId: usable[Math.floor(Math.random() * usable.length)].id,
      }));
    })
  );

  let best = pop[0], bestScore = Infinity;
  emit(`[GA] Meta-heuristic started...`);

  for (let g = 0; g < generations; g++) {
    const scored = pop.map(genes => {
      let p = 0; const tb = {}, cb = {};
      genes.forEach(gn => {
        const tk = `${gn.teacherId}|${gn.day}|${gn.slotId}`;
        const ck = `${gn.classId}|${gn.day}|${gn.slotId}`;
        if (tb[tk]) p += 100; if (cb[ck]) p += 100;
        tb[tk] = cb[ck] = true;
      });
      return { genes, score: p };
    }).sort((a, b) => a.score - b.score);

    if (scored[0].score < bestScore) {
      bestScore = scored[0].score; best = scored[0].genes;
      emit(`[GA] Gen ${g + 1}: Fitness ${bestScore}`);
    }
    if (bestScore === 0) break;

    const next = [scored[0].genes, scored[1].genes];
    while (next.length < popSize) {
      const p = scored[Math.floor(Math.random() * 5)].genes;
      next.push(p.map(bit => Math.random() < 0.1
        ? { ...bit, day: days[Math.floor(Math.random() * days.length)], slotId: usable[Math.floor(Math.random() * usable.length)].id }
        : bit));
    }
    pop = next;
  }

  return buildGrids(best, teachers, classes, subjects, days, slots);
}
