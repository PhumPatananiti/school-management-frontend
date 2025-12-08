import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
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
    <AdminLayout user={user} onLogout={handleLogout}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">จัดการข้อมูลครู</h2>
        <button
          onClick={handleCreate}
          className="flex items-center px-4 py-2 space-x-2 text-white bg-pink-500 rounded-lg hover:bg-pink-600"
        >
          <Plus size={20} />
          <span>เพิ่มครูใหม่</span>
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
              placeholder="ค้นหาครู..."
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
                  ชื่อ-นามสกุล
                </th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                  กลุ่มสาระ
                </th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                  เบอร์โทร
                </th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                  อีเมล
                </th>
                <th className="px-6 py-3 text-xs font-medium text-center text-gray-500 uppercase">
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
                        className="mr-3 text-blue-500 hover:text-blue-700"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
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
                    <label className="block mb-1 text-sm font-medium">
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
                    <label className="block mb-1 text-sm font-medium">อีเมล</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">
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
                      <label className="block mb-1 text-sm font-medium">
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
                  <label className="block mb-1 text-sm font-medium">ที่อยู่</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-4 space-x-2">
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