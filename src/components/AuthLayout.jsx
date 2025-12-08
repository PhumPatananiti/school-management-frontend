export default function AuthLayout({ children, title, subtitle }) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="mb-6 text-center sm:mb-8">
            <div className="inline-block p-3 mb-3 bg-white rounded-full shadow-lg sm:p-4 sm:mb-4">
              <svg 
                className="w-12 h-12 text-pink-500 sm:w-16 sm:h-16" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                />
              </svg>
            </div>
            <h1 className="mb-1 text-2xl font-bold text-gray-800 sm:mb-2 sm:text-3xl">
              {title || "ระบบจัดการโรงเรียน"}
            </h1>
            <p className="text-sm text-gray-600 sm:text-base">
              {subtitle || "เข้าสู่ระบบเพื่อใช้งาน"}
            </p>
          </div>
  
          {/* Main Content Card */}
          <div className="p-6 bg-white shadow-xl sm:p-8 rounded-2xl">
            {children}
          </div>
  
          {/* Footer */}
          <div className="mt-4 text-xs text-center text-gray-500 sm:mt-6 sm:text-sm">
            <p>© 2025 ระบบจัดการโรงเรียน. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }