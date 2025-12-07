import { useState, useEffect } from "react";
import { Home, ClipboardList, BarChart3, MapPin, Calendar, FileText, Plus, Save, X, ExternalLink, Map as MapIcon, Link as LinkIcon, UserCircle } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

export default function HomeVisits() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [homeVisits, setHomeVisits] = useState([]);
  const [formData, setFormData] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    maps_url: '',
    notes: '',
    report_pdf: ''
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const menuItems = [
    { path: "/teacher", icon: Home, label: "หน้าหลัก" },
    { path: "/teacher/attendance", icon: ClipboardList, label: "เช็คชื่อ" },
    { path: "/teacher/grades", icon: BarChart3, label: "บันทึกคะแนน" },
    { path: "/teacher/homevisits", icon: MapIcon, label: "เยี่ยมบ้าน" },
    { path: "/teacher/studentinformation", icon: UserCircle, label: "ข้อมูลนักเรียน" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentHomeVisits(selectedStudent.id);
    }
  }, [selectedStudent]);

  const fetchRooms = async () => {
    try {
      const res = await API.getTeacherRooms(token);
      setRooms(res.data.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleRoomSelect = async (room) => {
    setSelectedRoom(room);
    setSelectedStudent(null);
    setHomeVisits([]);
    
    try {
      const res = await API.getRoomStudents(room.id, token);
      setStudents(res.data.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("ไม่สามารถดึงข้อมูลนักเรียนได้");
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setFormData({
      visit_date: new Date().toISOString().split('T')[0],
      maps_url: '',
      notes: '',
      report_pdf: ''
    });
  };

  const fetchStudentHomeVisits = async (studentId) => {
    try {
      const res = await API.getStudentHomeVisits(studentId, token);
      if (res.data.success) {
        setHomeVisits(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching home visits:", error);
      setHomeVisits([]);
    }
  };

  // Extract coordinates from Google Maps URL
  const extractCoordinatesFromUrl = (url) => {
    if (!url) return { latitude: null, longitude: null };
    
    try {
      // Pattern 1: ?q=lat,lng (most common from share button)
      const qPattern = /[?&]q=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/;
      const qMatch = url.match(qPattern);
      if (qMatch) {
        return { latitude: parseFloat(qMatch[1]), longitude: parseFloat(qMatch[2]) };
      }

      // Pattern 2: @lat,lng,zoom (from address bar)
      const atPattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const atMatch = url.match(atPattern);
      if (atMatch) {
        return { latitude: parseFloat(atMatch[1]), longitude: parseFloat(atMatch[2]) };
      }

      // Pattern 3: /place/.../@lat,lng (from place links)
      const placePattern = /place\/[^@]+@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const placeMatch = url.match(placePattern);
      if (placeMatch) {
        return { latitude: parseFloat(placeMatch[1]), longitude: parseFloat(placeMatch[2]) };
      }

      // Pattern 4: /maps/place/.../@lat,lng
      const mapsPlacePattern = /\/maps\/place\/[^@]+@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const mapsPlaceMatch = url.match(mapsPlacePattern);
      if (mapsPlaceMatch) {
        return { latitude: parseFloat(mapsPlaceMatch[1]), longitude: parseFloat(mapsPlaceMatch[2]) };
      }

      // Pattern 5: ll=lat,lng (alternative parameter)
      const llPattern = /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/;
      const llMatch = url.match(llPattern);
      if (llMatch) {
        return { latitude: parseFloat(llMatch[1]), longitude: parseFloat(llMatch[2]) };
      }

      // Pattern 6: /maps/@lat,lng (direct coordinate link)
      const directPattern = /\/maps\/@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const directMatch = url.match(directPattern);
      if (directMatch) {
        return { latitude: parseFloat(directMatch[1]), longitude: parseFloat(directMatch[2]) };
      }

      console.warn("Could not extract coordinates from URL:", url);
      return { latitude: null, longitude: null };
    } catch (error) {
      console.error("Error extracting coordinates:", error);
      return { latitude: null, longitude: null };
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
          
          setFormData(prev => ({
            ...prev,
            maps_url: mapsUrl
          }));
          setLoading(false);
          alert("ได้พิกัดตำแหน่งปัจจุบันแล้ว");
        },
        (error) => {
          setLoading(false);
          alert("ไม่สามารถเข้าถึงตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง");
          console.error("Geolocation error:", error);
        }
      );
    } else {
      alert("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง");
    }
  };

  const handleShowMapFromUrl = (mapsUrl) => {
    const coords = extractCoordinatesFromUrl(mapsUrl);
    if (coords.latitude && coords.longitude) {
      setSelectedLocation({ ...coords, mapsUrl });
      setShowMapModal(true);
    } else {
      // If can't extract coordinates, still show modal with the URL for iframe
      setSelectedLocation({ latitude: null, longitude: null, mapsUrl });
      setShowMapModal(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      alert("กรุณาเลือกนักเรียน");
      return;
    }

    setLoading(true);

    try {
      // Extract coordinates from URL for database storage
      const coords = extractCoordinatesFromUrl(formData.maps_url);
      
      const res = await API.createHomeVisit({
        student_id: selectedStudent.id,
        visit_date: formData.visit_date,
        latitude: coords.latitude,
        longitude: coords.longitude,
        maps_url: formData.maps_url || null,
        notes: formData.notes,
        report_pdf: formData.report_pdf || null
      }, token);

      if (res.data.success) {
        alert("บันทึกการเยี่ยมบ้านสำเร็จ");
        setShowModal(false);
        fetchStudentHomeVisits(selectedStudent.id);
        setFormData({
          visit_date: new Date().toISOString().split('T')[0],
          maps_url: '',
          notes: '',
          report_pdf: ''
        });
      }
    } catch (error) {
      console.error("Error creating home visit:", error);
      alert(error.response?.data?.message || "ไม่สามารถบันทึกการเยี่ยมบ้านได้");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="flex">
        <Sidebar items={menuItems} role="teacher" />
        
        <div className="flex-1 p-6">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">การเยี่ยมบ้าน</h2>

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
          {selectedRoom && students.length > 0 && (
            <div className="p-4 mb-6 bg-white rounded-lg shadow">
              <label className="block mb-2 font-semibold text-gray-700">เลือกนักเรียน</label>
              <div className="grid grid-cols-2 gap-2 overflow-y-auto md:grid-cols-3 lg:grid-cols-4 max-h-96">
                {students.map(student => (
                  <button
                    key={student.id}
                    onClick={() => handleStudentSelect(student)}
                    className={`p-3 rounded-lg font-medium transition-all text-left ${
                      selectedStudent?.id === student.id
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="text-sm font-bold">เลขที่ {student.student_number}</div>
                    <div className="text-xs truncate">{student.full_name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Student Info & Actions */}
          {selectedStudent && (
            <div className="p-6 mb-6 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedStudent.full_name}
                  </h3>
                  <p className="text-gray-600">
                    เลขที่ {selectedStudent.student_number} | รหัส {selectedStudent.student_id}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  <Plus className="w-5 h-5" />
                  บันทึกการเยี่ยมบ้าน
                </button>
              </div>

              {/* Home Visit History */}
              <div className="mt-6">
                <h4 className="mb-3 font-semibold text-gray-800">ประวัติการเยี่ยมบ้าน</h4>
                {homeVisits.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <MapIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>ยังไม่มีการเยี่ยมบ้านนักเรียนคนนี้</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {homeVisits.map((visit, index) => (
                      <div key={visit.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            <span className="font-semibold text-gray-800">
                              ครั้งที่ {homeVisits.length - index} - {formatDate(visit.visit_date)}
                            </span>
                          </div>
                          {visit.maps_url && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleShowMapFromUrl(visit.maps_url)}
                                className="flex items-center gap-1 px-3 py-1 text-sm text-white transition-all bg-blue-500 rounded-lg hover:bg-blue-600"
                              >
                                <MapIcon className="w-4 h-4" />
                                ดูแผนที่
                              </button>
                              <a
                                href={visit.maps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 transition-all rounded-lg bg-blue-50 hover:bg-blue-100"
                              >
                                <ExternalLink className="w-4 h-4" />
                                เปิดใน Google Maps
                              </a>
                            </div>
                          )}
                        </div>
                        
                        {visit.notes && (
                          <div className="p-3 mt-2 rounded-lg bg-gray-50">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{visit.notes}</p>
                          </div>
                        )}
                        
                        {visit.report_pdf && (
                          <a
                            href={visit.report_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-2 text-sm text-red-600 hover:text-red-800"
                          >
                            <FileText className="w-4 h-4" />
                            ดูเอกสาร PDF
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          {!selectedRoom && (
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h4 className="mb-2 font-semibold text-blue-900">วิธีใช้งาน:</h4>
              <ol className="space-y-1 text-sm text-blue-800 list-decimal list-inside">
                <li>เลือกห้องเรียนที่ต้องการ</li>
                <li>เลือกนักเรียนที่ต้องการบันทึกการเยี่ยมบ้าน</li>
                <li>กดปุ่ม "บันทึกการเยี่ยมบ้าน"</li>
                <li>วางลิงก์ Google Maps ของที่อยู่บ้าน หรือใช้ตำแหน่งปัจจุบัน</li>
                <li>กรอกหมายเหตุและกด "บันทึก"</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Creating Home Visit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 p-6 text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">บันทึกการเยี่ยมบ้าน</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-white transition-all rounded-lg hover:bg-white hover:bg-opacity-20"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {selectedStudent && (
                <p className="mt-2 text-white text-opacity-90">
                  {selectedStudent.full_name} (เลขที่ {selectedStudent.student_number})
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Visit Date */}
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  วันที่เยี่ยมบ้าน *
                </label>
                <input
                  type="date"
                  name="visit_date"
                  value={formData.visit_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Google Maps URL */}
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    ลิงก์ Google Maps ของที่อยู่บ้าน
                  </div>
                </label>
                
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 mb-3 text-white transition-all bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  <MapPin className="w-4 h-4" />
                  {loading ? 'กำลังดึงตำแหน่ง...' : 'ใช้ตำแหน่งปัจจุบัน'}
                </button>

                <input
                  type="url"
                  name="maps_url"
                  value={formData.maps_url}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/?q=13.7563,100.5018"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                
                <div className="p-3 mt-2 rounded-lg bg-blue-50">
                  <p className="text-xs text-blue-800">
                    <strong>วิธีรับลิงก์ Google Maps:</strong>
                  </p>
                  <ol className="mt-1 ml-4 text-xs text-blue-700 list-decimal">
                    <li>เปิด Google Maps บนมือถือหรือคอมพิวเตอร์</li>
                    <li>ค้นหาหรือปักหมุดที่ตำแหน่งบ้านนักเรียน</li>
                    <li>กดปุ่ม "แชร์" หรือ "Share"</li>
                    <li>เลือก "คัดลอกลิงก์" หรือ "Copy link"</li>
                    <li>นำลิงก์มาวางในช่องนี้</li>
                  </ol>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  หมายเหตุ / รายงานการเยี่ยม *
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="บันทึกรายละเอียดการเยี่ยมบ้าน เช่น สภาพบ้าน, การพูดคุยกับผู้ปกครอง, ข้อสังเกต..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Report PDF URL */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  ลิงก์เอกสาร PDF (ถ้ามี)
                </label>
                <input
                  type="url"
                  name="report_pdf"
                  value={formData.report_pdf}
                  onChange={handleChange}
                  placeholder="https://example.com/report.pdf"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  สามารถใส่ลิงก์ไปยังเอกสาร PDF ที่อัปโหลดไว้ (Google Drive, Dropbox, etc.)
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 text-gray-700 transition-all border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center flex-1 gap-2 px-6 py-3 text-white transition-all rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'กำลังบันทึก...' : 'บันทึกการเยี่ยมบ้าน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Map Modal - EMBEDDED GOOGLE MAP IS HERE */}
      {showMapModal && selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 text-white bg-gradient-to-r from-blue-500 to-purple-500">
              <h3 className="text-xl font-bold">ตำแหน่งที่อยู่บ้าน</h3>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-2 text-white transition-all rounded-lg hover:bg-white hover:bg-opacity-20"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4">
              {selectedLocation.latitude && selectedLocation.longitude && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600">
                    <strong>พิกัด:</strong> {selectedLocation.latitude}, {selectedLocation.longitude}
                  </p>
                </div>
              )}
              
              <div className="mb-3">
                <a
                  href={selectedLocation.mapsUrl || `https://www.google.com/maps?q=${selectedLocation.latitude},${selectedLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-4 h-4" />
                  เปิดใน Google Maps (แท็บใหม่)
                </a>
              </div>
              
              {/* 🗺️ THIS IS THE EMBEDDED GOOGLE MAP */}
              <div className="relative overflow-hidden rounded-lg" style={{ paddingBottom: '56.25%', height: 0 }}>
                {selectedLocation.latitude && selectedLocation.longitude ? (
                  <iframe
                    src={`https://maps.google.com/maps?q=${selectedLocation.latitude},${selectedLocation.longitude}&output=embed&z=15`}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Map"
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <MapIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">ไม่สามารถแสดงแผนที่ได้</p>
                      <a
                        href={selectedLocation.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                        เปิดลิงก์ในแท็บใหม่
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
