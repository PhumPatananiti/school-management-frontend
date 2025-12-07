import { Home, Users, BookOpen, BarChart3, Download, FileText, TrendingUp, Calendar } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function Reports() {
  const user = JSON.parse(localStorage.getItem("user"));

  const menuItems = [
    { path: "/admin", icon: Home, label: "หน้าหลัก" },
    { path: "/admin/teachers", icon: Users, label: "จัดการครู" },
    { path: "/admin/students", icon: Users, label: "จัดการนักเรียน" },
    { path: "/admin/classes", icon: BookOpen, label: "จัดการห้องเรียน" },
    { path: "/admin/reports", icon: BarChart3, label: "รายงาน" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const reports = [
    {
      title: "รายงานการเข้าเรียน",
      description: "ข้อมูลการเข้าเรียนของนักเรียนทั้งหมด",
      icon: Calendar,
      color: "blue"
    },
    {
      title: "รายงานผลการเรียน",
      description: "สรุปผลการเรียนและคะแนนเฉลี่ย",
      icon: TrendingUp,
      color: "green"
    },
    {
      title: "รายงานข้อมูลครู",
      description: "ข้อมูลครูและภาระงานสอน",
      icon: FileText,
      color: "purple"
    },
    {
      title: "รายงานข้อมูลนักเรียน",
      description: "สถิติและข้อมูลนักเรียนทั้งหมด",
      icon: FileText,
      color: "pink"
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    pink: 'bg-pink-50 text-pink-600 border-pink-200',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="flex">
        <Sidebar items={menuItems} role="admin" />
        
        <div className="flex-1 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">รายงาน</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report, index) => {
              const Icon = report.icon;
              return (
                <div 
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-4 rounded-lg ${colorClasses[report.color]}`}>
                      <Icon size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {report.description}
                      </p>
                      <button className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all">
                        <Download size={18} />
                        <span>ดาวน์โหลด PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              ข้อมูลรายงาน
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• รายงานทั้งหมดจะแสดงข้อมูลล่าสุด ณ วันที่สร้างรายงาน</p>
              <p>• สามารถดาวน์โหลดรายงานในรูปแบบ PDF เพื่อเก็บไว้เป็นหลักฐาน</p>
              <p>• หากต้องการรายงานแบบกำหนดเอง กรุณาติดต่อผู้ดูแลระบบ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}