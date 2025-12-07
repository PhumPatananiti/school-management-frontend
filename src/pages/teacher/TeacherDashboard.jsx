import { useState, useEffect } from "react";
import { Home, Users, CheckSquare, BookOpen, HomeIcon, UserCircle } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

export default function TeacherDashboard({ user, onLogout }) {
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const menuItems = [
    { path: "/teacher", icon: Home, label: "หน้าหลัก" },
    { path: "/teacher/attendance", icon: CheckSquare, label: "เช็คชื่อ" },
    { path: "/teacher/grades", icon: BookOpen, label: "จัดการคะแนน" },
    { path: "/teacher/homevisits", icon: HomeIcon, label: "เยี่ยมบ้าน" },
    { path: "/teacher/studentinformation", icon: UserCircle, label: "ข้อมูลนักเรียน" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [roomsRes, subjectsRes] = await Promise.all([
        API.getTeacherRooms(),
        API.getTeacherSubjects()
      ]);
      setRooms(roomsRes.data.data);
      setSubjects(subjectsRes.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="flex">
        <Sidebar items={menuItems} role="teacher" />
        
        <div className="flex-1 p-6">
          <h2 className="mb-6 text-3xl font-bold">ยินดีต้อนรับ {user.full_name}</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Rooms Card */}
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h3 className="mb-4 text-xl font-bold">ห้องที่สอน</h3>
              <div className="space-y-2">
                {rooms.map(room => (
                  <div key={room.id} className={`p-3 rounded-lg ${
                    room.is_homeroom ? 'bg-pink-100' : 'bg-gray-100'
                  }`}>
                    <p className="font-semibold">{room.name}</p>
                    {room.is_homeroom && (
                      <p className="text-sm text-pink-600">ห้องที่ปรึกษา</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Subjects Card */}
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h3 className="mb-4 text-xl font-bold">วิชาที่สอน</h3>
              <div className="space-y-2">
                {subjects.map(subject => (
                  <div key={subject.id} className="p-3 bg-gray-100 rounded-lg">
                    <p className="font-semibold">{subject.subject_name}</p>
                    <p className="text-sm text-gray-600">{subject.subject_code}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}