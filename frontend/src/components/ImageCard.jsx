import React from 'react';
import { Trash2, GripVertical, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

export default function ImageCard({
  item,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop
}) {
  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className="group relative bg-white rounded-xl border border-slate-200 hover:border-brand-400 p-3 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between select-none"
    >
      {/* Position Badge & Drag Handle */}
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100">
          {index + 1}
        </span>
        <div className="flex items-center gap-1">
          {/* Quick reorder buttons */}
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-slate-100"
            title="Move previous"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={index === total - 1}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-slate-100"
            title="Move next"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <span className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600">
            <GripVertical className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Image Thumbnail Preview */}
      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 border border-slate-100 flex items-center justify-center relative mb-2 group/img">
        {item.previewUrl ? (
          <img
            src={item.previewUrl}
            alt={item.file.name}
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <ImageIcon className="w-8 h-8 text-slate-300" />
        )}
      </div>

      {/* Filename & Size */}
      <div className="space-y-1">
        <p
          className="text-xs font-semibold text-slate-700 truncate"
          title={item.file.name}
        >
          {item.file.name}
        </p>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{formatBytes(item.file.size)}</span>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors"
            title="Remove image"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
