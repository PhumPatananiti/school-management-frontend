import { useState, useEffect } from "react";
import { Home, Users, BookOpen, BarChart3, Settings } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

export default function AdminDashboard({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { path: "/admin", icon: Home, label: "หน้าหลัก" },
    { path: "/admin/teachers", icon: Users, label: "จัดการครู" },
    { path: "/admin/students", icon: Users, label: "จัดการนักเรียน" },
    { path: "/admin/classes", icon: BookOpen, label: "จัดการห้องเรียน" },
    { path: "/admin/reports", icon: BarChart3, label: "รายงาน" },
  ];

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await API.getStatistics();
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="flex">
        <Sidebar items={menuItems} role="admin" />
        
        <div className="flex-1 p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">แผงควบคุมหลัก</h2>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="จำนวนครู"
                value={stats?.totalTeachers || 0}
                icon={Users}
                color="pink"
              />
              <StatCard
                title="จำนวนนักเรียน"
                value={stats?.totalStudents || 0}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="จำนวนห้องเรียน"
                value={stats?.totalRooms || 0}
                icon={BookOpen}
                color="purple"
              />
              <StatCard
                title="ผู้ใช้งานออนไลน์"
                value={stats?.activeUsers || 0}
                icon={Users}
                color="green"
              />
            </div>
          )}

          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">การใช้งานระบบ</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span>เข้าสู่ระบบครั้งล่าสุด</span>
                <span className="text-gray-600">{new Date().toLocaleString('th-TH')}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span>สถานะระบบ</span>
                <span className="text-green-600 font-semibold">● ออนไลน์</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    pink: 'text-pink-500 bg-pink-50',
    blue: 'text-blue-500 bg-blue-50',
    purple: 'text-purple-500 bg-purple-50',
    green: 'text-green-500 bg-green-50',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      <p className={`text-4xl font-bold ${colorClasses[color].split(' ')[0]}`}>
        {value}
      </p>
    </div>
  );
}