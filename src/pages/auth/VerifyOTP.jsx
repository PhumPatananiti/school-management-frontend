import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import AuthLayout from "../../components/AuthLayout";

export default function VerifyOTP({ onVerify }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(300); // 5 minutes

  const phone = state?.phone;
  const role = state?.role;
  const devOtp = state?.otp; // Development only

  useEffect(() => {
    if (!phone || !role) {
      navigate("/register");
      return;
    }

    // Countdown timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phone, role, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    document.getElementById(`otp-${lastIndex}`).focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    const otpCode = otp.join("");

    // Validation
    if (otpCode.length !== 6) {
      setError("กรุณากรอก OTP ให้ครบ 6 หลัก");
      return;
    }

    if (!password) {
      setError("กรุณาตั้งรหัสผ่าน");
      return;
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      const result = await onVerify({
        phone,
        otp: otpCode,
        password,
        role
      });

      if (result.success) {
        // Show success message briefly before redirect
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setError(result.message || "OTP ไม่ถูกต้อง");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "OTP ไม่ถูกต้องหรือหมดอายุ");
    } finally {
      setLoading(false);
    }
  };

  if (!phone) {
    return null;
  }

  return (
    <AuthLayout 
      title="ยืนยัน OTP" 
      subtitle={
        <>
          รหัส OTP ถูกส่งไปยัง<br />
          <span className="font-semibold">{phone}</span>
        </>
      }
    >
      <form onSubmit={handleVerify} className="space-y-5 sm:space-y-6">
        {/* Error Message */}
        {error && (
          <div className="flex items-start px-3 py-2 space-x-2 text-red-700 border border-red-200 rounded-lg sm:px-4 sm:py-3 bg-red-50">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-xs sm:text-sm">{error}</span>
          </div>
        )}

        {/* Development OTP Display */}
        {devOtp && (
          <div className="px-3 py-2 text-yellow-800 border border-yellow-200 rounded-lg sm:px-4 sm:py-3 bg-yellow-50">
            <p className="text-xs font-semibold sm:text-sm">Development Mode</p>
            <p className="text-xs sm:text-sm">OTP: {devOtp}</p>
          </div>
        )}

        {/* Timer */}
        <div className="text-center">
          <p className="text-xs text-gray-600 sm:text-sm">
            OTP จะหมดอายุใน{' '}
            <span className={`font-semibold ${timer < 60 ? 'text-red-500' : 'text-green-500'}`}>
              {formatTime(timer)}
            </span>
          </p>
        </div>

        {/* OTP Input */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-center text-gray-700 sm:mb-3 sm:text-sm">
            กรอกรหัส OTP 6 หลัก
          </label>
          <div className="flex justify-center space-x-1.5 sm:space-x-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-12 text-xl font-bold text-center transition-colors border-2 border-gray-200 rounded-lg sm:w-12 sm:h-14 sm:text-2xl focus:outline-none focus:border-pink-500"
                disabled={loading}
              />
            ))}
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-gray-700 sm:text-sm">
            ตั้งรหัสผ่าน
          </label>
          <div className="relative">
            <div className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 sm:left-4">
              <Lock size={18} className="sm:w-5 sm:h-5" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              className="w-full py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
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

        {/* Confirm Password Input */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-gray-700 sm:text-sm">
            ยืนยันรหัสผ่าน
          </label>
          <div className="relative">
            <div className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2 sm:left-4">
              <Lock size={18} className="sm:w-5 sm:h-5" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              className="w-full py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 sm:right-4 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || timer === 0}
          className={`w-full py-2.5 sm:py-3 rounded-xl font-semibold text-white text-sm sm:text-base transition-all flex items-center justify-center space-x-2 ${
            loading || timer === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-b-2 border-white rounded-full sm:w-5 sm:h-5 animate-spin"></div>
              <span>กำลังยืนยัน...</span>
            </>
          ) : (
            <>
              <CheckCircle size={18} className="sm:w-5 sm:h-5" />
              <span>ยืนยันและสมัครสมาชิก</span>
            </>
          )}
        </button>

        {/* Resend OTP */}
        {timer === 0 && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-xs font-semibold text-pink-500 sm:text-sm hover:text-pink-600 hover:underline"
            >
              ส่ง OTP ใหม่
            </button>
          </div>
        )}
      </form>

      {/* Back Link */}
      <div className="mt-5 text-center sm:mt-6">
        <Link
          to="/register"
          className="text-xs text-gray-600 sm:text-sm hover:text-gray-800 hover:underline"
        >
          ← กลับไปหน้าลงทะเบียน
        </Link>
      </div>
    </AuthLayout>
  );
}