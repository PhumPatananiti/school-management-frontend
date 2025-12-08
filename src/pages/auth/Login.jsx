import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, LogIn, User, Lock, UserCog } from "lucide-react";
import AuthLayout from "../../components/AuthLayout";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    phone: "",
    password: "",
    role: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.phone || !form.password || !form.role) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      setError("หมายเลขโทรศัพท์ไม่ถูกต้อง");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log('🔄 Attempting login with:', { phone: form.phone, role: form.role });
      const result = await onLogin(form.phone, form.password, form.role);
      console.log('✅ Login result:', result);
      
      if (!result.success) {
        console.log('❌ Login failed:', result.message);
        setError(result.message || "หมายเลขโทรศัพท์หรือรหัสผ่านไม่ถูกต้อง");
        setLoading(false);
        return;
      }

      // Login successful
      console.log('✅ Login successful! isFirstLogin:', result.isFirstLogin);
      
      if (result.isFirstLogin) {
        console.log('➡️ Navigating to change-password');
        navigate("/change-password");
      } else {
        console.log('➡️ Navigating to:', `/${form.role}`);
        navigate(`/${form.role}`);
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch(form.role) {
      case 'admin': return <UserCog className="text-purple-500" size={24} />;
      case 'teacher': return <User className="text-blue-500" size={24} />;
      case 'student': return <User className="text-pink-500" size={24} />;
      default: return <User className="text-gray-500" size={24} />;
    }
  };

  return (
    <AuthLayout title="ระบบจัดการโรงเรียน" subtitle="เข้าสู่ระบบเพื่อใช้งาน">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Error Message */}
        {error && (
          <div className="flex items-start px-3 py-2 space-x-2 text-red-700 border border-red-200 rounded-lg sm:px-4 sm:py-3 bg-red-50">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-xs sm:text-sm">{error}</span>
          </div>
        )}

        {/* Role Selection */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-gray-700 sm:text-sm">
            เลือกบทบาท
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['admin', 'teacher', 'student'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ ...form, role })}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                  form.role === role
                    ? 'border-pink-500 bg-pink-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                  {role === 'admin' && <UserCog size={20} className="text-purple-500 sm:w-6 sm:h-6" />}
                  {role === 'teacher' && <User size={20} className="text-blue-500 sm:w-6 sm:h-6" />}
                  {role === 'student' && <User size={20} className="text-pink-500 sm:w-6 sm:h-6" />}
                  <span className="text-xs font-medium">
                    {role === 'admin' ? 'แอดมิน' : role === 'teacher' ? 'ครู' : 'นักเรียน'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Phone Input */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-gray-700 sm:text-sm">
            หมายเลขโทรศัพท์
          </label>
          <div className="relative">
            <div className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 sm:left-4">
              <User size={18} className="sm:w-5 sm:h-5" />
            </div>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="0000000000"
              maxLength="10"
              className="w-full py-2.5 sm:py-3 pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm sm:text-base transition-colors border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
              disabled={loading}
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-gray-700 sm:text-sm">
            รหัสผ่าน
          </label>
          <div className="relative">
            <div className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 sm:left-4">
              <Lock size={18} className="sm:w-5 sm:h-5" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base transition-colors border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 sm:right-4 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !form.role}
          className={`w-full py-2.5 sm:py-3 rounded-xl font-semibold text-white text-sm sm:text-base transition-all flex items-center justify-center space-x-2 ${
            loading || !form.role
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-b-2 border-white rounded-full sm:w-5 sm:h-5 animate-spin"></div>
              <span>กำลังเข้าสู่ระบบ...</span>
            </>
          ) : (
            <>
              <LogIn size={18} className="sm:w-5 sm:h-5" />
              <span>เข้าสู่ระบบ</span>
            </>
          )}
        </button>
      </form>

      {/* Register Link */}
      <div className="mt-5 text-center sm:mt-6">
        <p className="text-xs text-gray-600 sm:text-sm">
          ยังไม่มีบัญชี?{' '}
          <Link
            to="/register"
            className="font-semibold text-pink-500 hover:text-pink-600 hover:underline"
          >
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}