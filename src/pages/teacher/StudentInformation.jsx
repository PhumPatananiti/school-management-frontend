import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search } from "lucide-react";
import TeacherLayout from "../../components/TeacherLayout";
import API from "../../services/api";

export default function StudentInformation({ user, onLogout }) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
      setStudents(res.data.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (studentId) => {
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
    <TeacherLayout user={user} onLogout={onLogout}>
      <h2 className="mb-4 text-2xl font-bold sm:text-3xl sm:mb-6">ข้อมูลนักเรียน</h2>

      {/* Room Selection */}
      <div className="p-4 mb-4 bg-white shadow-lg sm:p-6 sm:mb-6 rounded-xl">
        <h3 className="mb-3 text-lg font-bold sm:text-xl sm:mb-4">เลือกห้องเรียน</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-sm sm:text-base ${
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
        <div className="p-4 bg-white shadow-lg sm:p-6 rounded-xl">
          <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-bold sm:text-xl">รายชื่อนักเรียน</h3>
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 sm:w-5 sm:h-5 left-3 top-1/2" />
              <input
                type="text"
                placeholder="ค้นหานักเรียน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg sm:text-base focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <div className="w-8 h-8 mx-auto mb-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600 sm:text-base">กำลังโหลดข้อมูล...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-8 text-sm text-center text-gray-500 sm:text-base">
              {searchTerm ? "ไม่พบนักเรียนที่ค้นหา" : "ไม่มีนักเรียนในห้องนี้"}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => handleStudentClick(student.id)}
                  className="p-3 transition-all border border-gray-200 rounded-lg cursor-pointer sm:p-4 hover:border-pink-500 hover:shadow-md active:scale-95"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 text-sm text-white bg-pink-500 rounded-full sm:w-12 sm:h-12 sm:text-base">
                      {student.full_name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate sm:text-base">{student.full_name}</p>
                      <p className="text-xs text-gray-600 sm:text-sm">
                        เลขที่ {student.student_number}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedRoom && (
        <div className="p-6 text-center text-gray-500 bg-white shadow-lg sm:p-8 rounded-xl">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300 sm:w-16 sm:h-16" />
          <p className="text-sm sm:text-base">กรุณาเลือกห้องเรียนเพื่อดูรายชื่อนักเรียน</p>
        </div>
      )}
    </TeacherLayout>
  );
}