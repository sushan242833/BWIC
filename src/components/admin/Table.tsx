import React from "react";

interface TableProps<T> {
  data: T[];
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  hiddenColumns?: string[];
}

export default function Table<T extends Record<string, any>>({
  data,
  onRowClick,
  onEdit,
  onDelete,
  hiddenColumns = [],
}: TableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 italic font-sans text-xl">
        No data available.
      </div>
    );
  }

  const headers = Object.keys(data[0]).filter(
    (header) => !hiddenColumns.includes(header),
  );

  return (
    <div
      className="w-full h-[70vh] overflow-auto rounded-2xl border border-gray-300 shadow-md bg-white"
      style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}
    >
      <table className="min-w-full text-sm table-fixed border-collapse">
        <thead className="sticky top-0 z-10 bg-slate-700 text-white">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-6 py-4 text-center text-base font-semibold tracking-wide border-b border-gray-700"
              >
                {header.charAt(0).toUpperCase() + header.slice(1)}
              </th>
            ))}
            <th className="px-6 py-4 text-center text-base font-semibold tracking-wide border-b border-gray-700">
              Action
            </th>
          </tr>
        </thead>
        <tbody
          className="divide-y divide-gray-200"
          style={{
            fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
          }}
        >
          {data.map((row, i) => (
            <tr
              key={i}
              className={`transition duration-150 ${
                onRowClick ? "cursor-pointer" : ""
              } even:bg-gray-50 hover:bg-gray-100`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {headers.map((header) => (
                <td
                  key={header}
                  className="px-6 py-3 text-center text-gray-800 whitespace-nowrap text-sm"
                >
                  {typeof row[header] === "object"
                    ? JSON.stringify(row[header])
                    : String(row[header])}
                </td>
              ))}
              <td className="px-6 py-3 text-center whitespace-nowrap">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(row);
                    }}
                    className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition shadow-sm cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(row);
                    }}
                    className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition shadow-sm cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
