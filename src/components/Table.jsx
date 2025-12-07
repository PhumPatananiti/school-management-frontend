export default function Table({ columns, data, onEdit, onDelete }) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  จัดการ
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4">
                    {row[col.key] || "-"}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 text-center">
                    {onEdit && (
                      <button onClick={() => onEdit(row)} className="text-blue-500 mr-2">
                        แก้ไข
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(row)} className="text-red-500">
                        ลบ
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }