import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, UserCog, Phone, ArrowRight } from "lucide-react";

export default function Register({ onRegister }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    phone: "",
    role: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.phone || !form.role) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      setError("หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await onRegister({ phone: form.phone, role: form.role });
      
      if (result.success) {
        // Navigate to OTP verification with phone and role
        navigate("/verify-otp", { 
          state: { 
            phone: form.phone, 
            role: form.role,
            otp: result.otp // Only in development
          } 
        });
      } else {
        setError(result.message || "เกิดข้อผิดพลาดในการส่ง OTP");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการส่ง OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
            <svg className="w-16 h-16 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">สมัครสมาชิก</h1>
          <p className="text-gray-600">ลงทะเบียนเพื่อเข้าใช้งานระบบ</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                คุณต้องการลงทะเบียนในฐานะ
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'teacher', label: 'ครู', icon: User, color: 'blue' },
                  { value: 'student', label: 'นักเรียน', icon: User, color: 'pink' }
                ].map((roleOption) => {
                  const Icon = roleOption.icon;
                  return (
                    <button
                      key={roleOption.value}
                      type="button"
                      onClick={() => setForm({ ...form, role: roleOption.value })}
                      className={`p-5 rounded-xl border-2 transition-all ${
                        form.role === roleOption.value
                          ? `border-${roleOption.color}-500 bg-${roleOption.color}-50 shadow-md`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <Icon size={32} className={`text-${roleOption.color}-500`} />
                        <span className="font-medium">{roleOption.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">ข้อมูลสำคัญ:</p>
                  <ul className="space-y-1 list-disc list-inside text-xs">
                    <li>ครูและนักเรียนต้องได้รับการเพิ่มข้อมูลโดยแอดมินก่อน</li>
                    <li>ใช้หมายเลขโทรศัพท์ที่แอดมินลงทะเบียนไว้ให้</li>
                    <li>OTP จะถูกส่งไปยังหมายเลขโทรศัพท์ที่กรอก</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                หมายเลขโทรศัพท์
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Phone size={20} />
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
              <p className="mt-2 text-xs text-gray-500">
                กรุณาใช้หมายเลขโทรศัพท์ที่แอดมินลงทะเบียนไว้ให้
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !form.role || !form.phone}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center space-x-2 ${
                loading || !form.role || !form.phone
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>กำลังส่ง OTP...</span>
                </>
              ) : (
                <>
                  <span>ส่ง OTP</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              มีบัญชีอยู่แล้ว?{' '}
              <Link
                to="/login"
                className="text-pink-500 hover:text-pink-600 font-semibold hover:underline"
              >
                เข้าสู่ระบบ
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