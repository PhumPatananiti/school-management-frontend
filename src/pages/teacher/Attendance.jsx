import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Home, ClipboardList, BarChart3, HomeIcon, UserCircle } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

export default function Attendance() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [attendanceType, setAttendanceType] = useState('homeroom');
  const [periodNumber, setPeriodNumber] = useState(1);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

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
    fetchSubjects();
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

  const fetchSubjects = async () => {
    try {
      const res = await API.getTeacherSubjects();
      setSubjects(res.data.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      alert("ไม่สามารถดึงข้อมูลวิชาได้");
    }
  };

  const fetchStudents = async (roomId) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceTypeChange = (type) => {
    setAttendanceType(type);
    setSelectedRoom(null);
    setSelectedSubject(null);
    setStudents([]);
    setAttendanceData({});
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    if (attendanceType === 'subject') {
      setSelectedSubject(null);
      setStudents([]);
    } else {
      fetchStudents(room.id);
    }
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    if (selectedRoom) {
      fetchStudents(selectedRoom.id);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData({
      ...attendanceData,
      [studentId]: status
    });
  };

  const handleSubmit = async () => {
    if (!selectedRoom) {
      alert("กรุณาเลือกห้องเรียน");
      return;
    }

    if (attendanceType === 'subject' && !selectedSubject) {
      alert("กรุณาเลือกวิชา");
      return;
    }

    try {
      setLoading(true);
      const attendance_list = Object.entries(attendanceData).map(([student_id, status]) => ({
        student_id: parseInt(student_id),
        status
      }));

      if (attendanceType === 'homeroom') {
        await API.takeHomeroomAttendance({
          room_id: selectedRoom.id,
          attendance_date: date,
          attendance_list
        });
      } else {
        await API.takeSubjectAttendance({
          room_id: selectedRoom.id,
          subject_id: selectedSubject.id,
          attendance_date: date,
          period_number: periodNumber,
          attendance_list
        });
      }

      setShowSuccessModal(true);
    } catch (error) {
      alert(error.response?.data?.message || 'ไม่สามารถบันทึกได้');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate("/teacher");
  };

  const canSubmit = () => {
    if (!selectedRoom || students.length === 0) return false;
    if (attendanceType === 'subject' && !selectedSubject) return false;
    return true;
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

          {/* Attendance Type Selection */}
          <div className="p-4 mb-6 bg-white rounded-lg shadow">
            <label className="block mb-2 font-semibold text-gray-700">ประเภทการเช็คชื่อ</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAttendanceTypeChange('homeroom')}
                className={`p-4 rounded-lg font-medium transition-all ${
                  attendanceType === 'homeroom'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Home className="w-6 h-6" />
                  <span>เช็คชื่อประจำชั้น (Homeroom)</span>
                </div>
              </button>
              <button
                onClick={() => handleAttendanceTypeChange('subject')}
                className={`p-4 rounded-lg font-medium transition-all ${
                  attendanceType === 'subject'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <ClipboardList className="w-6 h-6" />
                  <span>เช็คชื่อรายวิชา (Subject)</span>
                </div>
              </button>
            </div>
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

          {/* Subject Selection - Only show for subject attendance */}
          {attendanceType === 'subject' && selectedRoom && (
            <div className="p-4 mb-6 bg-white rounded-lg shadow">
              <label className="block mb-2 font-semibold text-gray-700">เลือกวิชา</label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {subjects.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectSelect(subject)}
                    className={`p-3 rounded-lg font-medium transition-all ${
                      selectedSubject?.id === subject.id
                        ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {subject.subject_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Period Number - Only show for subject attendance */}
          {attendanceType === 'subject' && selectedSubject && (
            <div className="p-4 mb-6 bg-white rounded-lg shadow">
              <label className="block mb-2 font-semibold text-gray-700">คาบเรียน</label>
              <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(period => (
                  <button
                    key={period}
                    onClick={() => setPeriodNumber(period)}
                    className={`p-3 rounded-lg font-medium transition-all ${
                      periodNumber === period
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    คาบที่ {period}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Student List */}
          {selectedRoom && students.length > 0 && !loading && (
            <div className="p-4 bg-white rounded-lg shadow">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  นักเรียนห้อง {selectedRoom.name}
                  {attendanceType === 'subject' && selectedSubject && (
                    <span className="ml-2 text-base font-normal text-gray-600">
                      - {selectedSubject.subject_name} (คาบที่ {periodNumber})
                    </span>
                  )}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  วันที่: {new Date(date).toLocaleDateString('th-TH', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
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
                disabled={!canSubmit() || loading}
                className={`w-full py-3 mt-6 font-semibold text-white transition-all rounded-lg shadow-lg ${
                  canSubmit() && !loading
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึกการเช็คชื่อ'}
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="p-12 text-center bg-white rounded-lg shadow">
              <div className="inline-block w-12 h-12 border-4 border-pink-500 rounded-full animate-spin border-t-transparent"></div>
              <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
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
                <p className="mb-6 text-gray-600">
                  บันทึกการเช็คชื่อเรียบร้อยแล้ว
                  {attendanceType === 'subject' && selectedSubject && (
                    <span className="block mt-2 text-sm">
                      ({selectedSubject.subject_name} - คาบที่ {periodNumber})
                    </span>
                  )}
                </p>
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