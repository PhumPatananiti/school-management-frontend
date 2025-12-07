import { useState, useEffect } from "react";
import { Home, ClipboardCheck, BarChart3, Heart, Save, AlertCircle, CheckCircle, X, HomeIcon } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

export default function Health() {
  const [healthData, setHealthData] = useState({
    blood_type: '',
    height: '',
    weight: '',
    allergies: '',
    chronic_diseases: '',
    medications: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [bmi, setBmi] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const menuItems = [
    { path: "/student", icon: Home, label: "หน้าหลัก" },
    { path: "/student/attendance", icon: ClipboardCheck, label: "เช็คชื่อ" },
    { path: "/student/grades", icon: BarChart3, label: "ผลการเรียน" },
    { path: "/student/health", icon: Heart, label: "ข้อมูลสุขภาพ" },
    { path: "/student/homevisits", icon: HomeIcon, label: "การเยี่ยมบ้าน" },
  ];

  const bloodTypes = ['A', 'B', 'AB', 'O', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  useEffect(() => {
    calculateBMI();
  }, [healthData.height, healthData.weight]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const fetchHealth = async () => {
    try {
      const res = await API.getHealth();
      if (res.data.success && res.data.data) {
        setHealthData({
          blood_type: res.data.data.blood_type || '',
          height: res.data.data.height || '',
          weight: res.data.data.weight || '',
          allergies: res.data.data.allergies || '',
          chronic_diseases: res.data.data.chronic_diseases || '',
          medications: res.data.data.medications || '',
          emergency_contact_name: res.data.data.emergency_contact_name || '',
          emergency_contact_phone: res.data.data.emergency_contact_phone || '',
          notes: res.data.data.notes || ''
        });
      }
    } catch (error) {
      console.error("Error fetching health data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = () => {
    const height = parseFloat(healthData.height);
    const weight = parseFloat(healthData.weight);
    
    if (height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      setBmi(bmiValue);
    } else {
      setBmi(null);
    }
  };

  const getBMIStatus = (bmiValue) => {
    if (!bmiValue) return { text: '-', color: 'text-gray-500' };
    const bmi = parseFloat(bmiValue);
    if (bmi < 18.5) return { text: 'น้ำหนักน้อย', color: 'text-blue-600' };
    if (bmi < 23) return { text: 'น้ำหนักปกติ', color: 'text-green-600' };
    if (bmi < 25) return { text: 'น้ำหนักเกิน', color: 'text-yellow-600' };
    if (bmi < 30) return { text: 'โรคอ้วนระดับ 1', color: 'text-orange-600' };
    return { text: 'โรคอ้วนระดับ 2', color: 'text-red-600' };
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-numeric characters
    return value.replace(/\D/g, '');
  };

  const displayPhoneNumber = (phone) => {
    // Format for display (e.g., 0812345678 -> 081-234-5678)
    if (phone.length === 10) {
      return `${phone.substring(0, 3)}-${phone.substring(3, 6)}-${phone.substring(6)}`;
    }
    return phone;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'emergency_contact_phone') {
      const numericValue = formatPhoneNumber(value);
      setHealthData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setHealthData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await API.updateHealth(healthData);
      if (res.data.success) {
        showToast('บันทึกข้อมูลสำเร็จ', 'success');
      }
    } catch (error) {
      console.error("Error saving health data:", error);
      showToast(error.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้", 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-b-2 border-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const bmiStatus = getBMIStatus(bmi);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="flex">
        <Sidebar items={menuItems} role="student" />
        
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">ข้อมูลสุขภาพ</h2>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Basic Health Info */}
              <div className="p-6 mb-6 bg-white rounded-lg shadow">
                <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800">
                  <Heart className="w-5 h-5 text-pink-500" />
                  ข้อมูลพื้นฐาน
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Blood Type */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      กลุ่มเลือด
                    </label>
                    <select
                      name="blood_type"
                      value={healthData.blood_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="">เลือกกลุ่มเลือด</option>
                      {bloodTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      ส่วนสูง (ซม.)
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={healthData.height}
                      onChange={handleChange}
                      placeholder="ซม."
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      น้ำหนัก (กก.)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={healthData.weight}
                      onChange={handleChange}
                      placeholder="กก."
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* BMI Display */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      ดัชนีมวลกาย (BMI)
                    </label>
                    <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-800">
                          {bmi || '-'}
                        </span>
                        <span className={`text-sm font-medium ${bmiStatus.color}`}>
                          {bmiStatus.text}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="p-6 mb-6 bg-white rounded-lg shadow">
                <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  ข้อมูลทางการแพทย์
                </h3>

                <div className="space-y-4">
                  {/* Allergies */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      โรคภูมิแพ้ / อาการแพ้
                    </label>
                    <textarea
                      name="allergies"
                      value={healthData.allergies}
                      onChange={handleChange}
                      placeholder="เช่น แพ้ยาเพนิซิลิน, แพ้อาหารทะเล, แพ้ฝุ่น (ไม่มีใส่ - หรือปล่อยว่าง)"
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* Chronic Diseases */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      โรคประจำตัว
                    </label>
                    <textarea
                      name="chronic_diseases"
                      value={healthData.chronic_diseases}
                      onChange={handleChange}
                      placeholder="เช่น โรคหืด, โรคเบาหวาน, โรคหัวใจ (ไม่มีใส่ - หรือปล่อยว่าง)"
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* Medications */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      ยาที่ต้องรับประทานเป็นประจำ
                    </label>
                    <textarea
                      name="medications"
                      value={healthData.medications}
                      onChange={handleChange}
                      placeholder="เช่น ยาพ่นหืด, ยาโรคเบาหวาน (ไม่มีใส่ - หรือปล่อยว่าง)"
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-6 mb-6 bg-white rounded-lg shadow">
                <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  ผู้ติดต่อฉุกเฉิน
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Emergency Contact Name */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      ชื่อผู้ติดต่อฉุกเฉิน
                    </label>
                    <input
                      type="text"
                      name="emergency_contact_name"
                      value={healthData.emergency_contact_name}
                      onChange={handleChange}
                      placeholder="นาย/นาง ..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* Emergency Contact Phone */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      เบอร์โทรศัพท์ฉุกเฉิน
                    </label>
                    <input
                      type="tel"
                      name="emergency_contact_phone"
                      value={displayPhoneNumber(healthData.emergency_contact_phone)}
                      onChange={handleChange}
                      placeholder="xxx-xxx-xxxx"
                      maxLength="12"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      กรอกเฉพาะตัวเลข จะถูกจัดรูปแบบอัตโนมัติ
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="p-6 mb-6 bg-white rounded-lg shadow">
                <h3 className="mb-4 text-lg font-bold text-gray-800">
                  หมายเหตุเพิ่มเติม
                </h3>

                <textarea
                  name="notes"
                  value={healthData.notes}
                  onChange={handleChange}
                  placeholder="ข้อมูลเพิ่มเติมที่ต้องการให้โรงเรียนทราบ..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>

            {/* Info Box */}
            <div className="p-4 mt-6 border border-blue-200 rounded-lg bg-blue-50">
              <p className="text-sm text-blue-800">
                <strong>💡 คำแนะนำ:</strong> ข้อมูลสุขภาพของคุณจะถูกเก็บเป็นความลับและใช้เฉพาะในกรณีฉุกเฉินเท่านั้น 
                กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้องเพื่อความปลอดภัยของคุณเอง
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed z-50 top-4 right-4 animate-slide-in-right">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <X className="w-6 h-6" />
            )}
            <span className="font-medium">{toast.message}</span>
            <button 
              onClick={() => setToast({ show: false, message: '', type: '' })}
              className="ml-2 hover:opacity-80"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}