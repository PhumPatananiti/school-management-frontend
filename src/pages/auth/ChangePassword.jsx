import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

export default function ChangePassword({ onChangePassword, user, force = false }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isFirstLogin = force || user?.isFirstLogin;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const toggleShowPassword = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const validatePassword = () => {
    if (!isFirstLogin && !formData.oldPassword) {
      setError("กรุณากรอกรหัสผ่านเดิม");
      return false;
    }

    if (!formData.newPassword) {
      setError("กรุณากรอกรหัสผ่านใหม่");
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return false;
    }

    if (!isFirstLogin && formData.oldPassword === formData.newPassword) {
      setError("รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = isFirstLogin 
        ? { newPassword: formData.newPassword }
        : { oldPassword: formData.oldPassword, newPassword: formData.newPassword };

      const result = await onChangePassword(data);

      if (result.success) {
        setSuccess(true);
        
        // FIX: Always redirect to role dashboard after password change
        // The backend updates is_first_login to false, so we can navigate immediately
        setTimeout(() => {
          navigate(`/${user?.role || 'login'}`, { replace: true });
        }, 1500);
      } else {
        setError(result.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <div className="w-full max-w-md p-8 text-center bg-white shadow-xl rounded-2xl">
          <div className="inline-block p-4 mb-4 bg-green-100 rounded-full">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">สำเร็จ!</h2>
          <p className="text-gray-600">เปลี่ยนรหัสผ่านเรียบร้อยแล้ว</p>
          <div className="flex justify-center mt-4">
            <div className="w-6 h-6 border-b-2 border-pink-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block p-4 mb-4 bg-white rounded-full shadow-lg">
            <Lock className="w-16 h-16 text-pink-500" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            {isFirstLogin ? "ตั้งรหัสผ่านใหม่" : "เปลี่ยนรหัสผ่าน"}
          </h1>
          <p className="text-gray-600">
            {isFirstLogin 
              ? "กรุณาตั้งรหัสผ่านใหม่เพื่อความปลอดภัย" 
              : "เปลี่ยนรหัสผ่านของคุณ"}
          </p>
        </div>

        {/* Form */}
        <div className="p-8 bg-white shadow-xl rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="flex items-start px-4 py-3 space-x-2 text-red-700 border border-red-200 rounded-lg bg-red-50">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Warning for first login */}
            {isFirstLogin && (
              <div className="flex items-start px-4 py-3 space-x-2 text-yellow-800 border border-yellow-200 rounded-lg bg-yellow-50">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="mb-1 font-semibold">การเข้าสู่ระบบครั้งแรก</p>
                  <p>กรุณาเปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชีของคุณ</p>
                </div>
              </div>
            )}

            {/* Old Password (if not first login) */}
            {!isFirstLogin && (
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  รหัสผ่านเดิม
                </label>
                <div className="relative">
                  <div className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPasswords.old ? "text" : "password"}
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full py-3 pl-12 pr-12 transition-colors border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowPassword('old')}
                    className="absolute text-gray-400 -translate-y-1/2 right-4 top-1/2 hover:text-gray-600"
                  >
                    {showPasswords.old ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                รหัสผ่านใหม่
              </label>
              <div className="relative">
                <div className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2">
                  <Lock size={20} />
                </div>
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className="w-full py-3 pl-12 pr-12 transition-colors border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('new')}
                  className="absolute text-gray-400 -translate-y-1/2 right-4 top-1/2 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                ยืนยันรหัสผ่านใหม่
              </label>
              <div className="relative">
                <div className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2">
                  <Lock size={20} />
                </div>
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  className="w-full py-3 pl-12 pr-12 transition-colors border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('confirm')}
                  className="absolute text-gray-400 -translate-y-1/2 right-4 top-1/2 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="mb-2 text-xs font-semibold text-gray-700">ข้อกำหนดรหัสผ่าน:</p>
              <ul className="space-y-1 text-xs text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${formData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>มีอย่างน้อย 6 ตัวอักษร</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${formData.newPassword === formData.confirmPassword && formData.newPassword ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>รหัสผ่านตรงกัน</span>
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center space-x-2 ${
                loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
                  <span>กำลังดำเนินการ...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  <span>ยืนยันการเปลี่ยนรหัสผ่าน</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}