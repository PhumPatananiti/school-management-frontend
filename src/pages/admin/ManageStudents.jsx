import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import API from "../../services/api";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    student_id: "",
    room_id: "",
    student_number: "",
    parent_id: ""
  });

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchStudents();
    fetchRooms();
    fetchParents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await API.getStudents({ search: searchTerm });
      console.log("Fetch students response:", response);
      setStudents(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("ไม่สามารถดึงข้อมูลนักเรียนได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await API.getRooms();
      console.log("Fetch rooms response:", response);
      setRooms(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchParents = async () => {
    try {
      const response = await API.getParents();
      console.log("Fetch parents response:", response);
      setParents(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error fetching parents:", error);
    }
  };

  const handleSearch = () => {
    fetchStudents();
  };

  const handleCreate = () => {
    setEditingStudent(null);
    setFormData({
      full_name: "",
      phone: "",
      student_id: "",
      room_id: "",
      student_number: "",
      parent_id: ""
    });
    setShowModal(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      full_name: student.full_name,
      phone: student.phone,
      student_id: student.student_id,
      room_id: student.room_id || "",
      student_number: student.student_number || "",
      parent_id: student.parent_id || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`คุณต้องการลบนักเรียน ${name} หรือไม่?`)) return;

    try {
      await API.deleteStudent(id);
      alert("ลบนักเรียนสำเร็จ");
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      alert(error.response?.data?.message || "ไม่สามารถลบนักเรียนได้");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clean phone number - remove any spaces, dashes, or special characters
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');

    // Validation
    if (!formData.student_id || !formData.full_name || !cleanPhone || !formData.room_id) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (รหัสนักเรียน, ชื่อ-นามสกุล, เบอร์โทร, ห้องเรียน)");
      return;
    }

    // Validate phone number format
    if (cleanPhone.length !== 10) {
      alert("เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักเท่านั้น");
      return;
    }

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      alert("เบอร์โทรศัพท์ไม่ถูกต้อง กรุณากรอกเฉพาะตัวเลข 10 หลัก");
      return;
    }

    // Validate student_id is not empty and has no spaces
    const cleanStudentId = formData.student_id.trim();
    if (!cleanStudentId) {
      alert("กรุณากรอกรหัสนักเรียน");
      return;
    }

    // Prepare data - remove empty optional fields
    const submitData = {
      full_name: formData.full_name.trim(),
      phone: cleanPhone,
      student_id: cleanStudentId,
      room_id: parseInt(formData.room_id),
    };

    // Only add optional fields if they have values
    if (formData.student_number && formData.student_number !== "") {
      const studentNum = parseInt(formData.student_number);
      if (!isNaN(studentNum) && studentNum > 0) {
        submitData.student_number = studentNum;
      }
    }
    
    if (formData.parent_id && formData.parent_id !== "") {
      submitData.parent_id = parseInt(formData.parent_id);
    }

    try {
      if (editingStudent) {
        console.log("Updating student with data:", submitData);
        const response = await API.updateStudent(editingStudent.id, submitData);
        console.log("Update student response:", response);
        alert("แก้ไขข้อมูลนักเรียนสำเร็จ");
      } else {
        console.log("Creating student with data:", submitData);
        const response = await API.createStudent(submitData);
        console.log("Create student response:", response);
        alert("เพิ่มนักเรียนสำเร็จ");
      }
      setShowModal(false);
      fetchStudents();
    } catch (error) {
      console.error("Error saving student:", error);
      console.error("Error details:", error.response);
      
      // Enhanced error display
      let errorMessage = "ไม่สามารถบันทึกข้อมูลได้";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number - only allow digits
    if (name === "phone") {
      const digitsOnly = value.replace(/[^0-9]/g, '');
      setFormData({
        ...formData,
        [name]: digitsOnly
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <AdminLayout user={user} onLogout={handleLogout}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">จัดการข้อมูลนักเรียน</h2>
        <button
          onClick={handleCreate}
          className="flex items-center px-4 py-2 space-x-2 text-white bg-pink-500 rounded-lg hover:bg-pink-600"
        >
          <Plus size={20} />
          <span>เพิ่มนักเรียนใหม่</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute text-gray-400 left-3 top-3" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="ค้นหานักเรียน..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            ค้นหา
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-b-2 border-pink-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                  รหัสนักเรียน
                </th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                  ชื่อ-นามสกุล
                </th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                  ห้อง
                </th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                  เบอร์โทร
                </th>
                <th className="px-6 py-3 text-xs font-medium text-center text-gray-500 uppercase">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    ไม่พบข้อมูลนักเรียน
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{student.student_id}</td>
                    <td className="px-6 py-4">{student.full_name}</td>
                    <td className="px-6 py-4">{student.room_name || "-"}</td>
                    <td className="px-6 py-4">{student.phone}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleEdit(student)}
                        className="mr-3 text-blue-500 hover:text-blue-700"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id, student.full_name)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">
                  {editingStudent ? "แก้ไขข้อมูลนักเรียน" : "เพิ่มนักเรียนใหม่"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      รหัสนักเรียน <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                      required
                      disabled={editingStudent}
                      placeholder="เช่น S001"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      ชื่อ-นามสกุล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                      required
                      placeholder="เช่น เด็กชายสมชาย ใจดี"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      เบอร์โทร <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                      pattern="[0-9]{10}"
                      maxLength="10"
                      required
                      disabled={editingStudent}
                      placeholder="0812345678"
                    />
                    <p className="mt-1 text-xs text-gray-500">กรอกเฉพาะตัวเลข 10 หลัก</p>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      ห้องเรียน <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="room_id"
                      value={formData.room_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                      required
                    >
                      <option value="">เลือกห้อง</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      เลขที่
                    </label>
                    <input
                      type="number"
                      name="student_number"
                      value={formData.student_number}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                      min="1"
                      placeholder="เช่น 1"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      ผู้ปกครอง
                    </label>
                    <select
                      name="parent_id"
                      value={formData.parent_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                    >
                      <option value="">ไม่ระบุ</option>
                      {parents.map((parent) => (
                        <option key={parent.id} value={parent.id}>
                          {parent.full_name} ({parent.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 space-x-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2 text-white bg-pink-500 rounded-lg hover:bg-pink-600"
                  >
                    บันทึก
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