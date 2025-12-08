import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Phone, ArrowRight } from "lucide-react";
import AuthLayout from "../../components/AuthLayout";

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
    <AuthLayout title="สมัครสมาชิก" subtitle="ลงทะเบียนเพื่อเข้าใช้งานระบบ">
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
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
          <label className="block mb-2 text-xs font-semibold text-gray-700 sm:mb-3 sm:text-sm">
            คุณต้องการลงทะเบียนในฐานะ
          </label>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
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
                  className={`p-4 sm:p-5 rounded-xl border-2 transition-all ${
                    form.role === roleOption.value
                      ? roleOption.color === 'blue'
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-pink-500 bg-pink-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                    <Icon 
                      size={24} 
                      className={`sm:w-8 sm:h-8 ${
                        roleOption.color === 'blue' ? 'text-blue-500' : 'text-pink-500'
                      }`} 
                    />
                    <span className="text-sm font-medium sm:text-base">{roleOption.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info Box */}
        <div className="p-3 border border-blue-200 rounded-lg sm:p-4 bg-blue-50">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-xs text-blue-800 sm:text-sm">
              <p className="mb-1 font-semibold">ข้อมูลสำคัญ:</p>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>ครูและนักเรียนต้องได้รับการเพิ่มข้อมูลโดยแอดมินก่อน</li>
                <li>ใช้หมายเลขโทรศัพท์ที่แอดมินลงทะเบียนไว้ให้</li>
                <li>OTP จะถูกส่งไปยังหมายเลขโทรศัพท์ที่กรอก</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Phone Input */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-gray-700 sm:text-sm">
            หมายเลขโทรศัพท์
          </label>
          <div className="relative">
            <div className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 sm:left-4">
              <Phone size={18} className="sm:w-5 sm:h-5" />
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
          <p className="mt-2 text-xs text-gray-500">
            กรุณาใช้หมายเลขโทรศัพท์ที่แอดมินลงทะเบียนไว้ให้
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !form.role || !form.phone}
          className={`w-full py-2.5 sm:py-3 rounded-xl font-semibold text-white text-sm sm:text-base transition-all flex items-center justify-center space-x-2 ${
            loading || !form.role || !form.phone
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-b-2 border-white rounded-full sm:w-5 sm:h-5 animate-spin"></div>
              <span>กำลังส่ง OTP...</span>
            </>
          ) : (
            <>
              <span>ส่ง OTP</span>
              <ArrowRight size={18} className="sm:w-5 sm:h-5" />
            </>
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-5 text-center sm:mt-6">
        <p className="text-xs text-gray-600 sm:text-sm">
          มีบัญชีอยู่แล้ว?{' '}
          <Link
            to="/login"
            className="font-semibold text-pink-500 hover:text-pink-600 hover:underline"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}