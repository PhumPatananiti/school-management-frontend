import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
            <Lock className="w-16 h-16 text-pink-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ยืนยัน OTP</h1>
          <p className="text-gray-600">
            รหัส OTP ถูกส่งไปยัง<br />
            <span className="font-semibold">{phone}</span>
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleVerify} className="space-y-6">
            {/* Error/Success Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Development OTP Display */}
            {devOtp && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                <p className="text-sm font-semibold">Development Mode</p>
                <p className="text-sm">OTP: {devOtp}</p>
              </div>
            )}

            {/* Timer */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                OTP จะหมดอายุใน{' '}
                <span className={`font-semibold ${timer < 60 ? 'text-red-500' : 'text-green-500'}`}>
                  {formatTime(timer)}
                </span>
              </p>
            </div>

            {/* OTP Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                กรอกรหัส OTP 6 หลัก
              </label>
              <div className="flex justify-center space-x-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ตั้งรหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
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

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ยืนยันรหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || timer === 0}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center space-x-2 ${
                loading || timer === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>กำลังยืนยัน...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
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
                  className="text-sm text-pink-500 hover:text-pink-600 font-semibold hover:underline"
                >
                  ส่ง OTP ใหม่
                </button>
              </div>
            )}
          </form>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link
              to="/register"
              className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
            >
              ← กลับไปหน้าลงทะเบียน
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}