import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import AuthLayout from "../../components/AuthLayout";

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

  // Success Screen
  if (success) {
    return (
      <AuthLayout>
        <div className="py-4 text-center sm:py-8">
          <div className="inline-block p-3 mb-3 bg-green-100 rounded-full sm:p-4 sm:mb-4">
            <CheckCircle className="w-12 h-12 text-green-500 sm:w-16 sm:h-16" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-800 sm:text-2xl">สำเร็จ!</h2>
          <p className="text-sm text-gray-600 sm:text-base">เปลี่ยนรหัสผ่านเรียบร้อยแล้ว</p>
          <div className="flex justify-center mt-3 sm:mt-4">
            <div className="w-5 h-5 border-b-2 border-pink-500 rounded-full sm:w-6 sm:h-6 animate-spin"></div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title={isFirstLogin ? "ตั้งรหัสผ่านใหม่" : "เปลี่ยนรหัสผ่าน"}
      subtitle={isFirstLogin ? "กรุณาตั้งรหัสผ่านใหม่เพื่อความปลอดภัย" : "เปลี่ยนรหัสผ่านของคุณ"}
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Error Message */}
        {error && (
          <div className="flex items-start px-3 py-2 space-x-2 text-red-700 border border-red-200 rounded-lg sm:px-4 sm:py-3 bg-red-50">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">{error}</span>
          </div>
        )}

        {/* Warning for first login */}
        {isFirstLogin && (
          <div className="flex items-start px-3 py-2 space-x-2 text-yellow-800 border border-yellow-200 rounded-lg sm:px-4 sm:py-3 bg-yellow-50">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 sm:w-5 sm:h-5" />
            <div className="text-xs sm:text-sm">
              <p className="mb-1 font-semibold">การเข้าสู่ระบบครั้งแรก</p>
              <p>กรุณาเปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชีของคุณ</p>
            </div>
          </div>
        )}

        {/* Old Password (if not first login) */}
        {!isFirstLogin && (
          <div>
            <label className="block mb-2 text-xs font-semibold text-gray-700 sm:text-sm">
              รหัสผ่านเดิม
            </label>
            <div className="relative">
              <div className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 sm:left-4">
                <Lock size={18} className="sm:w-5 sm:h-5" />
              </div>
              <input
                type={showPasswords.old ? "text" : "password"}
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base transition-colors border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => toggleShowPassword('old')}
                className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 sm:right-4 hover:text-gray-600"
              >
                {showPasswords.old ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
        )}

        {/* New Password */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-gray-700 sm:text-sm">
            รหัสผ่านใหม่
          </label>
          <div className="relative">
            <div className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 sm:left-4">
              <Lock size={18} className="sm:w-5 sm:h-5" />
            </div>
            <input
              type={showPasswords.new ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              className="w-full py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base transition-colors border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('new')}
              className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 sm:right-4 hover:text-gray-600"
            >
              {showPasswords.new ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-gray-700 sm:text-sm">
            ยืนยันรหัสผ่านใหม่
          </label>
          <div className="relative">
            <div className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 sm:left-4">
              <Lock size={18} className="sm:w-5 sm:h-5" />
            </div>
            <input
              type={showPasswords.confirm ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              className="w-full py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base transition-colors border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('confirm')}
              className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 sm:right-4 hover:text-gray-600"
            >
              {showPasswords.confirm ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Password Requirements */}
        <div className="p-3 rounded-lg sm:p-4 bg-gray-50">
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
          className={`w-full py-2.5 sm:py-3 rounded-xl font-semibold text-white text-sm sm:text-base transition-all flex items-center justify-center space-x-2 ${
            loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-b-2 border-white rounded-full sm:w-5 sm:h-5 animate-spin"></div>
              <span>กำลังดำเนินการ...</span>
            </>
          ) : (
            <>
              <CheckCircle size={18} className="sm:w-5 sm:h-5" />
              <span>ยืนยันการเปลี่ยนรหัสผ่าน</span>
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}