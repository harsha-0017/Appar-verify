import React from 'react';
import { UserRole } from '../types/apaar';
import { ShieldCheck, Building2, User, FileCheck, Layers, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  openAnomalyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  activeRole,
  onRoleChange,
  openAnomalyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              AV
            </div>
            <button
              onClick={() => onSelectTab('aicte')}
              className="text-left font-bold text-lg tracking-tight text-slate-900 whitespace-nowrap"
            >
              APAAR-VERIFY
            </button>
          </div>

          {/* Zone 2: Navigation Links (1-2 word single-line labels) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => {
                onRoleChange('aicte_officer');
                onSelectTab('aicte');
              }}
              className={`flex items-center gap-1.5 py-1 whitespace-nowrap shrink-0 transition-colors ${
                currentTab === 'aicte' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>AICTE Central</span>
              {openAnomalyCount > 0 && (
                <span className="text-xs px-1.5 py-0.2 bg-rose-100 text-rose-700 font-bold rounded">
                  {openAnomalyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onRoleChange('institution_admin');
                onSelectTab('institution');
              }}
              className={`flex items-center gap-1.5 py-1 whitespace-nowrap shrink-0 transition-colors ${
                currentTab === 'institution' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Institution Portal</span>
            </button>

            <button
              onClick={() => {
                onRoleChange('student');
                onSelectTab('student');
              }}
              className={`flex items-center gap-1.5 py-1 whitespace-nowrap shrink-0 transition-colors ${
                currentTab === 'student' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Student Card</span>
            </button>

            <button
              onClick={() => {
                onRoleChange('employer');
                onSelectTab('employer');
              }}
              className={`flex items-center gap-1.5 py-1 whitespace-nowrap shrink-0 transition-colors ${
                currentTab === 'employer' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Employer Verify</span>
            </button>

            <button
              onClick={() => onSelectTab('sih_spec')}
              className={`flex items-center gap-1.5 py-1 whitespace-nowrap shrink-0 transition-colors ${
                currentTab === 'sih_spec' ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' : 'hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>SIH-26263 Spec</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Persona Switcher Action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <span className="text-xs text-slate-500 font-medium px-2 hidden lg:inline">Active Persona:</span>
              <select
                aria-label="Active Persona Selector"
                value={activeRole}
                onChange={(e) => {
                  const role = e.target.value as UserRole;
                  onRoleChange(role);
                  if (role === 'aicte_officer') onSelectTab('aicte');
                  else if (role === 'institution_admin') onSelectTab('institution');
                  else if (role === 'student') onSelectTab('student');
                  else if (role === 'employer') onSelectTab('employer');
                }}
                className="text-xs font-semibold bg-white border border-slate-200 text-slate-800 rounded-md px-2.5 py-1.5 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="aicte_officer">AICTE Officer</option>
                <option value="institution_admin">College Admin</option>
                <option value="student">Student (Rahul Sharma)</option>
                <option value="employer">Employer (TCS HR)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
