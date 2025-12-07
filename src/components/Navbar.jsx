import { LogOut, User } from "lucide-react";

export default function Navbar({ user, onLogout }) {
  return (
    <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">ระบบจัดการโรงเรียน</h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User size={20} />
            <span className="hidden sm:inline">
              {user?.full_name || user?.name || user?.phone}
            </span>
          </div>
          
          <button
            onClick={onLogout}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
}