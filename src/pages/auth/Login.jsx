import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, LogIn, User, Lock, UserCog } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
            <svg className="w-16 h-16 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ระบบจัดการโรงเรียน</h1>
          <p className="text-gray-600">เข้าสู่ระบบเพื่อใช้งาน</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                เลือกบทบาท
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['admin', 'teacher', 'student'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm({ ...form, role })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      form.role === role
                        ? 'border-pink-500 bg-pink-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      {role === 'admin' && <UserCog size={24} className="text-purple-500" />}
                      {role === 'teacher' && <User size={24} className="text-blue-500" />}
                      {role === 'student' && <User size={24} className="text-pink-500" />}
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                หมายเลขโทรศัพท์
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={20} />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0812345678"
                  maxLength="10"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !form.role}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center space-x-2 ${
                loading || !form.role
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>กำลังเข้าสู่ระบบ...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>เข้าสู่ระบบ</span>
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ยังไม่มีบัญชี?{' '}
              <Link
                to="/register"
                className="text-pink-500 hover:text-pink-600 font-semibold hover:underline"
              >
                สมัครสมาชิก
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2024 ระบบจัดการโรงเรียน. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}