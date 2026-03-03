import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterBarProps {
  fields: FilterField[];
  onFilterChange: (filters: Record<string, string>) => void;
  className?: string;
}

export function FilterBar({ fields, onFilterChange, className = '' }: FilterBarProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className={`bg-white border-b border-gray-200 px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => handleFilterChange('search', e.target.value)}
              value={filters.search || ''}
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                {Object.keys(filters).length}
              </span>
            )}
          </button>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <X className="w-4 h-4" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fields.map((field) => (
            <div key={field.key} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              
              {field.type === 'select' ? (
                <div className="relative">
                  <select
                    value={filters[field.key] || ''}
                    onChange={(e) => handleFilterChange(field.key, e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  >
                    <option value="">All {field.label.toLowerCase()}</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  {filters[field.key] && (
                    <button
                      onClick={() => clearFilter(field.key)}
                      className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : field.type === 'date' ? (
                <input
                  type="date"
                  value={filters[field.key] || ''}
                  onChange={(e) => handleFilterChange(field.key, e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={filters[field.key] || ''}
                  onChange={(e) => handleFilterChange(field.key, e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}