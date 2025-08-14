import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { TableProps, TableColumn } from '../../types';
import LoadingSpinner from './LoadingSpinner';

function Table<T extends { id: number }>({ 
  data, 
  columns, 
  loading = false, 
  onRowClick, 
  onSort 
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const handleSort = (key: keyof T) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;

    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  const getSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4" />
    ) : (
      <ChevronDownIcon className="h-4 w-4" />
    );
  };

  if (loading) {
    return (
      <div className="card">
        <LoadingSpinner message="Loading data..." />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table">
          <thead className="table-header">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`table-header-cell ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className="flex-shrink-0">
                        {getSortIcon(column.key)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table-body">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="table-cell text-center text-gray-500 py-8"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className={`table-row ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td key={String(column.key)} className="table-cell">
                      {column.render ? 
                        column.render(row[column.key], row) : 
                        String(row[column.key] || '-')
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;