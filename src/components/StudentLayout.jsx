import { useState } from "react";
import { Home, CheckSquare, BookOpen, Heart, HomeIcon, Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function StudentLayout({ user, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Standard menu items for all student pages
  const menuItems = [
    { path: "/student", icon: Home, label: "หน้าหลัก" },
    { path: "/student/attendance", icon: CheckSquare, label: "การเข้าเรียน" },
    { path: "/student/grades", icon: BookOpen, label: "ผลการเรียน" },
    { path: "/student/health", icon: Heart, label: "ข้อมูลสุขภาพ" },
    { path: "/student/homevisits", icon: HomeIcon, label: "การเยี่ยมบ้าน" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="flex">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed z-40 p-3 text-white rounded-full shadow-lg bottom-4 right-4 bg-gradient-to-r from-pink-500 to-purple-500 lg:hidden"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed lg:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:transform-none ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <Sidebar items={menuItems} role="student" />
        </div>

        {/* Main Content - with mobile padding for floating button */}
        <div className="flex-1 w-full p-4 pb-20 sm:p-6 lg:pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}