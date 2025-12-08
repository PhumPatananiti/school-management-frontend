import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, X, UserCheck } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import API from "../../services/api";

export default function ManageClasses() {
  const [rooms, setRooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [assigningRoom, setAssigningRoom] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    grade_level: "",
    room_number: "",
    academic_year: "",
    capacity: ""
  });

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchRooms();
    fetchTeachers();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await API.getClasses();
      console.log("Fetch rooms response:", response);
      
      if (response.data?.data) {
        setRooms(response.data.data);
      } else if (response.data && Array.isArray(response.data)) {
        setRooms(response.data);
      } else if (response.success && response.data) {
        setRooms(response.data);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      alert("ไม่สามารถดึงข้อมูลห้องเรียนได้");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await API.getTeachers();
      console.log("Fetch teachers response:", response);
      setTeachers(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const handleCreate = () => {
    setEditingRoom(null);
    setFormData({
      name: "",
      grade_level: "",
      room_number: "",
      academic_year: "",
      capacity: ""
    });
    setShowModal(true);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      grade_level: room.grade_level?.toString() || "",
      room_number: room.room_number?.toString() || "",
      academic_year: room.academic_year || "",
      capacity: room.capacity?.toString() || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`คุณต้องการลบห้องเรียน ${name} หรือไม่?`)) return;

    try {
      await API.deleteClass(id);
      alert("ลบห้องเรียนสำเร็จ");
      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      alert(error.response?.data?.message || "ไม่สามารถลบห้องเรียนได้");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.grade_level || !formData.room_number || !formData.academic_year) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    const submitData = {
      name: formData.name,
      grade_level: parseInt(formData.grade_level),
      room_number: parseInt(formData.room_number),
      academic_year: formData.academic_year,
    };

    if (formData.capacity) {
      submitData.capacity = parseInt(formData.capacity);
    }

    try {
      if (editingRoom) {
        await API.updateClass(editingRoom.id, submitData);
        alert("แก้ไขข้อมูลห้องเรียนสำเร็จ");
      } else {
        await API.createClass(submitData);
        alert("เพิ่มห้องเรียนสำเร็จ");
      }
      setShowModal(false);
      fetchRooms();
    } catch (error) {
      console.error("Error saving room:", error);
      alert(error.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  const handleAssignTeacher = (room) => {
    setAssigningRoom(room);
    setSelectedTeacherId("");
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedTeacherId) {
      alert("กรุณาเลือกครู");
      return;
    }

    if (selectedTeacherId === "remove") {
      try {
        await API.removeHomeroom(assigningRoom.id);
        alert("ยกเลิกการกำหนดครูประจำชั้นสำเร็จ");
        setShowAssignModal(false);
        fetchRooms();
        fetchTeachers();
      } catch (error) {
        console.error("Error removing teacher:", error);
        alert(error.response?.data?.message || "ไม่สามารถยกเลิกการกำหนดครูประจำชั้นได้");
      }
      return;
    }

    try {
      await API.assignHomeroom(selectedTeacherId, { room_id: assigningRoom.id });
      const action = assigningRoom?.homeroom_teacher_name ? "เปลี่ยน" : "กำหนด";
      alert(`${action}ครูประจำชั้นสำเร็จ`);
      setShowAssignModal(false);
      fetchRooms();
      fetchTeachers();
    } catch (error) {
      console.error("Error assigning teacher:", error);
      alert(error.response?.data?.message || "ไม่สามารถกำหนดครูประจำชั้นได้");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const filteredRooms = rooms.filter(room => 
    searchTerm === "" || 
    room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.academic_year?.includes(searchTerm)
  );

  return (
    <AdminLayout user={user} onLogout={handleLogout}>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:justify-between sm:items-center sm:mb-6">
        <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">จัดการห้องเรียน</h2>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 px-4 py-2 text-white transition-all rounded-lg shadow-md bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 active:scale-95"
        >
          <Plus size={20} />
          <span>เพิ่มห้องเรียนใหม่</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 mb-4 bg-white rounded-lg shadow sm:mb-6">
        <div className="relative">
          <Search className="absolute text-gray-400 left-3 top-3" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาห้องเรียน..."
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
          <div className="w-12 h-12 border-b-2 border-pink-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-hidden bg-white rounded-lg shadow">
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">ชื่อห้อง</th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">ระดับชั้น</th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">เลขห้อง</th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">ปีการศึกษา</th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">จำนวนที่นั่ง</th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">นักเรียน</th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">ครูประจำชั้น</th>
                  <th className="px-6 py-3 text-xs font-medium text-center text-gray-500 uppercase">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      ไม่พบข้อมูลห้องเรียน
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{room.name}</td>
                      <td className="px-6 py-4">{room.grade_level}</td>
                      <td className="px-6 py-4">{room.room_number}</td>
                      <td className="px-6 py-4">{room.academic_year}</td>
                      <td className="px-6 py-4">{room.capacity || "-"}</td>
                      <td className="px-6 py-4">{room.student_count || 0}</td>
                      <td className="px-6 py-4">
                        {room.homeroom_teacher_name ? (
                          <span className="text-green-600">{room.homeroom_teacher_name}</span>
                        ) : (
                          <span className="text-gray-400">ยังไม่มี</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAssignTeacher(room)}
                            className="text-purple-500 transition-colors hover:text-purple-700"
                            title="กำหนดครูประจำชั้น"
                          >
                            <UserCheck size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(room)}
                            className="text-blue-500 transition-colors hover:text-blue-700"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(room.id, room.name)}
                            className="text-red-500 transition-colors hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="divide-y divide-gray-200 lg:hidden">
            {filteredRooms.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                ไม่พบข้อมูลห้องเรียน
              </div>
            ) : (
              filteredRooms.map((room) => (
                <div key={room.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{room.name}</h3>
                      <p className="text-sm text-gray-600">ระดับชั้น {room.grade_level} ห้อง {room.room_number}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
                      {room.academic_year}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">จำนวนที่นั่ง:</span>
                      <span className="ml-1 font-medium">{room.capacity || "-"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">นักเรียน:</span>
                      <span className="ml-1 font-medium">{room.student_count || 0}</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-500">ครูประจำชั้น:</span>
                    {room.homeroom_teacher_name ? (
                      <span className="ml-1 font-medium text-green-600">{room.homeroom_teacher_name}</span>
                    ) : (
                      <span className="ml-1 text-gray-400">ยังไม่มี</span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleAssignTeacher(room)}
                      className="flex items-center justify-center flex-1 gap-1 px-3 py-2 text-sm text-purple-600 transition-all bg-purple-100 rounded-lg hover:bg-purple-200 active:scale-95"
                    >
                      <UserCheck size={16} />
                      กำหนดครู
                    </button>
                    <button
                      onClick={() => handleEdit(room)}
                      className="flex items-center justify-center flex-1 gap-1 px-3 py-2 text-sm text-blue-600 transition-all bg-blue-100 rounded-lg hover:bg-blue-200 active:scale-95"
                    >
                      <Edit size={16} />
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(room.id, room.name)}
                      className="flex items-center justify-center px-3 py-2 text-sm text-red-600 transition-all bg-red-100 rounded-lg hover:bg-red-200 active:scale-95"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-xl font-bold sm:text-2xl">
                  {editingRoom ? "แก้ไขข้อมูลห้องเรียน" : "เพิ่มห้องเรียนใหม่"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 transition-colors hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium">ชื่อห้อง *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="เช่น ม.1/1"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">ระดับชั้น *</label>
                    <input
                      type="number"
                      name="grade_level"
                      value={formData.grade_level}
                      onChange={handleChange}
                      placeholder="เช่น 1, 2, 3"
                      min="1"
                      max="6"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">เลขห้อง *</label>
                    <input
                      type="number"
                      name="room_number"
                      value={formData.room_number}
                      onChange={handleChange}
                      placeholder="เช่น 1, 2, 3"
                      min="1"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">ปีการศึกษา *</label>
                    <input
                      type="text"
                      name="academic_year"
                      value={formData.academic_year}
                      onChange={handleChange}
                      placeholder="เช่น 2567"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block mb-1 text-sm font-medium">จำนวนที่นั่ง</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      placeholder="ไม่บังคับ"
                      min="1"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2 text-white transition-colors bg-pink-500 rounded-lg hover:bg-pink-600"
                  >
                    บันทึก
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-xl font-bold sm:text-2xl">กำหนดครูประจำชั้น</h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-500 transition-colors hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-4">
                <p className="mb-2 text-sm text-gray-600 sm:text-base">
                  ห้อง: <span className="font-semibold">{assigningRoom?.name}</span>
                </p>
                <p className="mb-4 text-sm text-gray-600 sm:text-base">
                  ครูประจำชั้นปัจจุบัน:{" "}
                  <span className={assigningRoom?.homeroom_teacher_name ? "font-semibold text-green-600" : "text-gray-400"}>
                    {assigningRoom?.homeroom_teacher_name || "ยังไม่มี"}
                  </span>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">เลือกครูประจำชั้น *</label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="">-- เลือกครู --</option>
                    {assigningRoom?.homeroom_teacher_name && (
                      <option value="remove" className="text-red-600">
                        ยกเลิกการกำหนดครูประจำชั้น
                      </option>
                    )}
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.full_name} - {teacher.subject_group}
                        {teacher.homeroom_room_name && ` (ปัจจุบัน: ${teacher.homeroom_room_name})`}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    • หากครูเป็นครูประจำชั้นอยู่แล้ว จะถูกย้ายมาที่ห้องนี้
                    {assigningRoom?.homeroom_teacher_name && (
                      <>
                        <br />• เลือก "ยกเลิกการกำหนดครูประจำชั้น" เพื่อลบครูออกจากห้องนี้
                      </>
                    )}
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-6 py-2 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleAssignSubmit}
                    className="px-6 py-2 text-white transition-colors bg-purple-500 rounded-lg hover:bg-purple-600"
                  >
                    กำหนดครู
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}