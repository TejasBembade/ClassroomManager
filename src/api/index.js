import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true
});

// Auth
export const login = (data) => API.post('/auth/login', data);
export const logout = () => API.post('/auth/logout');
export const getMe = () => API.get('/auth/me');

// Admin — Departments
export const addDepartment = (data) => API.post('/admin/departments', data);
export const getDepartments = () => API.get('/admin/departments');
export const deleteDepartment = (id) => API.delete(`/admin/departments/${id}`);

// Admin — Rooms
export const addRoom = (data) => API.post('/admin/rooms', data);
export const getRooms = () => API.get('/admin/rooms');
export const deleteRoom = (id) => API.delete(`/admin/rooms/${id}`);

// Admin — Time Slots
export const addTimeSlot = (data) => API.post('/admin/timeslots', data);
export const getTimeSlots = () => API.get('/admin/timeslots');
export const deleteTimeSlot = (id) => API.delete(`/admin/timeslots/${id}`);

// Admin — Room Allocations
export const allocateRoom = (data) => API.post('/admin/room-allocation', data);
export const deleteRoomAllocation = (id) => API.delete(`/admin/room-allocation/${id}`);
export const getRoomAllocationTimetable = () => API.get('/admin/room-allocation-timetable');

// Admin — Instructors
export const createInstructor = (data) => API.post('/admin/create-instructor', data);
export const getInstructors = () => API.get('/admin/instructors');
export const deleteInstructor = (id) => API.delete(`/admin/instructors/${id}`);

// Admin — Lock & Timetable
export const lockDay = (data) => API.post('/admin/lock-day', data);
export const getFullTimetable = () => API.get('/admin/full-timetable');

// Instructor — Subjects
export const addSubject = (data) => API.post('/instructor/subjects', data);
export const getSubjects = () => API.get('/instructor/subjects');
export const deleteSubject = (id) => API.delete(`/instructor/subjects/${id}`);

// Instructor — Rooms & Slots
export const getTimeSlotsPublic = () => API.get('/instructor/timeslots');
export const getAvailableRooms = (day, timeSlotId) => API.get(`/instructor/available-rooms?day=${day}&timeSlotId=${timeSlotId}`);

// Instructor — Assignments
export const assignClass = (data) => API.post('/instructor/assign', data);
export const getTimetable = () => API.get('/instructor/timetable');
export const deleteAssignment = (id) => API.delete(`/instructor/assignments/${id}`);
export const updateTeacher = (id, teacherName) => API.patch(`/instructor/assignments/${id}/teacher`, { teacherName });