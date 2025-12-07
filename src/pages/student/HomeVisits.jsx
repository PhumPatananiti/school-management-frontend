import { useState, useEffect } from "react";
import { Home, ClipboardCheck, BarChart3, Heart, MapPin, Calendar, User, FileText, HomeIcon } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

export default function HomeVisits() {
  const [homeVisits, setHomeVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  const menuItems = [
    { path: "/student", icon: Home, label: "หน้าหลัก" },
    { path: "/student/attendance", icon: ClipboardCheck, label: "เช็คชื่อ" },
    { path: "/student/grades", icon: BarChart3, label: "ผลการเรียน" },
    { path: "/student/health", icon: Heart, label: "สุขภาพ" },
    { path: "/student/homevisits", icon: HomeIcon, label: "การเยี่ยมบ้าน" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchHomeVisits();
  }, []);

  const fetchHomeVisits = async () => {
    try {
      const res = await API.getHomeVisits();
      if (res.data.success) {
        setHomeVisits(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching home visits:", error);
    } finally {
      setLoading(false);
    }
  };

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
    // Google Maps embed URL
    return `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${latitude},${longitude}&zoom=15`;
  };

  const getStaticMapUrl = (latitude, longitude) => {
    if (!latitude || !longitude) return null;
    // For now, return a link to Google Maps
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-b-2 border-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="flex">
        <Sidebar items={menuItems} role="student" />
        
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">การเยี่ยมบ้าน</h2>

            {homeVisits.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-lg shadow">
                <HomeIcon size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-700">ยังไม่มีการเยี่ยมบ้าน</h3>
                <p className="text-gray-500">
                  ครูยังไม่ได้มาเยี่ยมบ้าน หากมีการเยี่ยมบ้าน ข้อมูลจะแสดงที่นี่
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {homeVisits.map((visit, index) => (
                  <div key={visit.id} className="overflow-hidden bg-white rounded-lg shadow">
                    {/* Header */}
                    <div className="p-4 text-white bg-gradient-to-r from-pink-500 to-purple-500">
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-lg font-bold">
                          <HomeIcon className="w-5 h-5" />
                          การเยี่ยมบ้านครั้งที่ {homeVisits.length - index}
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(visit.visit_date)}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Map Section */}
                        <div>
                          <h4 className="flex items-center gap-2 mb-3 font-semibold text-gray-800">
                            <MapPin className="w-5 h-5 text-red-500" />
                            ที่อยู่บ้าน
                          </h4>
                          
                          {visit.latitude && visit.longitude ? (
                            <div className="space-y-3">
                              {/* Static Map Preview */}
                              <div className="relative h-64 overflow-hidden bg-gray-100 border-2 border-gray-200 rounded-lg">
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
                              
                              {/* Coordinates */}
                              <div className="p-3 text-sm text-gray-600 rounded-lg bg-gray-50">
                                <p className="mb-1 font-medium">พิกัด:</p>
                                <p>Latitude: {visit.latitude}</p>
                                <p>Longitude: {visit.longitude}</p>
                              </div>

                              {/* Open in Google Maps Button */}
                              <a
                                href={getStaticMapUrl(visit.latitude, visit.longitude)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white transition-all bg-blue-500 rounded-lg hover:bg-blue-600"
                              >
                                <MapPin className="w-4 h-4" />
                                เปิดใน Google Maps
                              </a>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-64 bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg">
                              <div className="text-center text-gray-500">
                                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>ยังไม่มีข้อมูลตำแหน่งบ้าน</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Details Section */}
                        <div className="space-y-4">
                          {/* Teacher */}
                          <div>
                            <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-800">
                              <User className="w-5 h-5 text-purple-500" />
                              ครูที่มาเยี่ยม
                            </h4>
                            <p className="p-3 text-gray-700 rounded-lg bg-gray-50">
                              {visit.teacher_name || 'ไม่ระบุ'}
                            </p>
                          </div>

                          {/* Report/Notes */}
                          <div>
                            <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-800">
                              <FileText className="w-5 h-5 text-green-500" />
                              รายงานการเยี่ยม
                            </h4>
                            <div className="p-4 rounded-lg bg-gray-50">
                              {visit.notes ? (
                                <p className="text-gray-700 whitespace-pre-wrap">{visit.notes}</p>
                              ) : (
                                <p className="italic text-gray-500">ยังไม่มีรายงานการเยี่ยมบ้าน</p>
                              )}
                            </div>
                          </div>

                          {/* PDF Report */}
                          {visit.report_pdf && (
                            <div>
                              <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-800">
                                <FileText className="w-5 h-5 text-red-500" />
                                เอกสารรายงาน
                              </h4>
                              <a
                                href={visit.report_pdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 text-white transition-all bg-red-500 rounded-lg hover:bg-red-600"
                              >
                                <FileText className="w-4 h-4" />
                                ดูเอกสาร PDF
                              </a>
                            </div>
                          )}

                          {/* Visit Date */}
                          <div>
                            <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-800">
                              <Calendar className="w-5 h-5 text-blue-500" />
                              วันที่เยี่ยม
                            </h4>
                            <p className="p-3 text-gray-700 rounded-lg bg-gray-50">
                              {formatDate(visit.visit_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info Box */}
            <div className="p-4 mt-6 border border-blue-200 rounded-lg bg-blue-50">
              <p className="text-sm text-blue-800">
                <strong>💡 เกี่ยวกับการเยี่ยมบ้าน:</strong> การเยี่ยมบ้านเป็นกิจกรรมที่ครูที่ปรึกษามาเยี่ยมเยียนนักเรียนและผู้ปกครอง
                เพื่อสร้างความเข้าใจและความร่วมมือในการดูแลนักเรียน บันทึกนี้จะแสดงประวัติการเยี่ยมบ้านทั้งหมด
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}