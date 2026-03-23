import { useState, useEffect } from 'react';
import {
  addSubject, getSubjects, deleteSubject,
  getAvailableRooms, assignClass, deleteAssignment, updateTeacher,
  getTimetable, getTimeSlotsPublic
} from '../api/index';
import { logout } from '../api/index';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function EditTeacher({ current, onSave, onCancel }) {
  const [val, setVal] = useState(current);

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        className="premium-input min-w-[180px] flex-1 px-3 py-2 text-sm"
        autoFocus
        onKeyDown={e => {
          if (e.key === 'Enter') onSave(val);
          if (e.key === 'Escape') onCancel();
        }}
      />
      <button onClick={() => onSave(val)} className="primary-button px-4 py-3 text-xs">
        Save
      </button>
      <button onClick={onCancel} className="ghost-button px-4 py-3 text-xs">
        Cancel
      </button>
    </div>
  );
}

export default function InstructorDashboard({ onLogout }) {
  const [tab, setTab] = useState('assign');
  const [subjects, setSubjects] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [timetable, setTimetable] = useState({ allocations: [], assignments: [] });
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [conflict, setConflict] = useState(null);
  const [pendingAssign, setPendingAssign] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [assignForm, setAssignForm] = useState({
    subjectId: '', roomId: '', timeSlotId: '', day: 'Monday', teacherName: ''
  });
  const [editingTeacher, setEditingTeacher] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [s, t, tt] = await Promise.all([getSubjects(), getTimeSlotsPublic(), getTimetable()]);
      setSubjects(s.data);
      setTimeSlots(t.data);
      setTimetable(tt.data);
    } catch (err) { console.log('fetchAll error:', err); }
  };

  const showMsg = (m, type = 'success') => { setMsg(m); setMsgType(type); setTimeout(() => setMsg(''), 4000); };

  const handleLogout = async () => { await logout(); onLogout(); };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try { await addSubject({ name: subjectName }); setSubjectName(''); fetchAll(); showMsg('Subject added!'); }
    catch (err) { showMsg(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleDeleteSubject = async (id, name) => {
    if (!window.confirm(`Delete subject "${name}"?\n\nAll class assignments using this subject will also be deleted.`)) return;
    try { await deleteSubject(id); fetchAll(); showMsg('Subject deleted!'); }
    catch (err) { showMsg(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleDeleteAssignment = async (a) => {
    if (!window.confirm(`Delete "${a.subjectId?.name}" from ${a.roomId?.roomNumber} on ${a.day}?`)) return;
    try { await deleteAssignment(a._id); fetchAll(); showMsg('Assignment deleted!'); }
    catch (err) { showMsg(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleSaveTeacher = async (id, newName) => {
    if (!newName.trim()) { showMsg('Teacher name cannot be empty', 'error'); return; }
    try {
      await updateTeacher(id, newName.trim());
      setEditingTeacher(null);
      fetchAll();
      showMsg('Teacher updated!');
    } catch (err) { showMsg(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleDayOrSlotChange = async (newForm) => {
    setAssignForm(newForm);
    if (newForm.day && newForm.timeSlotId) {
      try { const res = await getAvailableRooms(newForm.day, newForm.timeSlotId); setAvailableRooms(res.data); }
      catch { setAvailableRooms([]); }
    }
  };

  const handleAssign = async (e, forceOverwrite = false) => {
    if (e) e.preventDefault();
    try {
      await assignClass({ ...assignForm, forceOverwrite });
      setConflict(null); setPendingAssign(null);
      fetchAll(); showMsg('Class assigned successfully!');
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 409) { setConflict(data); setPendingAssign(assignForm); }
      else { showMsg(data?.message || 'Error', 'error'); }
    }
  };

  const handleOverwrite = async () => {
    try {
      await assignClass({ ...pendingAssign, forceOverwrite: true });
      setConflict(null); setPendingAssign(null);
      fetchAll(); showMsg('Class overwritten successfully!');
    } catch (err) { showMsg(err.response?.data?.message || 'Error', 'error'); }
  };

  const { allocations, assignments } = timetable;

  const getAssignment = (roomId, timeSlotId, day) =>
    assignments.find(a => a.roomId?._id === roomId && a.timeSlotId?._id === timeSlotId && a.day === day);

  const tabs = [
    { key: 'assign', label: 'Assign Class' },
    { key: 'subjects', label: 'Subjects' },
    { key: 'rooms', label: 'Available Rooms' },
    { key: 'timetable', label: 'My Timetable' },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="glass-panel relative overflow-hidden rounded-[36px] px-6 py-7 sm:px-8 sm:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_24%)]" />
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="section-kicker">Instructor Workspace</p>
              <h1 className="display-font text-4xl text-slate-900 sm:text-5xl">Manage your timetable.</h1>
            </div>

            <button onClick={handleLogout} className="secondary-button w-fit">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`tab-button ${tab === t.key ? 'tab-button-active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${
          msgType === 'success'
            ? 'border-emerald-200/80 bg-emerald-50/90 text-emerald-700'
            : 'border-rose-200/80 bg-rose-50/90 text-rose-700'
        }`}>
          {msg}
        </div>
      )}

      <div className="mt-6 space-y-6">
        {tab === 'assign' && (
          <section className="glass-panel max-w-xl rounded-[30px] p-6">
            <p className="section-kicker">Assignment</p>
            <h2 className="section-heading mt-2">Assign Class</h2>

            <form onSubmit={handleAssign} className="mt-6 space-y-3">
              <select className="premium-select" value={assignForm.subjectId} onChange={e => setAssignForm({ ...assignForm, subjectId: e.target.value })} required>
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <input className="premium-input" placeholder="Teacher name" value={assignForm.teacherName} onChange={e => setAssignForm({ ...assignForm, teacherName: e.target.value })} required />
              <select className="premium-select" value={assignForm.day} onChange={e => handleDayOrSlotChange({ ...assignForm, day: e.target.value })}>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
              <select className="premium-select" value={assignForm.timeSlotId} onChange={e => handleDayOrSlotChange({ ...assignForm, timeSlotId: e.target.value })} required>
                <option value="">Select Time Slot</option>
                {timeSlots.map(t => <option key={t._id} value={t._id}>{t.startTime} - {t.endTime}</option>)}
              </select>
              <select className="premium-select" value={assignForm.roomId} onChange={e => setAssignForm({ ...assignForm, roomId: e.target.value })} required>
                <option value="">Select Room</option>
                {availableRooms.map(r => <option key={r._id} value={r._id}>{r.roomNumber}</option>)}
              </select>

              {availableRooms.length === 0 && assignForm.timeSlotId && (
                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-700">
                  No rooms are currently available for the selected day and time slot.
                </div>
              )}

              <button className="primary-button w-full justify-center">Assign Class</button>
            </form>
          </section>
        )}

        {tab === 'subjects' && (
          <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <section className="glass-panel rounded-[30px] p-6">
              <p className="section-kicker">Catalog</p>
              <h2 className="section-heading mt-2">Add Subject</h2>

              <form onSubmit={handleAddSubject} className="mt-6 space-y-3">
                <input className="premium-input" placeholder="Subject name" value={subjectName} onChange={e => setSubjectName(e.target.value)} required />
                <button className="primary-button w-full justify-center">Add Subject</button>
              </form>
            </section>

            <section className="glass-panel rounded-[30px] p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-kicker">Library</p>
                  <h2 className="section-heading mt-2">Subject List</h2>
                </div>
                <span className="info-pill">{subjects.length} subjects</span>
              </div>

              <div className="space-y-3">
                {subjects.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-400">
                    No subjects added yet.
                  </div>
                )}
                {subjects.map(s => (
                  <div key={s._id} className="flex items-center justify-between gap-3 rounded-[22px] border border-slate-200/80 bg-white/80 px-4 py-4">
                    <p className="font-semibold text-slate-900">{s.name}</p>
                    <button onClick={() => handleDeleteSubject(s._id, s.name)} className="font-semibold text-rose-500 transition hover:text-rose-700">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === 'rooms' && (
          <section className="glass-panel rounded-[30px] p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-kicker">Visibility</p>
                <h2 className="section-heading mt-2">Available Rooms by Day &amp; Time</h2>
              </div>
              <span className="info-pill">{allocations.length} allocation records</span>
            </div>

            <div className="table-shell overflow-x-auto">
              <table className="data-table min-w-[820px]">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Time Slot</th>
                    <th>Available Rooms</th>
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map(day =>
                    timeSlots.map(t => {
                      const dayRooms = allocations.filter(a => a.day === day && a.timeSlotId?._id === t._id);
                      if (dayRooms.length === 0) return null;
                      return (
                        <tr key={`${day}-${t._id}`}>
                          <td>{day}</td>
                          <td>{t.startTime} - {t.endTime}</td>
                          <td>
                            <div className="flex flex-wrap gap-2">
                              {dayRooms.map(r => (
                                <span key={r._id} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                  {r.roomId?.roomNumber}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                  {allocations.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center text-slate-400">No room allocations are available for your department yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === 'timetable' && (
          <section className="glass-panel rounded-[30px] p-6">
            <div className="mb-6">
              <div>
                <p className="section-kicker">Weekly View</p>
                <h2 className="section-heading mt-2">My Department Timetable</h2>
              </div>
            </div>

            {DAYS.map(day => {
              const dayAllocations = allocations.filter(a => a.day === day);
              if (dayAllocations.length === 0) return null;
              return (
                <div key={day} className="mb-8 last:mb-0">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="display-font text-2xl text-slate-900">{day}</h3>
                    <span className="info-pill">{dayAllocations.length} room windows</span>
                  </div>

                  <div className="table-shell overflow-x-auto">
                    <table className="data-table min-w-[920px]">
                      <thead>
                        <tr>
                          <th>Room</th>
                          {timeSlots.map(t => (
                            <th key={t._id}>{t.startTime} - {t.endTime}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...new Set(dayAllocations.map(a => a.roomId?._id))].map(roomId => {
                          const room = dayAllocations.find(a => a.roomId?._id === roomId)?.roomId;
                          return (
                            <tr key={roomId}>
                              <td className="font-semibold text-slate-800">{room?.roomNumber}</td>
                              {timeSlots.map(t => {
                                const a = getAssignment(roomId, t._id, day);
                                return (
                                  <td key={t._id}>
                                    {a ? (
                                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3">
                                        <div className="font-semibold text-emerald-900">{a.subjectId?.name}</div>

                                        {editingTeacher === a._id ? (
                                          <EditTeacher
                                            current={a.teacherName}
                                            onSave={(name) => handleSaveTeacher(a._id, name)}
                                            onCancel={() => setEditingTeacher(null)}
                                          />
                                        ) : (
                                          <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
                                              {a.teacherName}
                                            </span>
                                            <button
                                              onClick={() => setEditingTeacher(a._id)}
                                              title="Edit teacher"
                                              className="font-semibold text-emerald-700 transition hover:text-emerald-900"
                                            >
                                              Edit
                                            </button>
                                          </div>
                                        )}

                                        {editingTeacher !== a._id && (
                                          <button
                                            onClick={() => handleDeleteAssignment(a)}
                                            className="mt-3 font-semibold text-rose-500 transition hover:text-rose-700"
                                          >
                                            Delete
                                          </button>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-slate-300">--</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            {allocations.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center text-sm text-slate-400">
                No timetable structure is available yet because your department has no room allocations.
              </div>
            )}
          </section>
        )}
      </div>

      {conflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-[28px] p-6">
            <p className="section-kicker text-rose-600">Conflict detected</p>
            <h3 className="display-font mt-2 text-3xl text-slate-900">Overwrite existing assignment?</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">{conflict.message}</p>
            <p className="mt-3 text-sm text-slate-500">If you continue, the current class entry for that room or teacher slot will be replaced.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={handleOverwrite} className="primary-button w-full justify-center">
                Yes, overwrite
              </button>
              <button onClick={() => setConflict(null)} className="secondary-button w-full justify-center">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
