import { useState, useEffect } from "react";
import { Calendar, Filter } from "lucide-react";
import StudentLayout from "../../components/StudentLayout";
import API from "../../services/api";

export default function StudentAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, homeroom, subject

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, detailRes] = await Promise.all([
        API.getAttendanceSummary(),
        API.getAttendanceDetail({ start_date: startDate, end_date: endDate })
      ]);
      
      setAttendanceSummary(summaryRes.data.data);
      setAttendanceRecords(detailRes.data.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      alert("ไม่สามารถดึงข้อมูลการเข้าเรียนได้");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchData();
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    setFilterType("all");
    fetchData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "มาเรียน":
        return "bg-green-100 text-green-800";
      case "มาสาย":
        return "bg-yellow-100 text-yellow-800";
      case "ลาป่วย":
        return "bg-blue-100 text-blue-800";
      case "ลากิจ":
        return "bg-purple-100 text-purple-800";
      case "ขาดเรียน":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "มาเรียน":
        return "✓";
      case "มาสาย":
        return "⏰";
      case "ลาป่วย":
        return "🏥";
      case "ลากิจ":
        return "📝";
      case "ขาดเรียน":
        return "✗";
      default:
        return "?";
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    
    // Check if it's a full timestamp (ISO format with date and time)
    if (timeString.includes('T') || timeString.includes(' ')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    }
    
    // If it's just time string (HH:MM:SS format)
    return timeString.substring(0, 5); // Get HH:MM
  };

  const filteredRecords = attendanceRecords.filter(record => {
    if (filterType === "all") return true;
    if (filterType === "homeroom") return record.attendance_type === "homeroom";
    if (filterType === "subject") return record.attendance_type === "subject";
    return true;
  });

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <StudentLayout user={user} onLogout={handleLogout}>
      <h2 className="mb-6 text-3xl font-bold">บันทึกการเข้าเรียน</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="mb-1 text-sm text-gray-600">เปอร์เซ็นต์เข้าเรียน</p>
          <p className="text-3xl font-bold text-green-500">
            {calculateAttendancePercentage()}%
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <p className="mb-1 text-sm text-gray-600">มาเรียน</p>
          <p className="text-3xl font-bold text-green-600">
            {attendanceSummary?.present || 0}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <p className="mb-1 text-sm text-gray-600">มาสาย</p>
          <p className="text-3xl font-bold text-yellow-600">
            {attendanceSummary?.late || 0}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <p className="mb-1 text-sm text-gray-600">ขาดเรียน</p>
          <p className="text-3xl font-bold text-red-600">
            {attendanceSummary?.absent || 0}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <p className="mb-1 text-sm text-gray-600">ลาป่วย</p>
          <p className="text-3xl font-bold text-blue-600">
            {attendanceSummary?.sick_leave || 0}
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <p className="mb-1 text-sm text-gray-600">ลากิจ</p>
          <p className="text-3xl font-bold text-purple-600">
            {attendanceSummary?.personal_leave || 0}
          </p>
        </div>

        <div className="col-span-2 p-4 bg-white rounded-lg shadow">
          <p className="mb-1 text-sm text-gray-600">จำนวนวันทั้งหมด</p>
          <p className="text-3xl font-bold text-gray-700">
            {attendanceSummary?.total_days || 0} วัน
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-800">ตัวกรอง</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="block mb-1 text-sm font-medium">วันที่เริ่มต้น</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">วันที่สิ้นสุด</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">ประเภท</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
            >
              <option value="all">ทั้งหมด</option>
              <option value="homeroom">เข้าแถว</option>
              <option value="subject">รายวิชา</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleFilter}
              className="flex-1 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              ค้นหา
            </button>
            <button
              onClick={handleClearFilter}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ล้าง
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">รายการบันทึกการเข้าเรียน</h3>
          <span className="text-sm text-gray-600">
            ทั้งหมด {filteredRecords.length} รายการ
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-b-2 border-pink-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <p>ไม่พบบันทึกการเข้าเรียน</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    วันที่
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    วิชา/คาบ
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    ครูผู้สอน
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    เวลา
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-center text-gray-500 uppercase">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    หมายเหตุ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(record.attendance_date).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(record.attendance_date).toLocaleDateString('th-TH', {
                          weekday: 'long'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        record.attendance_type === 'homeroom' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {record.attendance_type === 'homeroom' ? 'เข้าแถว' : 'รายวิชา'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {record.subject_name || '-'}
                      </div>
                      {record.period_number && (
                        <div className="text-xs text-gray-500">
                          คาบที่ {record.period_number}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {record.teacher_name || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatTime(record.check_in_time)}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}>
                        <span className="mr-1">{getStatusIcon(record.status)}</span>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {record.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}