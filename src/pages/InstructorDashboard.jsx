import { useState, useEffect } from 'react';
import {
  addSubject, getSubjects, deleteSubject,
  getAvailableRooms, assignClass, deleteAssignment, updateTeacher,
  getTimetable, getTimeSlotsPublic
} from '../api/index';
import { logout } from '../api/index';

function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 py-3 px-6 text-center z-50">
      <p className="text-xs text-gray-400">
        Created by{' '}<span className="text-gray-200 font-medium">Tejas Bembade</span>
        <span className="text-gray-600 mx-2">|</span>
        Branch:{' '}<span className="text-gray-200 font-medium">Information Technology</span>
        <span className="text-gray-600 mx-2">|</span>
        Roll No:{' '}<span className="text-gray-200 font-medium">123103035</span>
        <span className="text-gray-600 mx-2">|</span>
        <span className="text-gray-200 font-medium">NIT Kurukshetra</span>
      </p>
    </footer>
  );
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Inline teacher edit component
function EditTeacher({ current, onSave, onCancel }) {
  const [val, setVal] = useState(current);
  return (
    <div className="flex gap-1 items-center mt-1">
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        className="flex-1 border rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-400"
        autoFocus
        onKeyDown={e => { if (e.key === 'Enter') onSave(val); if (e.key === 'Escape') onCancel(); }}
      />
      <button onClick={() => onSave(val)} className="text-xs bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-700">Save</button>
      <button onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
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
  // Tracks which assignment's teacher is being edited (_id or null)
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
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-green-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Instructor Dashboard</h1>
        <button onClick={handleLogout} className="text-sm bg-white text-green-700 px-4 py-1.5 rounded-lg font-medium">Logout</button>
      </div>

      <div className="flex gap-2 px-6 pt-4">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t.key ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <div className={`mx-6 mt-4 px-4 py-2 rounded-lg text-sm ${msgType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {msg}
        </div>
      )}

      <div className="p-6">

        {/* ASSIGN TAB */}
        {tab === 'assign' && (
          <div className="max-w-lg">
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-4">Assign Class</h2>
              <form onSubmit={handleAssign} className="flex flex-col gap-3">
                <select className="border rounded-lg px-3 py-2 text-sm" value={assignForm.subjectId} onChange={e => setAssignForm({...assignForm, subjectId: e.target.value})} required>
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
                <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Teacher name" value={assignForm.teacherName} onChange={e => setAssignForm({...assignForm, teacherName: e.target.value})} required />
                <select className="border rounded-lg px-3 py-2 text-sm" value={assignForm.day} onChange={e => handleDayOrSlotChange({...assignForm, day: e.target.value})}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
                <select className="border rounded-lg px-3 py-2 text-sm" value={assignForm.timeSlotId} onChange={e => handleDayOrSlotChange({...assignForm, timeSlotId: e.target.value})} required>
                  <option value="">Select Time Slot</option>
                  {timeSlots.map(t => <option key={t._id} value={t._id}>{t.startTime} - {t.endTime}</option>)}
                </select>
                <select className="border rounded-lg px-3 py-2 text-sm" value={assignForm.roomId} onChange={e => setAssignForm({...assignForm, roomId: e.target.value})} required>
                  <option value="">Select Room</option>
                  {availableRooms.map(r => <option key={r._id} value={r._id}>{r.roomNumber}</option>)}
                </select>
                {availableRooms.length === 0 && assignForm.timeSlotId && (
                  <p className="text-xs text-red-500">No rooms available for selected day and time slot.</p>
                )}
                <button className="bg-green-600 text-white py-2 rounded-lg text-sm font-medium">Assign</button>
              </form>
            </div>
          </div>
        )}

        {/* SUBJECTS TAB */}
        {tab === 'subjects' && (
          <div className="max-w-md">
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-4">Add Subject</h2>
              <form onSubmit={handleAddSubject} className="flex flex-col gap-3">
                <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Subject name" value={subjectName} onChange={e => setSubjectName(e.target.value)} required />
                <button className="bg-green-600 text-white py-2 rounded-lg text-sm">Add</button>
              </form>
              <ul className="mt-4 text-sm text-gray-600 space-y-1">
                {subjects.map(s => (
                  <li key={s._id} className="bg-gray-50 px-3 py-1 rounded flex justify-between items-center">
                    <span>• {s.name}</span>
                    <button onClick={() => handleDeleteSubject(s._id, s.name)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* AVAILABLE ROOMS TAB */}
        {tab === 'rooms' && (
          <div className="bg-white p-5 rounded-xl shadow-sm max-w-2xl">
            <h2 className="font-semibold text-gray-700 mb-4">Available Rooms by Day & Time</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-left border">Day</th>
                  <th className="p-2 text-left border">Time Slot</th>
                  <th className="p-2 text-left border">Available Rooms</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map(day =>
                  timeSlots.map(t => {
                    const dayRooms = allocations.filter(a => a.day === day && a.timeSlotId?._id === t._id);
                    if (dayRooms.length === 0) return null;
                    return (
                      <tr key={`${day}-${t._id}`} className="border-t">
                        <td className="p-2 border">{day}</td>
                        <td className="p-2 border">{t.startTime} - {t.endTime}</td>
                        <td className="p-2 border">
                          {dayRooms.map(r => (
                            <span key={r._id} className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs mr-1">
                              {r.roomId?.roomNumber}
                            </span>
                          ))}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TIMETABLE TAB */}
        {tab === 'timetable' && (
          <div className="bg-white p-5 rounded-xl shadow-sm overflow-auto">
            <h2 className="font-semibold text-gray-700 mb-1">My Department Timetable</h2>
            <p className="text-xs text-gray-400 mb-4">Click ✏ to edit teacher name · Click Delete to remove assignment</p>
            {DAYS.map(day => {
              const dayAllocations = allocations.filter(a => a.day === day);
              if (dayAllocations.length === 0) return null;
              return (
                <div key={day} className="mb-6">
                  <h3 className="font-medium text-indigo-600 mb-2">{day}</h3>
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-2 text-left border">Room</th>
                        {timeSlots.map(t => (
                          <th key={t._id} className="p-2 text-left border">{t.startTime} - {t.endTime}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...new Set(dayAllocations.map(a => a.roomId?._id))].map(roomId => {
                        const room = dayAllocations.find(a => a.roomId?._id === roomId)?.roomId;
                        return (
                          <tr key={roomId} className="border-t">
                            <td className="p-2 border font-medium">{room?.roomNumber}</td>
                            {timeSlots.map(t => {
                              const a = getAssignment(roomId, t._id, day);
                              return (
                                <td key={t._id} className="p-2 border">
                                  {a ? (
                                    <div className="bg-green-50 rounded p-1">
                                      <div className="font-medium text-green-800 text-xs">{a.subjectId?.name}</div>

                                      {/* Teacher — editable inline */}
                                      {editingTeacher === a._id ? (
                                        <EditTeacher
                                          current={a.teacherName}
                                          onSave={(name) => handleSaveTeacher(a._id, name)}
                                          onCancel={() => setEditingTeacher(null)}
                                        />
                                      ) : (
                                        <div className="flex items-center gap-1">
                                          <span className="text-xs text-gray-500">{a.teacherName}</span>
                                          <button onClick={() => setEditingTeacher(a._id)}
                                            title="Edit teacher" className="text-gray-400 hover:text-green-600 text-xs ml-1">✏</button>
                                        </div>
                                      )}

                                      {/* Delete assignment */}
                                      {editingTeacher !== a._id && (
                                        <button onClick={() => handleDeleteAssignment(a)}
                                          className="text-red-400 hover:text-red-600 text-xs mt-1 block">
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-300">--</span>
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
              );
            })}
          </div>
        )}
      </div>

      {/* Conflict Modal */}
      {conflict && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <h3 className="font-bold text-lg mb-2 text-red-600">Conflict Detected</h3>
            <p className="text-sm text-gray-600 mb-4">{conflict.message}</p>
            <p className="text-sm text-gray-500 mb-6">Do you want to overwrite the existing assignment?</p>
            <div className="flex gap-3">
              <button onClick={handleOverwrite} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium">Yes, Overwrite</button>
              <button onClick={() => setConflict(null)} className="flex-1 border py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}