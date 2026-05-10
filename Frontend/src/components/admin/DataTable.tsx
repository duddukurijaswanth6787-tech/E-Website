import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, AlertCircle } from 'lucide-react';
import { Loader } from '../common/Loader';
import { EmptyState } from '../common/EmptyState';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  renderer?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  searchable?: boolean;
  onRowClick?: (row: T) => void;
  // Visual tweaks
  embedded?: boolean;
  // Basic pagination config
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T>({ 
  columns, 
  data, 
  loading = false, 
  emptyMessage = "No records found",
  searchable = true,
  onRowClick,
  embedded = false,
  pagination
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');

  // Local static search if needed, otherwise parent handles via API
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(row => 
      Object.values(row as any).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  return (
    <div className={`overflow-hidden font-sans ${embedded ? '' : 'bg-white rounded-xl shadow-sm border border-gray-200'}`}>
      
      {/* Table Toolbar */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        {searchable && (
          <div className="relative w-full sm:w-72 border border-gray-300 rounded-lg overflow-hidden focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all bg-gray-50 flex items-center">
             <Search className="w-4 h-4 ml-3 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search records..." 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               className="w-full px-3 py-2 text-sm bg-transparent outline-none text-gray-700" 
             />
          </div>
        )}
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto">
             <Filter className="w-4 h-4 mr-2" /> Filters
          </button>
        </div>
      </div>

      {/* Responsive View - Desktop Table / Mobile Cards */}
      <div className="block">
        
        {/* Desktop Table - Hidden on small mobile */}
        <div className="hidden min-[431px]:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 border-b border-gray-200 uppercase tracking-wider text-[0.65rem] font-bold">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="px-6 py-4">{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                 <tr>
                   <td colSpan={columns.length} className="px-6 py-12">
                      <Loader message="Fetching table data..." />
                   </td>
                 </tr>
              ) : filteredData.length === 0 ? (
                 <tr>
                   <td colSpan={columns.length} className="px-6 py-12">
                      <EmptyState 
                        icon={AlertCircle} 
                        title="No Records Found" 
                        description={emptyMessage} 
                      />
                   </td>
                 </tr>
              ) : (
                 filteredData.map((row, rowIdx) => (
                   <tr 
                     key={rowIdx} 
                     onClick={() => onRowClick && onRowClick(row)}
                     className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-gray-50/80' : 'hover:bg-gray-50/50'}`}
                   >
                     {columns.map((col, colIdx) => {
                       let rawValue: any;
                       if (typeof col.accessor === 'function') {
                         rawValue = col.accessor(row);
                       } else {
                         rawValue = row[col.accessor];
                       }
                       const cellValue = col.renderer ? col.renderer(rawValue, row) : rawValue;
                       return (
                         <td key={colIdx} className="px-6 py-4 whitespace-nowrap">
                           {React.isValidElement(cellValue) ? cellValue : String(cellValue || '-')}
                         </td>
                       );
                     })}
                   </tr>
                 ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - Shown only on small mobile */}
        <div className="min-[431px]:hidden divide-y divide-gray-100 px-4 py-2">
           {loading ? (
              <div className="py-12">
                 <Loader message="Loading..." />
              </div>
           ) : filteredData.length === 0 ? (
              <div className="py-12">
                 <EmptyState 
                   icon={AlertCircle} 
                   title="No Records" 
                   description={emptyMessage} 
                 />
              </div>
           ) : (
              filteredData.map((row, rowIdx) => (
                <div 
                  key={rowIdx} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`py-4 space-y-3 ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col, colIdx) => {
                     let rawValue: any;
                     if (typeof col.accessor === 'function') {
                       rawValue = col.accessor(row);
                     } else {
                       rawValue = row[col.accessor];
                     }
                     const cellValue = col.renderer ? col.renderer(rawValue, row) : rawValue;
                     
                     return (
                        <div key={colIdx} className="flex flex-col gap-1">
                           <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">{col.header}</span>
                           <div className="text-sm font-medium text-gray-900 break-words">
                              {React.isValidElement(cellValue) ? cellValue : String(cellValue || '-')}
                           </div>
                        </div>
                     );
                  })}
                </div>
              ))
           )}
        </div>

      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm text-gray-500 bg-gray-50/50">
          <div className="max-w-[150px] sm:max-w-none">
            <span className="hidden sm:inline">Showing </span> 
            <span className="font-medium text-gray-900">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> 
            <span className="hidden sm:inline"> of </span>
            <span className="sm:hidden">/</span>
            <span className="font-medium text-gray-900">{pagination.total}</span>
          </div>
          <div className="flex gap-2">
            <button 
              disabled={pagination.page === 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button 
               disabled={pagination.page * pagination.limit >= pagination.total}
               onClick={() => pagination.onPageChange(pagination.page + 1)}
               className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
