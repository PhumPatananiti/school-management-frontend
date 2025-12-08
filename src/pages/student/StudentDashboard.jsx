import { useState, useEffect } from "react";
import StudentLayout from "../../components/StudentLayout";
import API from "../../services/api";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Fetching student data...");
      
      // Fetch profile first
      const profileRes = await API.getStudentProfile();
      console.log("Profile response:", profileRes.data);
      setProfile(profileRes.data.data || profileRes.data);
      
      // Fetch attendance summary
      try {
        const attendanceRes = await API.getAttendanceSummary();
        console.log("Attendance response:", attendanceRes.data);
        setAttendanceSummary(attendanceRes.data.data || attendanceRes.data);
      } catch (error) {
        console.error("Attendance error:", error);
        setAttendanceSummary({
          present: 0,
          late: 0,
          sick_leave: 0,
          personal_leave: 0,
          absent: 0,
          total_days: 0
        });
      }
      
      // Fetch grades - use current academic year
      try {
        const currentYear = new Date().getFullYear() + 543; // Convert to Buddhist year
        const gradesRes = await API.getStudentGrades({ 
          academic_year: currentYear.toString(),
          semester: '1'
        });
        console.log("Grades response:", gradesRes.data);
        setGrades(gradesRes.data.data || gradesRes.data || []);
      } catch (error) {
        console.error("Grades error:", error);
        setGrades([]);
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
      console.error("Error details:", error.response?.data);
      alert("เกิดข้อผิดพลาดในการดึงข้อมูล: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendancePercentage = () => {
    if (!attendanceSummary || !attendanceSummary.total_days || attendanceSummary.total_days === 0) {
      return 0;
    }
    const total = parseInt(attendanceSummary.total_days) || 0;
    const present = parseInt(attendanceSummary.present) || 0;
    const late = parseInt(attendanceSummary.late) || 0;
    
    // Count both "มาเรียน" and "มาสาย" as attendance (not absent)
    const attended = present + late;
    const percentage = (attended / total) * 100;
    return percentage.toFixed(1);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-b-2 border-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <StudentLayout user={profile || user} onLogout={handleLogout}>
      <h2 className="mb-6 text-3xl font-bold">
        ยินดีต้อนรับ {profile?.full_name || user?.full_name || "นักเรียน"}
      </h2>

      <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
        <div className="p-6 bg-white shadow-lg rounded-xl">
          <h3 className="mb-2 font-semibold text-gray-600">การเข้าเรียน</h3>
          <p className="text-4xl font-bold text-green-500">
            {calculateAttendancePercentage()}%
          </p>
        </div>

        <div className="p-6 bg-white shadow-lg rounded-xl">
          <h3 className="mb-2 font-semibold text-gray-600">คะแนนความประพฤติ</h3>
          <p className="text-4xl font-bold text-blue-500">
            {profile?.behavior_score || 100}
          </p>
          <p className="mt-1 text-sm text-gray-500">เต็ม 100 คะแนน</p>
        </div>

        <div className="p-6 bg-white shadow-lg rounded-xl">
          <h3 className="mb-2 font-semibold text-gray-600">จำนวนวิชา</h3>
          <p className="text-4xl font-bold text-purple-500">
            {Array.isArray(grades) ? grades.length : 0}
          </p>
          <p className="mt-1 text-sm text-gray-500">วิชา</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-6 bg-white shadow-lg rounded-xl">
          <h3 className="mb-4 text-xl font-bold">ข้อมูลส่วนตัว</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">รหัสนักเรียน</p>
              <p className="font-semibold">{profile?.student_id || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ห้อง</p>
              <p className="font-semibold">{profile?.room_name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ครูที่ปรึกษา</p>
              <p className="font-semibold">{profile?.homeroom_teacher_name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">เบอร์โทร</p>
              <p className="font-semibold">{profile?.phone || "-"}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white shadow-lg rounded-xl">
          <h3 className="mb-4 text-xl font-bold">ผลการเรียนล่าสุด</h3>
          {!grades || grades.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              ยังไม่มีผลการเรียน
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-64">
              {grades.slice(0, 5).map((grade, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium">{grade.subject_name || grade.subject_code}</p>
                    <p className="text-xs text-gray-500">
                      {grade.academic_year}/{grade.semester}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-500">{grade.grade || "-"}</p>
                    <p className="text-xs text-gray-500">{grade.gpa ? `${grade.gpa} GPA` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}