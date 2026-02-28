"use client";

import { useShareFilters } from '../domain';

interface SharesFiltersProps {
  onNewShare: () => void;
}

export function SharesFilters({ onNewShare }: SharesFiltersProps) {
  const { filters, setSearchQuery, setStatusFilter, setAccessFilter } = useShareFilters();

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search documents..."
          className="input input-bordered w-full pl-10"
          value={filters.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <select 
        className="select select-bordered w-full sm:w-auto"
        value={filters.statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="expired">Expired</option>
      </select>
      <select 
        className="select select-bordered w-full sm:w-auto"
        value={filters.accessFilter}
        onChange={(e) => setAccessFilter(e.target.value)}
      >
        <option value="">All Access</option>
        <option value="public">Public</option>
        <option value="password">Password Protected</option>
        <option value="email_list">Email List</option>
      </select>
    </div>
  );
}