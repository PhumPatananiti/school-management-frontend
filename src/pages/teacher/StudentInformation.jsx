import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Users, CheckSquare, BookOpen, HomeIcon, UserCircle, Search } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

export default function StudentInformation({ user, onLogout }) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const menuItems = [
    { path: "/teacher", icon: Home, label: "หน้าหลัก" },
    { path: "/teacher/attendance", icon: CheckSquare, label: "เช็คชื่อ" },
    { path: "/teacher/grades", icon: BookOpen, label: "จัดการคะแนน" },
    { path: "/teacher/homevisits", icon: HomeIcon, label: "เยี่ยมบ้าน" },
    { path: "/teacher/studentinformation", icon: UserCircle, label: "ข้อมูลนักเรียน" },
  ];

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchStudents(selectedRoom);
    }
  }, [selectedRoom]);

  const fetchRooms = async () => {
    try {
      const res = await API.getTeacherRooms();
      setRooms(res.data.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchStudents = async (roomId) => {
    try {
      setLoading(true);
      const res = await API.getRoomStudents(roomId);
      console.log("Fetched students:", res.data.data);
      console.log("First student structure:", res.data.data?.[0]);
      setStudents(res.data.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (studentId) => {
    console.log("handleStudentClick called with:", studentId);
    if (!studentId) {
      console.error("Student ID is undefined!");
      return;
    }
    navigate(`/teacher/studentinformation/${studentId}`);
  };

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_number?.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="flex">
        <Sidebar items={menuItems} role="teacher" />
        
        <div className="flex-1 p-6">
          <h2 className="mb-6 text-3xl font-bold">ข้อมูลนักเรียน</h2>

          {/* Room Selection */}
          <div className="p-6 mb-6 bg-white shadow-lg rounded-xl">
            <h3 className="mb-4 text-xl font-bold">เลือกห้องเรียน</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedRoom === room.id
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 bg-white hover:border-pink-300"
                  }`}
                >
                  <p className="font-semibold">{room.name}</p>
                  {room.is_homeroom && (
                    <p className="mt-1 text-xs text-pink-600">ห้องที่ปรึกษา</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Students List */}
          {selectedRoom && (
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">รายชื่อนักเรียน</h3>
                <div className="relative">
                  <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหานักเรียน..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              {loading ? (
                <div className="py-8 text-center">
                  <div className="w-8 h-8 mx-auto mb-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
                  <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  {searchTerm ? "ไม่พบนักเรียนที่ค้นหา" : "ไม่มีนักเรียนในห้องนี้"}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredStudents.map((student) => {
                    // Use id field (the database primary key)
                    const studentDbId = student.id;
                    return (
                      <div
                        key={student.id}
                        onClick={() => {
                          console.log("Clicking student:", student);
                          console.log("Student DB ID (id):", student.id);
                          console.log("Student ID (student_id):", student.student_id);
                          handleStudentClick(studentDbId);
                        }}
                        className="p-4 transition-all border border-gray-200 rounded-lg cursor-pointer hover:border-pink-500 hover:shadow-md"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 text-white bg-pink-500 rounded-full">
                            {student.full_name?.charAt(0) || "?"}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{student.full_name}</p>
                            <p className="text-sm text-gray-600">
                              เลขที่ {student.student_number}
                            </p>
                            <p className="text-xs text-gray-400">DB ID: {student.id}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {!selectedRoom && (
            <div className="p-8 text-center text-gray-500 bg-white shadow-lg rounded-xl">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>กรุณาเลือกห้องเรียนเพื่อดูรายชื่อนักเรียน</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}