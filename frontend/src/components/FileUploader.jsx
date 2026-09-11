import React, { useState, useRef } from 'react';
import { UploadCloud, File, AlertCircle } from 'lucide-react';

export default function FileUploader({
  onFilesSelected,
  accept = '.pdf',
  multiple = false,
  maxSizeMB = 50,
  title = "Drag & drop your files here",
  subtitle = "or browse from your computer",
  description = "Supports PDF documents up to 50MB"
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const validateAndForward = (filesList) => {
    setErrorMessage('');
    const files = Array.from(filesList);

    if (files.length === 0) return;

    if (!multiple && files.length > 1) {
      setErrorMessage('Please upload only one file at a time.');
      return;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    for (const file of files) {
      if (file.size > maxSizeBytes) {
        setErrorMessage(`File "${file.name}" exceeds the maximum allowed size of ${maxSizeMB}MB.`);
        return;
      }
    }

    onFilesSelected(multiple ? files : files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndForward(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndForward(e.target.files);
    }
    // reset input so same file can be chosen again if needed
    e.target.value = '';
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center ${
          isDragOver
            ? 'border-brand-500 bg-brand-50/70 scale-[1.01] shadow-lg shadow-brand-500/10'
            : 'border-slate-300 hover:border-brand-400 bg-white hover:bg-slate-50/50 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${
          isDragOver ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30' : 'bg-brand-50 text-brand-600'
        }`}>
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg sm:text-xl font-semibold text-slate-800 tracking-tight mb-1">
          {title}
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          {subtitle}
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-600/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          <File className="w-4 h-4" />
          Browse Files
        </button>

        <p className="text-xs text-slate-400 mt-4">
          {description}
        </p>
      </div>

      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
