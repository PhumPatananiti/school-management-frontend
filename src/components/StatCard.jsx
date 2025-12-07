export default function StatCard({ title, value, icon: Icon, color = "blue" }) {
    const colors = {
      blue: "text-blue-500 bg-blue-50",
      green: "text-green-500 bg-green-50",
      red: "text-red-500 bg-red-50",
      yellow: "text-yellow-500 bg-yellow-50"
    };
  
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">{title}</p>
            <p className={`text-3xl font-bold ${colors[color].split(' ')[0]}`}>
              {value}
            </p>
          </div>
          <div className={`p-3 rounded-full ${colors[color]}`}>
            <Icon size={24} />
          </div>
        </div>
      </div>
    );
  }