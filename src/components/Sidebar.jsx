import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ items, role }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
          {role === 'admin' && 'Admin Panel'}
          {role === 'teacher' && 'Teacher Panel'}
          {role === 'student' && 'Student Panel'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {role === 'admin' && 'ระบบจัดการ'}
          {role === 'teacher' && 'ระบบครู'}
          {role === 'student' && 'ระบบนักเรียน'}
        </p>
      </div>

      {/* Navigation Items */}
      <nav className="p-4 space-y-2">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}