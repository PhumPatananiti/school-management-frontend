import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOTP from "./pages/auth/VerifyOTP";
import ChangePassword from "./pages/auth/ChangePassword";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageTeachers from "./pages/admin/ManageTeachers";
import ManageClasses from "./pages/admin/ManageClasses";
import Reports from "./pages/admin/Reports";

import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import Attendance from "./pages/teacher/Attendance";
import Grades from "./pages/teacher/Grades";
import HomeVisits from './pages/teacher/HomeVisits';
import StudentInformation from './pages/teacher/StudentInformation';
import StudentDetail from './pages/teacher/StudentDetails';

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAttendance from './pages/student/Attendance';
import StudentGrades from './pages/student/Grades';
import Health from './pages/student/Health';
import StudentHomeVisits from './pages/student/HomeVisits';

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// API
import API from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ====== CHECK LOCAL STORAGE WHEN APP LOAD ======
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }

    setCheckingAuth(false);
  }, []);

  // ====== LOGIN ======
  const handleLogin = async (phone, password, role) => {
    try {
      const res = await API.login({ phone, password, role });

      if (res.data.success) {
        const userData = res.data.user;
        const userToken = res.data.token;

        setUser(userData);
        setToken(userToken);

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", userToken);

        return { 
          success: true, 
          isFirstLogin: userData.isFirstLogin, 
          message: res.data.message 
        };
      }

      return { 
        success: false, 
        message: res.data.message || "เข้าสู่ระบบไม่สำเร็จ" 
      };
    } catch (err) {
      console.error('Login error:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" 
      };
    }
  };

  // ====== REGISTER (send otp) ======
  const handleRegister = async (data) => {
    try {
      const res = await API.register(data);   // POST /send-otp
      return res.data;
    } catch (error) {
      return { success: false };
    }
  };

  // ====== VERIFY OTP ======
  const handleVerifyOTP = async (data) => {
    try {
      const res = await API.verifyOTP(data);  // POST /verify-otp
      return res.data;
    } catch (error) {
      return { success: false };
    }
  };

  // ====== CHANGE PASSWORD ======
  const handleChangePassword = async (data) => {
    try {
      const res = await API.changePassword(data, token);
      
      if (res.data.success) {
        // FIX: Update user state to reflect that password has been changed
        const updatedUser = { ...user, isFirstLogin: false };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      
      return res.data;
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "เกิดข้อผิดพลาด" 
      };
    }
  };

  // ====== LOGOUT ======
  const handleLogout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-pink-500 rounded-full animate-spin"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* ---------- AUTH ---------- */}

        <Route
          path="/login"
          element={
            user ? (
              // FIX: Check isFirstLogin when navigating from login
              user.isFirstLogin ? (
                <Navigate to="/change-password" replace />
              ) : (
                <Navigate to={`/${user.role}`} replace />
              )
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <Register onRegister={handleRegister} />}
        />

        <Route
          path="/verify-otp"
          element={user ? <Navigate to="/" replace /> : <VerifyOTP onVerify={handleVerifyOTP} />}
        />

        <Route
          path="/change-password"
          element={
            user ? (
              <ChangePassword 
                onChangePassword={handleChangePassword} 
                user={user}
                force={user.isFirstLogin}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ---------- ADMIN ---------- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} role="admin">
              <AdminDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/students"
          element={
            <ProtectedRoute user={user} role="admin">
              <ManageStudents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute user={user} role="admin">
              <ManageTeachers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/classes"
          element={
            <ProtectedRoute user={user} role="admin">
              <ManageClasses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute user={user} role="admin">
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* ---------- TEACHER ---------- */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute user={user} role="teacher">
              <TeacherDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/attendance"
          element={
            <ProtectedRoute user={user} role="teacher">
              <Attendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/grades"
          element={
            <ProtectedRoute user={user} role="teacher">
              <Grades />
            </ProtectedRoute>
          }
        />

    <Route
      path="/teacher/homevisits"
      element={
        <ProtectedRoute user={user} role="teacher">
          <HomeVisits />
        </ProtectedRoute>
      }
    />

    <Route
      path="/teacher/studentinformation"
      element={
        <ProtectedRoute user={user} role="teacher">
          <StudentInformation user={user} onLogout={handleLogout} />
        </ProtectedRoute>
      }
    />

    <Route
      path="/teacher/studentinformation/:studentId"
      element={
        <ProtectedRoute user={user} role="teacher">
          <StudentDetail user={user} onLogout={handleLogout} />
        </ProtectedRoute>
      }
    />

        {/* ---------- STUDENT ---------- */}
        <Route
          path="/student"
          element={
            <ProtectedRoute user={user} role="student">
              <StudentDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/student/attendance" 
          element={
            <ProtectedRoute user={user} role="student">
              <StudentAttendance />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/student/grades" 
          element={
            <ProtectedRoute user={user} role="student">
                      <StudentGrades />
                    </ProtectedRoute>
                  } 
              />

        <Route 
          path="/student/health" 
          element={
          <ProtectedRoute user={user} role="student">
                    <Health />
                    </ProtectedRoute>
                  } 
                />

    <Route 
      path="/student/homevisits" 
      element={
        <ProtectedRoute user={user} role="student">
          <StudentHomeVisits />
        </ProtectedRoute>
      } 
    />

        {/* ---------- DEFAULT ---------- */}
        <Route 
          path="/" 
          element={
            <Navigate 
              to={
                user 
                  ? user.isFirstLogin 
                    ? "/change-password" 
                    : `/${user.role}`
                  : "/login"
              } 
              replace 
            />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;