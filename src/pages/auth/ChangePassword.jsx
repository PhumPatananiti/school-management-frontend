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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">สำเร็จ!</h2>
          <p className="text-gray-600">เปลี่ยนรหัสผ่านเรียบร้อยแล้ว</p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
            <Lock className="w-16 h-16 text-pink-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isFirstLogin ? "ตั้งรหัสผ่านใหม่" : "เปลี่ยนรหัสผ่าน"}
          </h1>
          <p className="text-gray-600">
            {isFirstLogin 
              ? "กรุณาตั้งรหัสผ่านใหม่เพื่อความปลอดภัย" 
              : "เปลี่ยนรหัสผ่านของคุณ"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Warning for first login */}
            {isFirstLogin && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">การเข้าสู่ระบบครั้งแรก</p>
                  <p>กรุณาเปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชีของคุณ</p>
                </div>
              </div>
            )}

            {/* Old Password (if not first login) */}
            {!isFirstLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  รหัสผ่านเดิม
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPasswords.old ? "text" : "password"}
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowPassword('old')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.old ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                รหัสผ่านใหม่
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('new')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ยืนยันรหัสผ่านใหม่
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('confirm')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-700 mb-2">ข้อกำหนดรหัสผ่าน:</p>
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
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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