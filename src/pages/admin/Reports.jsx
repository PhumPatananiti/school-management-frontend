import { Download, FileText, TrendingUp, Calendar } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";

export default function Reports() {
  const user = JSON.parse(localStorage.getItem("user"));

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
    <AdminLayout user={user} onLogout={handleLogout}>
      <h2 className="mb-6 text-2xl font-bold text-gray-800">รายงาน</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {reports.map((report, index) => {
          const Icon = report.icon;
          return (
            <div 
              key={index}
              className="p-6 transition-shadow bg-white border border-gray-100 shadow-lg rounded-xl hover:shadow-xl"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-4 rounded-lg ${colorClasses[report.color]}`}>
                  <Icon size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-bold text-gray-800">
                    {report.title}
                  </h3>
                  <p className="mb-4 text-sm text-gray-600">
                    {report.description}
                  </p>
                  <button className="flex items-center px-4 py-2 space-x-2 text-white transition-all rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
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
      <div className="p-6 mt-8 bg-white shadow-lg rounded-xl">
        <h3 className="mb-4 text-xl font-bold text-gray-800">
          ข้อมูลรายงาน
        </h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>• รายงานทั้งหมดจะแสดงข้อมูลล่าสุด ณ วันที่สร้างรายงาน</p>
          <p>• สามารถดาวน์โหลดรายงานในรูปแบบ PDF เพื่อเก็บไว้เป็นหลักฐาน</p>
          <p>• หากต้องการรายงานแบบกำหนดเอง กรุณาติดต่อผู้ดูแลระบบ</p>
        </div>
      </div>
    </AdminLayout>
  );
}