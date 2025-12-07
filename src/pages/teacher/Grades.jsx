import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Home, ClipboardList, BarChart3, ExternalLink, HomeIcon, UserCircle } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

export default function Grades() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [hasSheet, setHasSheet] = useState(false);

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

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setSelectedSubject(null);
    setStudents([]);
    setGoogleSheetUrl('');
    setHasSheet(false);
  };

  const handleSubjectSelect = async (subject) => {
    setSelectedSubject(subject);
    setLoading(true);

    try {
      // Fetch students for the selected room
      const studentsRes = await API.getRoomStudents(selectedRoom.id);
      setStudents(studentsRes.data.data);
      
      // Check if Google Sheet exists for this room+subject
      await checkGoogleSheet(selectedRoom.id, subject.id);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkGoogleSheet = async (roomId, subjectId) => {
    try {
      const res = await API.getGradeSheet(roomId, subjectId);
      if (res.data.success && res.data.sheet_url) {
        setGoogleSheetUrl(res.data.sheet_url);
        setHasSheet(true);
      } else {
        setGoogleSheetUrl('');
        setHasSheet(false);
      }
    } catch (error) {
      console.log("No Google Sheet found");
      setGoogleSheetUrl('');
      setHasSheet(false);
    }
  };

  const handleCreateOrUpdateSheet = async () => {
    if (!selectedRoom || !selectedSubject) {
      alert("กรุณาเลือกห้องและวิชา");
      return;
    }

    setLoading(true);

    try {
      console.log("Creating sheet for:", selectedRoom.id, selectedSubject.id);
      const res = await API.createGradeSheet({
        room_id: selectedRoom.id,
        subject_id: selectedSubject.id
      });

      console.log("Create sheet response:", res.data);

      if (res.data.success) {
        setGoogleSheetUrl(res.data.sheet_url);
        setHasSheet(true);
        alert("สร้าง Google Sheet สำเร็จ!");
        // Open in new tab
        window.open(res.data.sheet_url, '_blank');
      }
    } catch (error) {
      console.error("Error creating sheet:", error);
      alert(error.response?.data?.message || "ไม่สามารถสร้าง Google Sheet ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleImportFromSheet = async () => {
    if (!hasSheet) {
      alert("ไม่พบ Google Sheet สำหรับห้องและวิชานี้");
      return;
    }

    if (!window.confirm("การนำเข้าจะอัปเดตคะแนนในระบบ ต้องการดำเนินการต่อหรือไม่?")) {
      return;
    }

    setLoading(true);

    try {
      const res = await API.importFromSheet({
        room_id: selectedRoom.id,
        subject_id: selectedSubject.id
      });

      if (res.data.success) {
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error importing from sheet:", error);
      alert(error.response?.data?.message || "ไม่สามารถนำเข้าจาก Google Sheet ได้");
    } finally {
      setLoading(false);
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
          <h2 className="mb-6 text-2xl font-bold text-gray-800">บันทึกคะแนนนักเรียน</h2>

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

          {/* Subject Selection */}
          {selectedRoom && (
            <div className="p-4 mb-6 bg-white rounded-lg shadow">
              <label className="block mb-2 font-semibold text-gray-700">เลือกวิชา</label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {subjects.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectSelect(subject)}
                    className={`p-3 rounded-lg font-medium transition-all ${
                      selectedSubject?.id === subject.id
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {subject.subject_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Google Sheets Section */}
          {selectedRoom && selectedSubject && !loading && (
            <div className="p-6 mb-6 border-2 border-green-200 rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                    <h3 className="text-xl font-bold text-gray-800">Google Sheets</h3>
                    {hasSheet && (
                      <span className="px-2 py-1 text-xs text-white bg-green-500 rounded-full">
                        มีชีทแล้ว
                      </span>
                    )}
                  </div>
                  <p className="mb-2 text-sm text-gray-600">
                    ห้อง: <strong>{selectedRoom.name}</strong> | วิชา: <strong>{selectedSubject.subject_name}</strong>
                  </p>
                  <p className="mb-4 text-sm text-gray-600">
                    {hasSheet 
                      ? "มี Google Sheet สำหรับห้องและวิชานี้แล้ว คุณสามารถเปิดแก้ไขและนำเข้าข้อมูลกลับมาได้"
                      : "สร้าง Google Sheet เพื่อให้ครูสามารถแก้ไขคะแนนได้ง่ายขึ้น"
                    }
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {!hasSheet ? (
                      <button
                        onClick={handleCreateOrUpdateSheet}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-white transition-all bg-green-500 rounded-lg shadow-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <BarChart3 className="w-4 h-4" />
                        สร้าง Google Sheet
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => window.open(googleSheetUrl, '_blank')}
                          className="flex items-center gap-2 px-4 py-2 text-white transition-all bg-blue-500 rounded-lg shadow-md hover:bg-blue-600"
                        >
                          <ExternalLink className="w-4 h-4" />
                          เปิด Google Sheet
                        </button>

                        <button
                          onClick={handleCreateOrUpdateSheet}
                          disabled={loading}
                          className="flex items-center gap-2 px-4 py-2 text-white transition-all bg-purple-500 rounded-lg shadow-md hover:bg-purple-600 disabled:opacity-50"
                        >
                          <BarChart3 className="w-4 h-4" />
                          อัปเดตรายชื่อนักเรียน
                        </button>

                        <button
                          onClick={handleImportFromSheet}
                          disabled={loading}
                          className="flex items-center gap-2 px-4 py-2 text-white transition-all bg-pink-500 rounded-lg shadow-md hover:bg-pink-600 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          นำเข้าคะแนนจาก Sheet
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 mt-4 bg-white border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>📝 วิธีใช้:</strong><br/>
                  {!hasSheet ? (
                    <>
                      1. กด "สร้าง Google Sheet" เพื่อสร้างชีทใหม่<br/>
                      2. ระบบจะนำข้อมูลนักเรียนและคะแนนปัจจุบันไปใส่ในชีท<br/>
                      3. แก้ไขคะแนนใน Google Sheets<br/>
                      4. กลับมากด "นำเข้าคะแนนจาก Sheet" เพื่ออัปเดตข้อมูลในระบบ
                    </>
                  ) : (
                    <>
                      1. กด "เปิด Google Sheet" เพื่อแก้ไขคะแนน<br/>
                      2. กด "อัปเดตรายชื่อนักเรียน" หากมีนักเรียนใหม่<br/>
                      3. กด "นำเข้าคะแนนจาก Sheet" เมื่อแก้ไขเสร็จเพื่อซิงค์กลับมาในระบบ
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Student List */}
          {selectedRoom && selectedSubject && !loading && students.length > 0 && (
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="mb-4 text-xl font-bold text-gray-800">
                รายชื่อนักเรียนห้อง {selectedRoom.name} - {selectedSubject.subject_name}
              </h3>
              <p className="mb-4 text-gray-600">
                จำนวนนักเรียนทั้งหมด: <strong>{students.length}</strong> คน
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-white bg-gradient-to-r from-pink-500 to-purple-500">
                    <tr>
                      <th className="px-4 py-3 text-center rounded-tl-lg">เลขที่</th>
                      <th className="px-4 py-3 text-left">รหัสนักเรียน</th>
                      <th className="px-4 py-3 text-left">ชื่อ-นามสกุล</th>
                      <th className="px-4 py-3 text-center rounded-tr-lg">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student, index) => (
                      <tr key={student.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <td className="px-4 py-3 font-medium text-center text-gray-700">{student.student_number || index + 1}</td>
                        <td className="px-4 py-3 text-gray-900">{student.student_id}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{student.full_name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
                            พร้อมบันทึก
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Loading State */}
          {(!selectedRoom || !selectedSubject) && (
            <div className="p-12 text-center bg-white rounded-lg shadow">
              <BarChart3 size={64} className="mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2 text-xl font-semibold text-gray-700">เริ่มต้นบันทึกคะแนน</h3>
              <p className="text-gray-500">
                กรุณาเลือกวิชาและห้องเรียนที่ต้องการบันทึกคะแนน
              </p>
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
                <p className="mb-6 text-gray-600">บันทึกคะแนนเรียบร้อยแล้ว</p>
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