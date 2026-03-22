import { useState, useEffect } from 'react';
import {
  addDepartment, getDepartments,
  addRoom, getRooms,
  addTimeSlot, getTimeSlots,
  allocateRoom, createInstructor,
  lockDay, getRoomAllocationTimetable,
  getFullTimetable
} from '../api/index';
import { logout } from '../api/index';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('setup');
  const [departments, setDepartments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [msg, setMsg] = useState('');

  // Forms
  const [deptName, setDeptName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allocForm, setAllocForm] = useState({ roomId: '', departmentId: '', timeSlotId: '', day: 'Monday' });
  const [instrForm, setInstrForm] = useState({ name: '', email: '', password: '', departmentId: '' });
  const [lockForm, setLockForm] = useState({ departmentId: '', day: 'Monday', isLocked: true });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [d, r, t, a, f] = await Promise.all([
      getDepartments(), getRooms(), getTimeSlots(),
      getRoomAllocationTimetable(), getFullTimetable()
    ]);
    setDepartments(d.data);
    setRooms(r.data);
    setTimeSlots(t.data);
    setAllocations(a.data);
    setAssignments(f.data);
  };

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    try {
      await addDepartment({ name: deptName });
      setDeptName('');
      fetchAll();
      showMsg('Department added!');
    } catch (err) { showMsg(err.response?.data?.message || 'Error'); }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await addRoom({ roomNumber });
      setRoomNumber('');
      fetchAll();
      showMsg('Room added!');
    } catch (err) { showMsg(err.response?.data?.message || 'Error'); }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      await addTimeSlot({ startTime, endTime });
      setStartTime(''); setEndTime('');
      fetchAll();
      showMsg('Time slot added!');
    } catch (err) { showMsg(err.response?.data?.message || 'Error'); }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      await allocateRoom(allocForm);
      fetchAll();
      showMsg('Room allocated!');
    } catch (err) { showMsg(err.response?.data?.message || 'Error'); }
  };

  const handleCreateInstructor = async (e) => {
    e.preventDefault();
    try {
      await createInstructor(instrForm);
      setInstrForm({ name: '', email: '', password: '', departmentId: '' });
      showMsg('Instructor created!');
    } catch (err) { showMsg(err.response?.data?.message || 'Error'); }
  };

  const handleLock = async (e) => {
    e.preventDefault();
    try {
      await lockDay(lockForm);
      showMsg(`Timetable ${lockForm.isLocked ? 'locked' : 'unlocked'}!`);
    } catch (err) { showMsg(err.response?.data?.message || 'Error'); }
  };

  const tabs = [
    { key: 'setup', label: 'Setup' },
    { key: 'allocate', label: 'Allocate Rooms' },
    { key: 'instructor', label: 'Instructors' },
    { key: 'lock', label: 'Lock Timetable' },
    { key: 'timetable', label: 'Timetable' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button onClick={handleLogout} className="text-sm bg-white text-indigo-700 px-4 py-1.5 rounded-lg font-medium">Logout</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-6 pt-4">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t.key ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Message */}
      {msg && <div className="mx-6 mt-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm">{msg}</div>}

      <div className="p-6">

        {/* SETUP TAB */}
        {tab === 'setup' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Add Department */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-4">Add Department</h2>
              <form onSubmit={handleAddDept} className="flex flex-col gap-3">
                <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Department name" value={deptName} onChange={e => setDeptName(e.target.value)} required />
                <button className="bg-indigo-600 text-white py-2 rounded-lg text-sm">Add</button>
              </form>
              <ul className="mt-4 text-sm text-gray-600 space-y-1">
                {departments.map(d => <li key={d._id} className="bg-gray-50 px-3 py-1 rounded">• {d.name}</li>)}
              </ul>
            </div>

            {/* Add Room */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-4">Add Room</h2>
              <form onSubmit={handleAddRoom} className="flex flex-col gap-3">
                <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Room number" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} required />
                <button className="bg-indigo-600 text-white py-2 rounded-lg text-sm">Add</button>
              </form>
              <ul className="mt-4 text-sm text-gray-600 space-y-1">
                {rooms.map(r => <li key={r._id} className="bg-gray-50 px-3 py-1 rounded">• {r.roomNumber}</li>)}
              </ul>
            </div>

            {/* Add Time Slot */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-4">Add Time Slot</h2>
              <form onSubmit={handleAddSlot} className="flex flex-col gap-3">
                <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Start time e.g. 9:00 AM" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                <input className="border rounded-lg px-3 py-2 text-sm" placeholder="End time e.g. 10:00 AM" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                <button className="bg-indigo-600 text-white py-2 rounded-lg text-sm">Add</button>
              </form>
              <ul className="mt-4 text-sm text-gray-600 space-y-1">
                {timeSlots.map(t => <li key={t._id} className="bg-gray-50 px-3 py-1 rounded">• {t.startTime} - {t.endTime}</li>)}
              </ul>
            </div>
          </div>
        )}

        {/* ALLOCATE TAB */}
        {tab === 'allocate' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-4">Allocate Room to Department</h2>
              <form onSubmit={handleAllocate} className="flex flex-col gap-3">
                <select className="border rounded-lg px-3 py-2 text-sm" value={allocForm.roomId} onChange={e => setAllocForm({...allocForm, roomId: e.target.value})} required>
                  <option value="">Select Room</option>
                  {rooms.map(r => <option key={r._id} value={r._id}>{r.roomNumber}</option>)}
                </select>
                <select className="border rounded-lg px-3 py-2 text-sm" value={allocForm.departmentId} onChange={e => setAllocForm({...allocForm, departmentId: e.target.value})} required>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
                <select className="border rounded-lg px-3 py-2 text-sm" value={allocForm.timeSlotId} onChange={e => setAllocForm({...allocForm, timeSlotId: e.target.value})} required>
                  <option value="">Select Time Slot</option>
                  {timeSlots.map(t => <option key={t._id} value={t._id}>{t.startTime} - {t.endTime}</option>)}
                </select>
                <select className="border rounded-lg px-3 py-2 text-sm" value={allocForm.day} onChange={e => setAllocForm({...allocForm, day: e.target.value})}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
                <button className="bg-indigo-600 text-white py-2 rounded-lg text-sm">Allocate</button>
              </form>
            </div>

            {/* Allocation list */}
            <div className="bg-white p-5 rounded-xl shadow-sm overflow-auto">
              <h2 className="font-semibold text-gray-700 mb-4">Current Allocations</h2>
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50"><th className="p-2 text-left">Room</th><th className="p-2 text-left">Department</th><th className="p-2 text-left">Day</th><th className="p-2 text-left">Time</th></tr></thead>
                <tbody>
                  {allocations.map(a => (
                    <tr key={a._id} className="border-t">
                      <td className="p-2">{a.roomId?.roomNumber}</td>
                      <td className="p-2">{a.departmentId?.name}</td>
                      <td className="p-2">{a.day}</td>
                      <td className="p-2">{a.timeSlotId?.startTime} - {a.timeSlotId?.endTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INSTRUCTOR TAB */}
        {tab === 'instructor' && (
          <div className="max-w-md">
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-4">Create Instructor Account</h2>
              <form onSubmit={handleCreateInstructor} className="flex flex-col gap-3">
                <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Name" value={instrForm.name} onChange={e => setInstrForm({...instrForm, name: e.target.value})} required />
                <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Email" type="email" value={instrForm.email} onChange={e => setInstrForm({...instrForm, email: e.target.value})} required />
                <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Password" value={instrForm.password} onChange={e => setInstrForm({...instrForm, password: e.target.value})} required />
                <select className="border rounded-lg px-3 py-2 text-sm" value={instrForm.departmentId} onChange={e => setInstrForm({...instrForm, departmentId: e.target.value})} required>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
                <button className="bg-indigo-600 text-white py-2 rounded-lg text-sm">Create Instructor</button>
              </form>
            </div>
          </div>
        )}

        {/* LOCK TAB */}
        {tab === 'lock' && (
          <div className="max-w-md">
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-4">Lock / Unlock Timetable</h2>
              <form onSubmit={handleLock} className="flex flex-col gap-3">
                <select className="border rounded-lg px-3 py-2 text-sm" value={lockForm.departmentId} onChange={e => setLockForm({...lockForm, departmentId: e.target.value})} required>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
                <select className="border rounded-lg px-3 py-2 text-sm" value={lockForm.day} onChange={e => setLockForm({...lockForm, day: e.target.value})}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
                <select className="border rounded-lg px-3 py-2 text-sm" value={lockForm.isLocked} onChange={e => setLockForm({...lockForm, isLocked: e.target.value === 'true'})}>
                  <option value="true">Lock</option>
                  <option value="false">Unlock</option>
                </select>
                <button className="bg-indigo-600 text-white py-2 rounded-lg text-sm">Apply</button>
              </form>
            </div>
          </div>
        )}

        {/* TIMETABLE TAB */}
        {tab === 'timetable' && (
          <div className="bg-white p-5 rounded-xl shadow-sm overflow-auto">
            <h2 className="font-semibold text-gray-700 mb-4">Full Timetable</h2>
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50"><th className="p-2 text-left">Room</th><th className="p-2 text-left">Subject</th><th className="p-2 text-left">Teacher</th><th className="p-2 text-left">Day</th><th className="p-2 text-left">Time</th></tr></thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a._id} className="border-t">
                    <td className="p-2">{a.roomId?.roomNumber}</td>
                    <td className="p-2">{a.subjectId?.name}</td>
                    <td className="p-2">{a.teacherName}</td>
                    <td className="p-2">{a.day}</td>
                    <td className="p-2">{a.timeSlotId?.startTime} - {a.timeSlotId?.endTime}</td>
                  </tr>
                ))}
                {assignments.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-400">No assignments yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}