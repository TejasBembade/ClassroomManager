import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true
});

// Auth
export const login = (data) => API.post('/auth/login', data);
export const logout = () => API.post('/auth/logout');
export const getMe = () => API.get('/auth/me');

// Admin
export const addDepartment = (data) => API.post('/admin/departments', data);
export const getDepartments = () => API.get('/admin/departments');
export const addRoom = (data) => API.post('/admin/rooms', data);
export const getRooms = () => API.get('/admin/rooms');
export const addTimeSlot = (data) => API.post('/admin/timeslots', data);
export const getTimeSlots = () => API.get('/admin/timeslots');
export const getTimeSlotsPublic = () => API.get('/instructor/timeslots');
export const allocateRoom = (data) => API.post('/admin/room-allocation', data);
export const createInstructor = (data) => API.post('/admin/create-instructor', data);
export const lockDay = (data) => API.post('/admin/lock-day', data);
export const getFullTimetable = () => API.get('/admin/full-timetable');
export const getRoomAllocationTimetable = () => API.get('/admin/room-allocation-timetable');

// Instructor
export const addSubject = (data) => API.post('/instructor/subjects', data);
export const getSubjects = () => API.get('/instructor/subjects');
export const getAvailableRooms = (day, timeSlotId) => API.get(`/instructor/available-rooms?day=${day}&timeSlotId=${timeSlotId}`);
export const assignClass = (data) => API.post('/instructor/assign', data);
export const getTimetable = () => API.get('/instructor/timetable');