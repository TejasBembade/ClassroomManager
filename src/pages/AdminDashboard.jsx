import { useState, useEffect } from "react";
import {
  addDepartment, getDepartments, deleteDepartment,
  addRoom, getRooms, deleteRoom,
  addTimeSlot, getTimeSlots, deleteTimeSlot,
  allocateRoom, deleteRoomAllocation,
  createInstructor, getInstructors, deleteInstructor,
  lockDay, getRoomAllocationTimetable, getFullTimetable,
} from "../api/index";
import { logout } from "../api/index";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState("setup");
  const [departments, setDepartments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [msg, setMsg] = useState("");

  const [deptName, setDeptName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allocForm, setAllocForm] = useState({ roomId: "", departmentId: "", timeSlotId: "", day: "Monday" });
  const [instrForm, setInstrForm] = useState({ name: "", email: "", password: "", departmentId: "" });
  const [lockForm, setLockForm] = useState({ departmentId: "", day: "Monday", isLocked: true });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [d, r, t, a, f, i] = await Promise.all([
      getDepartments(), getRooms(), getTimeSlots(),
      getRoomAllocationTimetable(), getFullTimetable(), getInstructors()
    ]);
    setDepartments(d.data);
    setRooms(r.data);
    setTimeSlots(t.data);
    setAllocations(a.data);
    setAssignments(f.data);
    setInstructors(i.data);
  };

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const handleLogout = async () => { await logout(); onLogout(); };

  const handleAddDept = async (e) => {
    e.preventDefault();
    try { await addDepartment({ name: deptName }); setDeptName(""); fetchAll(); showMsg("Department added!"); }
    catch (err) { showMsg(err.response?.data?.message || "Error"); }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try { await addRoom({ roomNumber }); setRoomNumber(""); fetchAll(); showMsg("Room added!"); }
    catch (err) { showMsg(err.response?.data?.message || "Error"); }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try { await addTimeSlot({ startTime, endTime }); setStartTime(""); setEndTime(""); fetchAll(); showMsg("Time slot added!"); }
    catch (err) { showMsg(err.response?.data?.message || "Error"); }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    try { await allocateRoom(allocForm); fetchAll(); showMsg("Room allocated!"); }
    catch (err) { showMsg(err.response?.data?.message || "Error"); }
  };

  const handleCreateInstructor = async (e) => {
    e.preventDefault();
    try { await createInstructor(instrForm); setInstrForm({ name: "", email: "", password: "", departmentId: "" }); fetchAll(); showMsg("Instructor created!"); }
    catch (err) { showMsg(err.response?.data?.message || "Error"); }
  };

  const handleLock = async (e) => {
    e.preventDefault();
    try { await lockDay(lockForm); showMsg(`Timetable ${lockForm.isLocked ? "locked" : "unlocked"}!`); }
    catch (err) { showMsg(err.response?.data?.message || "Error"); }
  };

  const handleDelete = async (fn, id, confirmMsg) => {
    if (!window.confirm(confirmMsg || "Are you sure you want to delete this?")) return;
    try { await fn(id); fetchAll(); showMsg("Deleted!"); }
    catch (err) { showMsg(err.response?.data?.message || "Error"); }
  };

  const tabs = [
    { key: "setup", label: "Setup" },
    { key: "allocate", label: "Allocate Rooms" },
    { key: "instructor", label: "Instructors" },
    { key: "lock", label: "Lock Timetable" },
    { key: "timetable", label: "Timetable" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="glass-panel relative overflow-hidden rounded-[36px] px-6 py-7 sm:px-8 sm:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.12),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_22%)]" />
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="section-kicker">Admin Control Center</p>
              <h1 className="display-font text-4xl text-slate-900 sm:text-5xl">Manage timetable settings.</h1>
            </div>

            <button onClick={handleLogout} className="secondary-button w-fit">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`tab-button ${tab === t.key ? "tab-button-active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {msg && <div className="status-banner mt-6">{msg}</div>}

      <div className="mt-6 space-y-6">
        {tab === "setup" && (
          <div className="grid gap-6 xl:grid-cols-3">
            <section className="glass-panel rounded-[30px] p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="section-kicker">Department</p>
                  <h2 className="section-heading mt-2">Add Department</h2>
                </div>
                <span className="info-pill">{departments.length} total</span>
              </div>

              <form onSubmit={handleAddDept} className="space-y-3">
                <input
                  className="premium-input"
                  placeholder="Department name"
                  value={deptName}
                  onChange={e => setDeptName(e.target.value)}
                  required
                />
                <button className="primary-button w-full justify-center">Add Department</button>
              </form>

              <div className="mt-5 space-y-2">
                {departments.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-sm text-slate-400">
                    No departments added yet.
                  </div>
                )}
                {departments.map((d) => (
                  <div key={d._id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/75 px-4 py-3">
                    <p className="font-medium text-slate-800">{d.name}</p>
                    <button
                      onClick={() => handleDelete(deleteDepartment, d._id, `Delete department "${d.name}"?\n\nThis will also delete all its subjects, class assignments, room allocations, locks and instructor accounts.`)}
                      className="text-sm font-semibold text-rose-500 transition hover:text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-panel rounded-[30px] p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="section-kicker">Room</p>
                  <h2 className="section-heading mt-2">Add Room</h2>
                </div>
                <span className="info-pill">{rooms.length} total</span>
              </div>

              <form onSubmit={handleAddRoom} className="space-y-3">
                <input
                  className="premium-input"
                  placeholder="Room number"
                  value={roomNumber}
                  onChange={e => setRoomNumber(e.target.value)}
                  required
                />
                <button className="primary-button w-full justify-center">Add Room</button>
              </form>

              <div className="mt-5 space-y-2">
                {rooms.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-sm text-slate-400">
                    No rooms added yet.
                  </div>
                )}
                {rooms.map((r) => (
                  <div key={r._id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/75 px-4 py-3">
                    <p className="font-medium text-slate-800">{r.roomNumber}</p>
                    <button
                      onClick={() => handleDelete(deleteRoom, r._id, `Delete room "${r.roomNumber}"?\n\nAll allocations and class assignments in this room will also be deleted.`)}
                      className="text-sm font-semibold text-rose-500 transition hover:text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-panel rounded-[30px] p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="section-kicker">Time Slot</p>
                  <h2 className="section-heading mt-2">Add Time Slot</h2>
                </div>
                <span className="info-pill">{timeSlots.length} total</span>
              </div>

              <form onSubmit={handleAddSlot} className="space-y-3">
                <input
                  className="premium-input"
                  placeholder="Start time e.g. 9:00 AM"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  required
                />
                <input
                  className="premium-input"
                  placeholder="End time e.g. 10:00 AM"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  required
                />
                <button className="primary-button w-full justify-center">Add Time Slot</button>
              </form>

              <div className="mt-5 space-y-2">
                {timeSlots.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-sm text-slate-400">
                    No time slots added yet.
                  </div>
                )}
                {timeSlots.map((t) => (
                  <div key={t._id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/75 px-4 py-3">
                    <p className="font-medium text-slate-800">{t.startTime} - {t.endTime}</p>
                    <button
                      onClick={() => handleDelete(deleteTimeSlot, t._id, `Delete time slot "${t.startTime} - ${t.endTime}"?\n\nAll allocations and assignments in this slot will also be deleted.`)}
                      className="text-sm font-semibold text-rose-500 transition hover:text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === "allocate" && (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
            <section className="glass-panel rounded-[30px] p-6">
              <p className="section-kicker">Operations</p>
              <h2 className="section-heading mt-2">Allocate Room to Department</h2>

              <form onSubmit={handleAllocate} className="mt-6 space-y-3">
                <select className="premium-select" value={allocForm.roomId} onChange={e => setAllocForm({ ...allocForm, roomId: e.target.value })} required>
                  <option value="">Select Room</option>
                  {rooms.map(r => <option key={r._id} value={r._id}>{r.roomNumber}</option>)}
                </select>
                <select className="premium-select" value={allocForm.departmentId} onChange={e => setAllocForm({ ...allocForm, departmentId: e.target.value })} required>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
                <select className="premium-select" value={allocForm.timeSlotId} onChange={e => setAllocForm({ ...allocForm, timeSlotId: e.target.value })} required>
                  <option value="">Select Time Slot</option>
                  {timeSlots.map(t => <option key={t._id} value={t._id}>{t.startTime} - {t.endTime}</option>)}
                </select>
                <select className="premium-select" value={allocForm.day} onChange={e => setAllocForm({ ...allocForm, day: e.target.value })}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
                <button className="primary-button w-full justify-center">Save Allocation</button>
              </form>
            </section>

            <section className="glass-panel rounded-[30px] p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-kicker">Current Map</p>
                  <h2 className="section-heading mt-2">Room Allocation Matrix</h2>
                </div>
                <span className="info-pill">{allocations.length} allocations</span>
              </div>

              <div className="table-shell overflow-x-auto">
                <table className="data-table min-w-[760px]">
                  <thead>
                    <tr>
                      <th>Room</th>
                      <th>Department</th>
                      <th>Day</th>
                      <th>Time</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.map((a) => (
                      <tr key={a._id}>
                        <td>{a.roomId?.roomNumber}</td>
                        <td>{a.departmentId?.name}</td>
                        <td>{a.day}</td>
                        <td>{a.timeSlotId?.startTime} - {a.timeSlotId?.endTime}</td>
                        <td>
                          <button
                            onClick={() => handleDelete(deleteRoomAllocation, a._id, `Remove this allocation?\n\nAny class assigned to this slot will also be deleted.`)}
                            className="font-semibold text-rose-500 transition hover:text-rose-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {allocations.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-slate-400">No allocations yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {tab === "instructor" && (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.15fr]">
            <section className="glass-panel rounded-[30px] p-6">
              <p className="section-kicker">Access</p>
              <h2 className="section-heading mt-2">Create Instructor Account</h2>

              <form onSubmit={handleCreateInstructor} className="mt-6 space-y-3">
                <input className="premium-input" placeholder="Name" value={instrForm.name} onChange={e => setInstrForm({ ...instrForm, name: e.target.value })} required />
                <input className="premium-input" placeholder="Email" type="email" value={instrForm.email} onChange={e => setInstrForm({ ...instrForm, email: e.target.value })} required />
                <input className="premium-input" placeholder="Password" value={instrForm.password} onChange={e => setInstrForm({ ...instrForm, password: e.target.value })} required />
                <select className="premium-select" value={instrForm.departmentId} onChange={e => setInstrForm({ ...instrForm, departmentId: e.target.value })} required>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
                <button className="primary-button w-full justify-center">Create Instructor</button>
              </form>
            </section>

            <section className="glass-panel rounded-[30px] p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-kicker">Directory</p>
                  <h2 className="section-heading mt-2">All Instructors</h2>
                </div>
                <span className="info-pill">{instructors.length} active</span>
              </div>

              <div className="space-y-3">
                {instructors.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-400">
                    No instructors yet.
                  </div>
                )}
                {instructors.map(i => (
                  <div key={i._id} className="flex flex-col gap-3 rounded-[24px] border border-slate-200/80 bg-white/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{i.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{i.email}</p>
                      <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{i.departmentId?.name}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(deleteInstructor, i._id, `Delete instructor "${i.name}" (${i.email})?`)}
                      className="font-semibold text-rose-500 transition hover:text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === "lock" && (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="glass-panel rounded-[30px] p-6">
              <p className="section-kicker">Governance</p>
              <h2 className="section-heading mt-2">Lock or Unlock a Day</h2>

              <form onSubmit={handleLock} className="mt-6 space-y-3">
                <select className="premium-select" value={lockForm.departmentId} onChange={e => setLockForm({ ...lockForm, departmentId: e.target.value })} required>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
                <select className="premium-select" value={lockForm.day} onChange={e => setLockForm({ ...lockForm, day: e.target.value })}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
                <select
                  className="premium-select"
                  value={lockForm.isLocked}
                  onChange={e => setLockForm({ ...lockForm, isLocked: e.target.value === "true" })}
                >
                  <option value="true">Lock</option>
                  <option value="false">Unlock</option>
                </select>
                <button className="primary-button w-full justify-center">Apply Change</button>
              </form>
            </section>

            <section className="glass-panel rounded-[30px] bg-slate-950 p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">Lock Status</p>
              <p className="mt-4 text-sm leading-7 text-slate-300">Locking a day prevents instructors from editing assignments for that department and weekday.</p>
            </section>
          </div>
        )}

        {tab === "timetable" && (
          <section className="glass-panel rounded-[30px] p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-kicker">Overview</p>
                <h2 className="section-heading mt-2">Full Timetable</h2>
              </div>
              <span className="info-pill">{assignments.length} assignments</span>
            </div>

            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => {
              const dayAssignments = assignments.filter(a => a.day === day);
              if (dayAssignments.length === 0) return null;
              return (
                <div key={day} className="mb-8 last:mb-0">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="display-font text-2xl text-slate-900">{day}</h3>
                    <span className="info-pill">{dayAssignments.length} classes</span>
                  </div>

                  <div className="table-shell overflow-x-auto">
                    <table className="data-table min-w-[720px]">
                      <thead>
                        <tr>
                          <th>Room</th>
                          <th>Subject</th>
                          <th>Teacher</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayAssignments.map(a => (
                          <tr key={a._id}>
                            <td className="font-semibold text-slate-800">
                              {a.roomId?.roomNumber || <span className="text-xs text-rose-500">Room deleted</span>}
                            </td>
                            <td>{a.subjectId?.name || <span className="text-xs text-rose-500">Subject deleted</span>}</td>
                            <td>{a.teacherName}</td>
                            <td>{a.timeSlotId?.startTime} - {a.timeSlotId?.endTime}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            {assignments.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center text-sm text-slate-400">
                No assignments yet.
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
