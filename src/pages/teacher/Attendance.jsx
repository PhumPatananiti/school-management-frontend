import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Home, ClipboardList, BarChart3, HomeIcon, UserCircle } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

export default function Attendance() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const menuItems = [
    { path: "/teacher", icon: Home, label: "หน้าหลัก" },
    { path: "/teacher/attendance", icon: ClipboardList, label: "เช็คชื่อ" },
    { path: "/teacher/grades", icon: BarChart3, label: "บันทึกคะแนน" },
    { path: "/teacher/homevisits", icon: HomeIcon, label: "เยี่ยมบ้าน" },
    { path: "/teacher/studentinformation", icon: UserCircle, label: "ข้อมูลนักเรียน" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await API.getTeacherRooms();
      setRooms(res.data.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      alert("ไม่สามารถดึงข้อมูลห้องเรียนได้");
    }
  };

  const fetchStudents = async (roomId) => {
    try {
      const res = await API.getRoomStudents(roomId);
      setStudents(res.data.data);
      
      // Initialize attendance data
      const initialData = {};
      res.data.data.forEach(student => {
        initialData[student.id] = 'มาเรียน';
      });
      setAttendanceData(initialData);
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("ไม่สามารถดึงข้อมูลนักเรียนได้");
    }
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    fetchStudents(room.id);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData({
      ...attendanceData,
      [studentId]: status
    });
  };

  const handleSubmit = async () => {
    try {
      const attendance_list = Object.entries(attendanceData).map(([student_id, status]) => ({
        student_id: parseInt(student_id),
        status
      }));

      await API.takeHomeroomAttendance({
        room_id: selectedRoom.id,
        attendance_date: date,
        attendance_list
      });

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      alert(error.response?.data?.message || 'ไม่สามารถบันทึกได้');
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate("/teacher");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="flex">
        <Sidebar items={menuItems} role="teacher" />
        
        <div className="flex-1 p-6">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">เช็คชื่อนักเรียน</h2>

          {/* Date Picker */}
          <div className="p-4 mb-6 bg-white rounded-lg shadow">
            <label className="block mb-2 font-semibold text-gray-700">เลือกวันที่</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Room Selection */}
          <div className="p-4 mb-6 bg-white rounded-lg shadow">
            <label className="block mb-2 font-semibold text-gray-700">เลือกห้องเรียน</label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {rooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => handleRoomSelect(room)}
                  className={`p-3 rounded-lg font-medium transition-all ${
                    selectedRoom?.id === room.id
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {room.name}
                </button>
              ))}
            </div>
          </div>

          {/* Student List */}
          {selectedRoom && (
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="mb-4 text-xl font-bold text-gray-800">
                นักเรียนห้อง {selectedRoom.name}
              </h3>
              
              <div className="space-y-2">
                {students.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
                    <div>
                      <p className="font-semibold text-gray-800">{student.full_name}</p>
                      <p className="text-sm text-gray-600">เลขที่ {student.student_number}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {['มาเรียน', 'มาสาย', 'ลาป่วย', 'ลากิจ', 'ขาดเรียน'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleAttendanceChange(student.id, status)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                            attendanceData[student.id] === status
                              ? status === 'มาเรียน' ? 'bg-green-500 text-white shadow-md'
                              : status === 'มาสาย' ? 'bg-yellow-500 text-white shadow-md'
                              : 'bg-red-500 text-white shadow-md'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-3 mt-6 font-semibold text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                บันทึกการเช็คชื่อ
              </button>
            </div>
          )}

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
              <div className="w-full max-w-md p-8 text-center bg-white shadow-2xl rounded-2xl">
                <div className="inline-block p-4 mb-4 bg-green-100 rounded-full">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-gray-800">สำเร็จ!</h2>
                <p className="mb-6 text-gray-600">บันทึกการเช็คชื่อเรียบร้อยแล้ว</p>
                <button
                  onClick={handleModalClose}
                  className="w-full py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  กลับสู่หน้าหลัก
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}