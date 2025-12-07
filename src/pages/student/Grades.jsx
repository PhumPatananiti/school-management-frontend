import { useState, useEffect } from "react";
import { Home, ClipboardCheck, BarChart3, Heart, TrendingUp, HomeIcon } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

export default function StudentGrades() {
  const [grades, setGrades] = useState([]);
  const [gpaData, setGpaData] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  const menuItems = [
    { path: "/student", icon: Home, label: "หน้าหลัก" },
    { path: "/student/attendance", icon: ClipboardCheck, label: "เช็คชื่อ" },
    { path: "/student/grades", icon: BarChart3, label: "ผลการเรียน" },
    { path: "/student/health", icon: Heart, label: "ข้อมูลสุขภาพ" },
    { path: "/student/homevisits", icon: HomeIcon, label: "การเยี่ยมบ้าน" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchGrades();
    fetchGPA();
  }, []);

  const fetchGrades = async () => {
    try {
      const res = await API.getStudentGrades();
      if (res.data.success) {
        setGrades(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGPA = async () => {
    try {
      const res = await API.getGPA();
      if (res.data.success) {
        setGpaData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching GPA:", error);
    }
  };

  const getGradeColor = (grade) => {
    if (grade === 'A') return 'text-green-600 bg-green-100';
    if (grade === 'B') return 'text-blue-600 bg-blue-100';
    if (grade === 'C') return 'text-yellow-600 bg-yellow-100';
    if (grade === 'D') return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="flex">
        <Sidebar items={menuItems} role="student" />
        
        <div className="flex-1 p-6">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">ผลการเรียน</h2>

          {/* GPA Summary */}
          {gpaData && (
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
              <div className="p-6 text-white rounded-lg shadow-lg bg-gradient-to-br from-pink-500 to-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">เกรดเฉลี่ย (GPA)</p>
                    <p className="mt-2 text-4xl font-bold">{gpaData.gpa}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 opacity-80" />
                </div>
              </div>

              <div className="p-6 bg-white rounded-lg shadow">
                <p className="text-sm text-gray-600">วิชาทั้งหมด</p>
                <p className="mt-2 text-3xl font-bold text-gray-800">{gpaData.total_subjects}</p>
              </div>

              <div className="p-6 bg-white rounded-lg shadow">
                <p className="text-sm text-gray-600">คะแนนเฉลี่ย</p>
                <p className="mt-2 text-3xl font-bold text-blue-600">{gpaData.average_score}</p>
              </div>

              <div className="p-6 bg-white rounded-lg shadow">
                <p className="text-sm text-gray-600">การกระจายเกรด</p>
                <div className="flex gap-1 mt-2">
                  {gpaData.grade_distribution.A > 0 && (
                    <span className="px-2 py-1 text-xs font-bold text-green-600 bg-green-100 rounded">
                      A: {gpaData.grade_distribution.A}
                    </span>
                  )}
                  {gpaData.grade_distribution.B > 0 && (
                    <span className="px-2 py-1 text-xs font-bold text-blue-600 bg-blue-100 rounded">
                      B: {gpaData.grade_distribution.B}
                    </span>
                  )}
                  {gpaData.grade_distribution.C > 0 && (
                    <span className="px-2 py-1 text-xs font-bold text-yellow-600 bg-yellow-100 rounded">
                      C: {gpaData.grade_distribution.C}
                    </span>
                  )}
                  {gpaData.grade_distribution.D > 0 && (
                    <span className="px-2 py-1 text-xs font-bold text-orange-600 bg-orange-100 rounded">
                      D: {gpaData.grade_distribution.D}
                    </span>
                  )}
                  {gpaData.grade_distribution.F > 0 && (
                    <span className="px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded">
                      F: {gpaData.grade_distribution.F}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-b-2 border-pink-500 rounded-full animate-spin"></div>
            </div>
          ) : grades.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg shadow">
              <p className="text-lg text-gray-500">ยังไม่มีข้อมูลผลการเรียน</p>
            </div>
          ) : (
            <div className="overflow-hidden bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-white bg-gradient-to-r from-pink-500 to-purple-500">
                      <th className="px-6 py-3 text-left">วิชา</th>
                      <th className="px-6 py-3 text-left">ครูผู้สอน</th>
                      <th className="px-6 py-3 text-center">คะแนนเก็บ 1</th>
                      <th className="px-6 py-3 text-center">คะแนนเก็บ 2</th>
                      <th className="px-6 py-3 text-center">คะแนนเก็บ 3</th>
                      <th className="px-6 py-3 text-center">คะแนนเก็บ 4</th>
                      <th className="px-6 py-3 text-center">กลางภาค</th>
                      <th className="px-6 py-3 text-center">ปลายภาค</th>
                      <th className="px-6 py-3 text-center">รวม</th>
                      <th className="px-6 py-3 text-center">เกรด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-4 font-medium">{grade.subject_name}</td>
                        <td className="px-6 py-4 text-gray-600">{grade.teacher_name || '-'}</td>
                        <td className="px-6 py-4 text-center">{grade.score_1 || '-'}</td>
                        <td className="px-6 py-4 text-center">{grade.score_2 || '-'}</td>
                        <td className="px-6 py-4 text-center">{grade.score_3 || '-'}</td>
                        <td className="px-6 py-4 text-center">{grade.score_4 || '-'}</td>
                        <td className="px-6 py-4 text-center">{grade.midterm_score || '-'}</td>
                        <td className="px-6 py-4 text-center">{grade.final_score || '-'}</td>
                        <td className="px-6 py-4 font-bold text-center">{grade.total_score || '-'}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full font-bold ${getGradeColor(grade.grade)}`}>
                            {grade.grade || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}