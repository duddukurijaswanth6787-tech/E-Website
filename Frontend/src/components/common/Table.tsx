import React from 'react';
import { cn } from '../../utils/cn';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const Table = ({ headers, children, className, containerClassName }: TableProps) => {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-gray-200", containerClassName)}>
      <table className={cn("min-w-full divide-y divide-gray-200", className)}>
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export const TableRow = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <tr 
    className={cn("hover:bg-gray-50 transition-colors", onClick && "cursor-pointer", className)}
    onClick={onClick}
  >
    {children}
  </tr>
);

export const TableCell = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <td className={cn("px-6 py-4 whitespace-nowrap text-sm text-gray-700", className)}>
    {children}
  </td>
);
