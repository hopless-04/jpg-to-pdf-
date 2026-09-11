import React from 'react';
import { Loader2 } from 'lucide-react';

export default function ProgressBar({
  progress = 0,
  statusText = 'Processing...',
  subText = '',
  currentPage = null,
  totalPages = null
}) {
  const percentage = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-800">
            {statusText}
          </span>
        </div>
        <span className="text-sm font-bold text-brand-600">
          {percentage}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner mb-2">
        <div
          className="bg-gradient-to-r from-brand-500 to-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div>
          {currentPage && totalPages ? (
            <span className="font-medium text-slate-700">
              Converting page <span className="text-brand-600 font-bold">{currentPage}</span> of {totalPages}...
            </span>
          ) : (
            <span>{subText || 'Please keep this window open while processing...'}</span>
          )}
        </div>
        <span className="text-slate-400">
          {percentage === 100 ? 'Finalizing...' : 'Working...'}
        </span>
      </div>
    </div>
  );
}
