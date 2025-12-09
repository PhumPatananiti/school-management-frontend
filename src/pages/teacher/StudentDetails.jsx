import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Calendar, Award, Heart, ClipboardList, UserCircle 
} from "lucide-react";
import TeacherLayout from "../../components/TeacherLayout";
import API from "../../services/api";

export default function StudentDetail({ user, onLogout }) {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  
  // Data states
  const [studentProfile, setStudentProfile] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [grades, setGrades] = useState([]);
  const [gpaData, setGpaData] = useState(null);
  const [health, setHealth] = useState(null);
  const [homeVisits, setHomeVisits] = useState([]);

  // Photo edit states
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // Check if studentId is valid
  useEffect(() => {
    console.log("StudentDetail mounted");
    console.log("studentId from URL params:", studentId);
    console.log("studentId type:", typeof studentId);
    console.log("studentId is undefined?", studentId === undefined);
    console.log("studentId is 'undefined'?", studentId === 'undefined');
    
    if (!studentId || studentId === 'undefined') {
      console.error("Invalid student ID, redirecting back");
      navigate('/teacher/studentinformation');
      return;
    }
  }, [studentId, navigate]);

  useEffect(() => {
    fetchAllData();
  }, [studentId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log("Fetching data for student ID:", studentId);
      
      const res = await API.getStudentCompletedDetails(studentId);
      console.log("API Response:", res.data);
      
      const data = res.data.data;
      console.log("Extracted data object:", data);
      console.log("Profile:", data.profile);
      console.log("Attendance:", data.attendance);
      console.log("Grades:", data.grades);
      console.log("GPA:", data.gpa);
      console.log("Health:", data.health);
      console.log("Home Visits:", data.homeVisits);
      
      setStudentProfile(data.profile);
      setAttendance(data.attendance);
      setGrades(data.grades || []);
      setGpaData(data.gpa);
      setHealth(data.health);
      setHomeVisits(data.homeVisits || []);
      
      console.log("Data loaded successfully");
      console.log("State after setting - studentProfile:", data.profile);
    } catch (error) {
      console.error("Error fetching student data:", error);
      console.error("Error response:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Photo edit functions
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
        return;
      }

      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async () => {
    if (!photoFile) {
      alert('กรุณาเลือกรูปภาพ');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('profile_picture', photoFile);

      await API.updateStudentPhoto(studentId, formData);
      
      // Update local state with new photo
      setStudentProfile(prev => ({
        ...prev,
        profile_picture: photoPreview
      }));
      
      // Reset states
      setIsEditingPhoto(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      
      alert('อัปเดตรูปภาพสำเร็จ');
      
      // Optionally refresh data
      await fetchAllData();
    } catch (error) {
      console.error('Error updating photo:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตรูปภาพ');
    }
  };

  const handleCancelPhotoEdit = () => {
    setIsEditingPhoto(false);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-pink-500 rounded-full animate-spin"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <TeacherLayout user={user} onLogout={onLogout}>
      {/* Header */}
      <div className="flex items-center mb-6 space-x-4">
        <button
          onClick={() => navigate("/teacher/studentinformation")}
          className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-white rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          กลับ
        </button>
        <h2 className="text-2xl font-bold sm:text-3xl">ข้อมูลนักเรียน</h2>
      </div>

      {/* Student Profile Card */}
      <div className="p-4 mb-6 bg-white shadow-lg sm:p-6 rounded-xl">
        <div className="flex flex-col items-start space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
          
          {/* Profile Picture with Edit */}
          <div className="relative group">
            {isEditingPhoto ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="object-cover w-20 h-20 border-4 border-pink-300 rounded-full sm:w-24 sm:h-24"
                    />
                  ) : studentProfile?.profile_picture ? (
                    <img
                      src={studentProfile.profile_picture}
                      alt={studentProfile?.full_name}
                      className="object-cover w-20 h-20 border-4 border-gray-300 rounded-full sm:w-24 sm:h-24"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-20 h-20 text-2xl text-white bg-gray-400 border-4 border-gray-300 rounded-full sm:w-24 sm:h-24 sm:text-3xl">
                      {studentProfile?.full_name?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col w-full gap-2 sm:flex-row">
                  <label className="px-3 py-1 text-sm text-center text-white transition-colors bg-blue-500 rounded cursor-pointer hover:bg-blue-600 whitespace-nowrap">
                    เลือกรูป
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleSavePhoto}
                    className="px-3 py-1 text-sm text-white transition-colors bg-green-500 rounded hover:bg-green-600 whitespace-nowrap"
                  >
                    บันทึก
                  </button>
                  <button
                    onClick={handleCancelPhotoEdit}
                    className="px-3 py-1 text-sm text-gray-700 transition-colors bg-gray-200 rounded hover:bg-gray-300 whitespace-nowrap"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                {studentProfile?.profile_picture ? (
                  <img
                    src={studentProfile.profile_picture}
                    alt={studentProfile?.full_name}
                    className="object-cover w-20 h-20 rounded-full sm:w-24 sm:h-24"
                  />
                ) : (
                  <div className="flex items-center justify-center w-20 h-20 text-2xl text-white bg-pink-500 rounded-full sm:w-24 sm:h-24 sm:text-3xl">
                    {studentProfile?.full_name?.charAt(0) || "?"}
                  </div>
                )}
                
                {/* Edit overlay on hover */}
                <button
                  onClick={() => setIsEditingPhoto(true)}
                  className="absolute inset-0 flex items-center justify-center transition-opacity bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100"
                >
                  <svg 
                    className="w-8 h-8 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Student Info */}
          <div className="flex-1 w-full">
            <h3 className="mb-3 text-xl font-bold sm:text-2xl sm:mb-2">{studentProfile?.full_name}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm sm:gap-4 sm:grid-cols-4">
              <div>
                <p className="text-gray-500">เลขที่</p>
                <p className="font-semibold">{studentProfile?.student_number}</p>
              </div>
              <div>
                <p className="text-gray-500">รหัสนักเรียน</p>
                <p className="font-semibold">{studentProfile?.student_id}</p>
              </div>
              <div>
                <p className="text-gray-500">ห้องเรียน</p>
                <p className="font-semibold">{studentProfile?.room_name}</p>
              </div>
              <div>
                <p className="text-gray-500">คะแนนความประพฤติ</p>
                <p className="font-semibold text-pink-600">
                  {studentProfile?.behavior_score || 100}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Friendly Tabs */}
      <div className="mb-6">
        {/* Desktop: Horizontal tabs */}
        <div className="hidden space-x-2 sm:flex">
          <TabButton
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
            icon={<UserCircle className="w-5 h-5" />}
            label="ข้อมูลส่วนตัว"
          />
          <TabButton
            active={activeTab === "attendance"}
            onClick={() => setActiveTab("attendance")}
            icon={<Calendar className="w-5 h-5" />}
            label="การเข้าเรียน"
          />
          <TabButton
            active={activeTab === "grades"}
            onClick={() => setActiveTab("grades")}
            icon={<Award className="w-5 h-5" />}
            label="ผลการเรียน"
          />
          <TabButton
            active={activeTab === "health"}
            onClick={() => setActiveTab("health")}
            icon={<Heart className="w-5 h-5" />}
            label="สุขภาพ"
          />
          <TabButton
            active={activeTab === "homevisits"}
            onClick={() => setActiveTab("homevisits")}
            icon={<ClipboardList className="w-5 h-5" />}
            label="การเยี่ยมบ้าน"
          />
        </div>

        {/* Mobile: Grid layout */}
        <div className="grid grid-cols-2 gap-2 sm:hidden">
          <MobileTabButton
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
            icon={<UserCircle className="w-6 h-6" />}
            label="ข้อมูลส่วนตัว"
          />
          <MobileTabButton
            active={activeTab === "attendance"}
            onClick={() => setActiveTab("attendance")}
            icon={<Calendar className="w-6 h-6" />}
            label="การเข้าเรียน"
          />
          <MobileTabButton
            active={activeTab === "grades"}
            onClick={() => setActiveTab("grades")}
            icon={<Award className="w-6 h-6" />}
            label="ผลการเรียน"
          />
          <MobileTabButton
            active={activeTab === "health"}
            onClick={() => setActiveTab("health")}
            icon={<Heart className="w-6 h-6" />}
            label="สุขภาพ"
          />
          <MobileTabButton
            active={activeTab === "homevisits"}
            onClick={() => setActiveTab("homevisits")}
            icon={<ClipboardList className="w-6 h-6" />}
            label="การเยี่ยมบ้าน"
            className="col-span-2"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow-lg rounded-xl">
        {activeTab === "profile" && <ProfileTab data={studentProfile} />}
        {activeTab === "attendance" && <AttendanceTab data={attendance} />}
        {activeTab === "grades" && <GradesTab grades={grades} gpaData={gpaData} />}
        {activeTab === "health" && <HealthTab data={health} />}
        {activeTab === "homevisits" && <HomeVisitsTab data={homeVisits} />}
      </div>
    </TeacherLayout>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
        active
          ? "bg-pink-500 text-white shadow-md"
          : "bg-white text-gray-700 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MobileTabButton({ active, onClick, icon, label, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-xl font-medium transition-all ${
        active
          ? "bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-lg"
          : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
      } ${className}`}
    >
      <div className="mb-2">{icon}</div>
      <span className="text-sm text-center">{label}</span>
    </button>
  );
}

function ProfileTab({ data }) {
  return (
    <div className="p-4 sm:p-6">
      <h3 className="mb-4 text-xl font-bold">ข้อมูลส่วนตัว</h3>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
        <InfoItem label="ชื่อ-นามสกุล" value={data?.full_name} />
        <InfoItem label="เลขที่" value={data?.student_number} />
        <InfoItem label="รหัสนักเรียน" value={data?.student_id} />
        <InfoItem label="ห้องเรียน" value={data?.room_name} />
        <InfoItem label="ระดับชั้น" value={data?.grade_level} />
        <InfoItem label="คะแนนความประพฤติ" value={data?.behavior_score || 100} />
        <InfoItem label="ครูที่ปรึกษา" value={data?.homeroom_teacher_name} />
        <InfoItem label="เบอร์ครูที่ปรึกษา" value={data?.teacher_phone} />
        <InfoItem label="ชื่อผู้ปกครอง" value={data?.parent_name} />
        <InfoItem label="เบอร์ผู้ปกครอง" value={data?.parent_phone} />
        <InfoItem label="ความสัมพันธ์" value={data?.parent_relationship} />
      </div>
    </div>
  );
}

function AttendanceTab({ data }) {
  const total = data ? 
    (parseInt(data.present) + parseInt(data.late) + parseInt(data.sick_leave) + 
     parseInt(data.personal_leave) + parseInt(data.absent)) : 0;
  
  const attendanceRate = total > 0 ? 
    ((parseInt(data.present) + parseInt(data.late)) / total * 100).toFixed(1) : 0;

  return (
    <div className="p-4 sm:p-6">
      <h3 className="mb-4 text-xl font-bold">สรุปการเข้าเรียน</h3>
      
      <div className="p-4 mb-6 rounded-lg bg-gradient-to-r from-pink-100 to-purple-100">
        <p className="text-sm text-gray-600">เปอร์เซ็นต์การเข้าเรียน</p>
        <p className="text-3xl font-bold text-pink-600">{attendanceRate}%</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="มาเรียน" value={data?.present || 0} color="green" />
        <StatCard label="มาสาย" value={data?.late || 0} color="yellow" />
        <StatCard label="ลาป่วย" value={data?.sick_leave || 0} color="blue" />
        <StatCard label="ลากิจ" value={data?.personal_leave || 0} color="purple" />
        <StatCard label="ขาดเรียน" value={data?.absent || 0} color="red" />
      </div>
    </div>
  );
}

function GradesTab({ grades, gpaData }) {
  return (
    <div className="p-4 sm:p-6">
      <h3 className="mb-4 text-xl font-bold">ผลการเรียน</h3>
      
      {gpaData && (
        <div className="grid grid-cols-2 gap-3 mb-6 sm:gap-4 md:grid-cols-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-pink-100 to-pink-50">
            <p className="text-sm text-gray-600">GPA</p>
            <p className="text-2xl font-bold text-pink-600">{gpaData.gpa}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">จำนวนวิชา</p>
            <p className="text-2xl font-bold">{gpaData.total_subjects}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">คะแนนเฉลี่ย</p>
            <p className="text-2xl font-bold">{gpaData.average_score}</p>
          </div>
          <div className="col-span-2 p-4 bg-gray-100 rounded-lg md:col-span-1">
            <p className="text-sm text-gray-600">การกระจายเกรด</p>
            <p className="text-sm">
              A: {gpaData.grade_distribution?.A || 0} | 
              B: {gpaData.grade_distribution?.B || 0} | 
              C: {gpaData.grade_distribution?.C || 0}
            </p>
          </div>
        </div>
      )}

      {grades.length === 0 ? (
        <div className="py-8 text-center text-gray-500">ยังไม่มีข้อมูลผลการเรียน</div>
      ) : (
        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-xs font-semibold text-left sm:px-4 sm:text-sm">วิชา</th>
                  <th className="px-3 py-3 text-xs font-semibold text-center sm:px-4 sm:text-sm">รหัสวิชา</th>
                  <th className="px-3 py-3 text-xs font-semibold text-center sm:px-4 sm:text-sm">คะแนน</th>
                  <th className="px-3 py-3 text-xs font-semibold text-center sm:px-4 sm:text-sm">เกรด</th>
                  <th className="hidden px-4 py-3 text-sm font-semibold text-left sm:table-cell">ครูผู้สอน</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {grades.map((grade, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm sm:px-4">{grade.subject_name}</td>
                    <td className="px-3 py-3 text-xs text-center text-gray-600 sm:px-4 sm:text-sm">
                      {grade.subject_code}
                    </td>
                    <td className="px-3 py-3 text-sm font-semibold text-center sm:px-4">
                      {grade.total_score}
                    </td>
                    <td className="px-3 py-3 text-center sm:px-4">
                      <span className={`px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-semibold ${
                        grade.grade === 'A' ? 'bg-green-100 text-green-700' :
                        grade.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                        grade.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                        grade.grade === 'D' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {grade.grade}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-gray-600 sm:table-cell">
                      {grade.teacher_name || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function HealthTab({ data }) {
  return (
    <div className="p-4 sm:p-6">
      <h3 className="mb-4 text-xl font-bold">ข้อมูลสุขภาพ</h3>
      
      {!data ? (
        <div className="py-8 text-center text-gray-500">ยังไม่มีข้อมูลสุขภาพ</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
          <InfoItem label="กรุ๊ปเลือด" value={data.blood_type || "-"} />
          <InfoItem label="ส่วนสูง (ซม.)" value={data.height || "-"} />
          <InfoItem label="น้ำหนัก (กก.)" value={data.weight || "-"} />
          <InfoItem label="โรคประจำตัว" value={data.chronic_diseases || "-"} />
          <InfoItem label="อาการแพ้" value={data.allergies || "-"} />
          <InfoItem label="ยาที่ใช้ประจำ" value={data.medications || "-"} />
          <InfoItem label="ผู้ติดต่อฉุกเฉิน" value={data.emergency_contact_name || "-"} />
          <InfoItem label="เบอร์ฉุกเฉิน" value={data.emergency_contact_phone || "-"} />
          <div className="sm:col-span-2">
            <InfoItem label="หมายเหตุ" value={data.notes || "-"} />
          </div>
        </div>
      )}
    </div>
  );
}

function HomeVisitsTab({ data }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMapUrl = (latitude, longitude) => {
    if (!latitude || !longitude) return null;
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  };

  return (
    <div className="p-4 sm:p-6">
      <h3 className="mb-4 text-xl font-bold">ประวัติการเยี่ยมบ้าน</h3>
      
      {data.length === 0 ? (
        <div className="py-8 text-center text-gray-500">ยังไม่มีประวัติการเยี่ยมบ้าน</div>
      ) : (
        <div className="space-y-4">
          {data.map((visit, index) => (
            <div key={index} className="overflow-hidden border border-gray-200 rounded-lg">
              {/* Header */}
              <div className="p-4 text-white bg-gradient-to-r from-pink-500 to-purple-500">
                <div className="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
                  <h4 className="text-base font-bold sm:text-lg">
                    การเยี่ยมบ้านครั้งที่ {data.length - index}
                  </h4>
                  <span className="text-sm">
                    {formatDate(visit.visit_date)}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Map Section */}
                  {visit.latitude && visit.longitude ? (
                    <div>
                      <h5 className="mb-2 font-semibold text-gray-700">ตำแหน่งบ้าน</h5>
                      <div className="relative h-48 mb-2 overflow-hidden bg-gray-100 border-2 border-gray-200 rounded-lg">
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={`https://maps.google.com/maps?q=${visit.latitude},${visit.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                          allowFullScreen
                          title={`Home location ${index}`}
                        ></iframe>
                      </div>
                      <a
                        href={getMapUrl(visit.latitude, visit.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                      >
                        เปิดใน Google Maps
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg">
                      <p className="text-gray-500">ไม่มีข้อมูลตำแหน่ง</p>
                    </div>
                  )}

                  {/* Details Section */}
                  <div className="space-y-3">
                    <div>
                      <p className="mb-1 text-sm text-gray-500">ครูที่มาเยี่ยม</p>
                      <p className="font-medium">{visit.teacher_name || '-'}</p>
                    </div>
                    
                    <div>
                      <p className="mb-1 text-sm text-gray-500">วันที่เยี่ยม</p>
                      <p className="font-medium">{formatDate(visit.visit_date)}</p>
                    </div>

                    {visit.report_pdf && (
                      <div>
                        <p className="mb-1 text-sm text-gray-500">เอกสารรายงาน</p>
                        <a
                          href={visit.report_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                        >
                          ดูเอกสาร PDF
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                {visit.notes && (
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <p className="mb-2 text-sm text-gray-500">รายงานการเยี่ยม</p>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap sm:text-base">{visit.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colorClasses = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className={`p-3 sm:p-4 rounded-lg ${colorClasses[color]}`}>
      <p className="text-xs font-medium sm:text-sm">{label}</p>
      <p className="text-xl font-bold sm:text-2xl">{value}</p>
    </div>
  );
}