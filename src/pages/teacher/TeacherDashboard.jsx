import { useState, useEffect } from "react";
import { Users, BookOpen } from "lucide-react";
import TeacherLayout from "../../components/TeacherLayout";
import API from "../../services/api";

export default function TeacherDashboard({ user, onLogout }) {
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);

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
    <TeacherLayout user={user} onLogout={onLogout}>
      {/* Welcome Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          ยินดีต้อนรับ
        </h2>
        <p className="mt-1 text-lg text-gray-600 sm:text-xl">
          {user.full_name}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 mb-4 sm:gap-4 sm:mb-6">
        <div className="p-4 text-center bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 sm:w-12 sm:h-12">
            <Users className="w-5 h-5 text-white sm:w-6 sm:h-6" />
          </div>
          <p className="text-xl font-bold text-gray-800 sm:text-2xl">{rooms.length}</p>
          <p className="text-xs text-gray-600 sm:text-sm">ห้องที่สอน</p>
        </div>
        
        <div className="p-4 text-center bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 sm:w-12 sm:h-12">
            <BookOpen className="w-5 h-5 text-white sm:w-6 sm:h-6" />
          </div>
          <p className="text-xl font-bold text-gray-800 sm:text-2xl">{subjects.length}</p>
          <p className="text-xs text-gray-600 sm:text-sm">วิชาที่สอน</p>
        </div>
      </div>

      {/* Main Content Cards */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Rooms Card */}
        <div className="overflow-hidden bg-white shadow-lg rounded-xl">
          <div className="p-4 text-white sm:p-6 bg-gradient-to-r from-pink-500 to-purple-500">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold sm:text-xl">ห้องที่สอน</h3>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            {rooms.length === 0 ? (
              <p className="py-8 text-center text-gray-500">ยังไม่มีห้องเรียน</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto sm:max-h-[400px]">
                {rooms.map(room => (
                  <div 
                    key={room.id} 
                    className={`p-3 rounded-lg transition-all ${
                      room.is_homeroom 
                        ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 sm:text-base">
                          {room.name}
                        </p>
                        {room.grade_level && (
                          <p className="text-xs text-gray-500 sm:text-sm">
                            ระดับชั้น {room.grade_level}
                          </p>
                        )}
                      </div>
                      {room.is_homeroom && (
                        <span className="px-2 py-1 text-xs font-semibold text-pink-600 bg-pink-100 rounded-full sm:text-sm">
                          ห้องประจำชั้น
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Subjects Card */}
        <div className="overflow-hidden bg-white shadow-lg rounded-xl">
          <div className="p-4 text-white sm:p-6 bg-gradient-to-r from-blue-500 to-cyan-500">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              <h3 className="text-lg font-bold sm:text-xl">วิชาที่สอน</h3>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            {subjects.length === 0 ? (
              <p className="py-8 text-center text-gray-500">ยังไม่มีวิชาที่สอน</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto sm:max-h-[400px]">
                {subjects.map(subject => (
                  <div 
                    key={subject.id} 
                    className="p-3 transition-all rounded-lg bg-gray-50 hover:bg-gray-100 hover:shadow-md"
                  >
                    <p className="text-sm font-semibold text-gray-800 sm:text-base">
                      {subject.subject_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded sm:text-sm">
                        {subject.subject_code}
                      </span>
                      {subject.credit_hours && (
                        <span className="text-xs text-gray-500 sm:text-sm">
                          {subject.credit_hours} หน่วยกิต
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}