import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Methods
const API = {
  // Auth
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/send-otp', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  getMe: () => api.get('/auth/me'),

  // Admin - Teachers
  getTeachers: (params) => api.get('/admin/teachers', { params }),
  getTeacher: (id) => api.get(`/admin/teachers/${id}`),
  createTeacher: (data) => api.post('/admin/teachers', data),
  updateTeacher: (id, data) => api.put(`/admin/teachers/${id}`, data),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),
  assignHomeroom: (id, data) => api.put(`/admin/teachers/${id}/homeroom`, data),

  // Admin - Students
  getStudents: (params) => api.get('/admin/students', { params }),
  getStudent: (id) => api.get(`/admin/students/${id}`),
  createStudent: (data) => api.post('/admin/students', data),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),

  // Admin - Parents
  getParents: () => api.get('/admin/parents'),
  createParent: (data) => api.post('/admin/parents', data),

  // Admin - Rooms/Classes
  getRooms: () => api.get('/admin/rooms'),
  getClasses: () => api.get('/admin/rooms'),
  createRoom: (data) => api.post('/admin/rooms', data),
  createClass: (data) => api.post('/admin/rooms', data),
  updateClass: (id, data) => api.put(`/admin/rooms/${id}`, data),
  deleteClass: (id) => api.delete(`/admin/rooms/${id}`),
  removeHomeroom: (roomId) => api.delete(`/admin/rooms/${roomId}/homeroom`),

  // Admin - Statistics
  getStatistics: () => api.get('/admin/statistics'),

  // Teacher - Profile
  getTeacherProfile: () => api.get('/teacher/profile'),
  updateTeacherProfile: (data) => api.put('/teacher/profile', data),

  // Teacher - Subjects
  getTeacherSubjects: () => api.get('/teacher/subjects'),
  addTeacherSubject: (data) => api.post('/teacher/subjects', data),
  removeTeacherSubject: (id) => api.delete(`/teacher/subjects/${id}`),
  getAvailableSubjects: () => api.get('/teacher/subjects/available'),

  // Teacher - Rooms
  getTeacherRooms: () => api.get('/teacher/rooms'),
  addTeacherRoom: (data) => api.post('/teacher/rooms', data),
  removeTeacherRoom: (id) => api.delete(`/teacher/rooms/${id}`),
  getAvailableRooms: (params) => api.get('/teacher/rooms/available', { params }),

  // Teacher - Students
  getRoomStudents: (roomId) => api.get(`/teacher/rooms/${roomId}/students`),
  getStudentDetails: (studentId) => api.get(`/teacher/students/${studentId}`),

  // Teacher - Attendance
  takeHomeroomAttendance: (data) => api.post('/teacher/attendance/homeroom', data),
  takeSubjectAttendance: (data) => api.post('/teacher/attendance/subject', data),
  getAttendanceHistory: (params) => api.get('/teacher/attendance/history', { params }),

  // Teacher - Grades (Custom Entry)
  getTeacherGrades: (roomId, subjectId) => api.get(`/teacher/grades/${roomId}/${subjectId}`),
  saveGradesBatch: (data) => api.post('/teacher/grades/batch', data),
  getGradesSummary: (roomId, subjectId) => api.get(`/teacher/grades/summary/${roomId}/${subjectId}`),
  deleteGrade: (studentId, subjectId) => api.delete(`/teacher/grades/${studentId}/${subjectId}`),
  
  // Teacher - Google Sheets Integration
  createGradeSheet: (data) => api.post('/teacher/create-grade-sheet', data),
  getGradeSheet: (roomId, subjectId) => api.get(`/teacher/grade-sheet/${roomId}/${subjectId}`),
  importFromSheet: (data) => api.post('/teacher/import-from-sheet', data),

  // Teacher - Home Visits
  createHomeVisit: (data) => api.post('/teacher/home-visits', data),
  getStudentHomeVisits: (studentId) => api.get(`/teacher/home-visits/${studentId}`),

  // Teacher - Student Information
  getStudentCompletedDetails: (studentId) => api.get(`/teacher/students/${studentId}/complete`),

  // Student - Profile
  getStudentProfile: () => api.get('/student/profile'),

  // Student - Attendance
  getAttendanceSummary: (params) => api.get('/student/attendance/summary', { params }),
  getAttendanceDetail: (params) => api.get('/student/attendance/detail', { params }),

  // Student - Grades
  getStudentGrades: (params) => api.get('/student/grades', { params }),
  getGPA: (params) => api.get('/student/grades/gpa', { params }),

  // Student - Behavior
  getBehavior: () => api.get('/student/behavior'),

  // Student - Health
  getHealth: () => api.get('/student/health'),
  updateHealth: (data) => api.put('/student/health', data),

  // Student - Home Visits
  getHomeVisits: () => api.get('/student/home-visits'),

  // Student - Classmates
  getClassmates: () => api.get('/student/classmates'),
};

export default API;