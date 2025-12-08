import { useState, useEffect } from "react";
import { Users, BookOpen } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import API from "../../services/api";

export default function AdminDashboard({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <AdminLayout user={user} onLogout={onLogout}>
      <h2 className="mb-6 text-3xl font-bold text-gray-800">แผงควบคุมหลัก</h2>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-b-2 border-pink-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="p-6 mt-8 bg-white shadow-lg rounded-xl">
        <h3 className="mb-4 text-xl font-bold">การใช้งานระบบ</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
            <span>เข้าสู่ระบบครั้งล่าสุด</span>
            <span className="text-gray-600">{new Date().toLocaleString('th-TH')}</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
            <span>สถานะระบบ</span>
            <span className="font-semibold text-green-600">● ออนไลน์</span>
          </div>
        </div>
      </div>
    </AdminLayout>
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
    <div className="p-6 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
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