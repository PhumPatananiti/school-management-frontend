import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // ยังไม่ login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // มี role แต่ไม่ตรง
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // ผ่านทั้งหมด
  return children;
};

export default ProtectedRoute;
