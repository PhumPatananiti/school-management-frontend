import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, X, Home, Users, BookOpen, BarChart3 } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    subject_group: "",
    password: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));

  const menuItems = [
    { path: "/admin", icon: Home, label: "หน้าหลัก" },
    { path: "/admin/teachers", icon: Users, label: "จัดการครู" },
    { path: "/admin/students", icon: Users, label: "จัดการนักเรียน" },
    { path: "/admin/classes", icon: BookOpen, label: "จัดการห้องเรียน" },
    { path: "/admin/reports", icon: BarChart3, label: "รายงาน" },
  ];

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await API.getTeachers({ search: searchTerm });
      setTeachers(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      alert("ไม่สามารถดึงข้อมูลครูได้");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchTeachers();
  };

  const handleCreate = () => {
    setEditingTeacher(null);
    setFormData({
      full_name: "",
      phone: "",
      email: "",
      address: "",
      subject_group: "",
      password: "",
    });
    setShowModal(true);
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      full_name: teacher.full_name,
      phone: teacher.phone,
      email: teacher.email || "",
      address: teacher.address || "",
      subject_group: teacher.subject_group,
      password: "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`คุณต้องการลบครู ${name} หรือไม่?`)) return;

    try {
      await API.deleteTeacher(id);
      alert("ลบครูสำเร็จ");
      fetchTeachers();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      alert(error.response?.data?.message || "ไม่สามารถลบครูได้");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTeacher) {
        await API.updateTeacher(editingTeacher.id, formData);
        alert("แก้ไขข้อมูลครูสำเร็จ");
      } else {
        if (!formData.password) {
          alert("กรุณาใส่รหัสผ่าน");
          return;
        }
        await API.createTeacher(formData);
        alert("เพิ่มครูสำเร็จ");
      }
      setShowModal(false);
      fetchTeachers();
    } catch (error) {
      console.error("Error saving teacher:", error);
      alert(error.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="flex">
        <Sidebar items={menuItems} role="admin" />
        
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">จัดการข้อมูลครู</h2>
            <button
              onClick={handleCreate}
              className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>เพิ่มครูใหม่</span>
            </button>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="ค้นหาครู..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                ค้นหา
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ชื่อ-นามสกุล
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      กลุ่มสาระ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      เบอร์โทร
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      อีเมล
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {teachers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        ไม่พบข้อมูลครู
                      </td>
                    </tr>
                  ) : (
                    teachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{teacher.full_name}</td>
                        <td className="px-6 py-4">{teacher.subject_group}</td>
                        <td className="px-6 py-4">{teacher.phone}</td>
                        <td className="px-6 py-4">{teacher.email || "-"}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="text-blue-500 hover:text-blue-700 mr-3"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher.id, teacher.full_name)}
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">
                      {editingTeacher ? "แก้ไขข้อมูลครู" : "เพิ่มครูใหม่"}
                    </h3>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          ชื่อ-นามสกุล *
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          เบอร์โทร *
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
                          disabled={editingTeacher}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">อีเมล</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          กลุ่มสาระการเรียนรู้ *
                        </label>
                        <select
                          name="subject_group"
                          value={formData.subject_group}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                          required
                        >
                          <option value="">เลือกกลุ่มสาระ</option>
                          <option value="ภาษาไทย">ภาษาไทย</option>
                          <option value="คณิตศาสตร์">คณิตศาสตร์</option>
                          <option value="วิทยาศาสตร์">วิทยาศาสตร์</option>
                          <option value="สังคมศึกษา">สังคมศึกษา</option>
                          <option value="ภาษาต่างประเทศ">ภาษาต่างประเทศ</option>
                          <option value="สุขศึกษา">สุขศึกษาและพลศึกษา</option>
                          <option value="ศิลปะ">ศิลปะ</option>
                          <option value="การงานอาชีพ">การงานอาชีพ</option>
                        </select>
                      </div>

                      {!editingTeacher && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            รหัสผ่าน *
                          </label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                            minLength="6"
                            required={!editingTeacher}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">ที่อยู่</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                      ></textarea>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
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
                        className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                      >
                        บันทึก
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}