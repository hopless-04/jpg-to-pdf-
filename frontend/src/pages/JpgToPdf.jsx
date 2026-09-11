import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  FileText,
  Download,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Sparkles,
  Plus,
  Trash2,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import FileUploader from '../components/FileUploader';
import ImageCard from '../components/ImageCard';
import ProgressBar from '../components/ProgressBar';
import AlertModal from '../components/AlertModal';
import { convertJpgToPdf, triggerDownload } from '../services/api';

export default function JpgToPdf() {
  const [imageList, setImageList] = useState([]); // [{ id, file, previewUrl }]
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Conversion Options
  const [pageSize, setPageSize] = useState('a4'); // 'a4', 'letter', 'legal', 'original'
  const [orientation, setOrientation] = useState('auto'); // 'portrait', 'landscape', 'auto'
  const [imageFit, setImageFit] = useState('fit'); // 'fit', 'fill', 'original'
  const [margin, setMargin] = useState('none'); // 'none', 'small', 'medium', 'large'
  const [pdfTitle, setPdfTitle] = useState('converted_document');

  // Conversion state
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('Uploading images...');
  const [convertedPdf, setConvertedPdf] = useState(null);

  // Error modal
  const [errorMessage, setErrorMessage] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imageList.forEach(item => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  const showError = (msg) => {
    setErrorMessage(msg);
    setIsAlertOpen(true);
  };

  const handleFilesSelected = (files) => {
    const validFiles = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const allowedExts = ['.jpg', '.jpeg', '.png'];

    for (const f of files) {
      const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
      if (allowedTypes.includes(f.type) || allowedExts.includes(ext)) {
        validFiles.push({
          id: `${Date.now()}-${Math.random()}`,
          file: f,
          previewUrl: URL.createObjectURL(f)
        });
      } else {
        showError(`File "${f.name}" is not a supported format. Please upload JPG or PNG images only.`);
        return;
      }
    }

    if (validFiles.length > 0) {
      setImageList(prev => [...prev, ...validFiles]);
      setConvertedPdf(null);
    }
  };

  const handleRemoveImage = (index) => {
    const item = imageList[index];
    if (item?.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
    setImageList(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    imageList.forEach(item => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setImageList([]);
    setConvertedPdf(null);
  };

  // Reordering helpers
  const handleMoveUp = (index) => {
    if (index === 0) return;
    setImageList(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
  };

  const handleMoveDown = (index) => {
    if (index === imageList.length - 1) return;
    setImageList(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
  };

  // Drag & drop reordering handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    setImageList(prev => {
      const updated = [...prev];
      const [draggedItem] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, draggedItem);
      return updated;
    });
    setDraggedIndex(null);
  };

  // Execute PDF generation
  const handleConvert = async () => {
    if (imageList.length === 0) return;

    setIsConverting(true);
    setProgress(20);
    setProgressStatus('Uploading images...');

    const total = imageList.length;
    let currentEst = 1;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        const next = prev + 15;
        if (currentEst < total) {
          currentEst = Math.min(total, currentEst + 1);
          setProgressStatus(`Assembling page ${currentEst} of ${total}...`);
        }
        return Math.min(90, next);
      });
    }, 350);

    try {
      const filesToUpload = imageList.map(item => item.file);
      const options = {
        pageSize,
        orientation,
        imageFit,
        margin,
        pdfName: pdfTitle.trim() || 'document',
        order: imageList.map(item => item.file.name)
      };

      const result = await convertJpgToPdf(filesToUpload, options);

      clearInterval(interval);
      setProgress(100);
      setProgressStatus('PDF generated successfully!');

      setTimeout(() => {
        setConvertedPdf(result);
        setIsConverting(false);
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (_) {}
      }, 500);

    } catch (err) {
      clearInterval(interval);
      setIsConverting(false);
      setProgress(0);
      showError(err.message || 'Failed to generate PDF. Please try again.');
    }
  };

  const handleReset = () => {
    handleClearAll();
    setConvertedPdf(null);
    setIsConverting(false);
    setProgress(0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-4">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>JPG to PDF Converter</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Convert JPG & PNG Images into a PDF
        </h1>
        <p className="text-slate-600 text-base">
          Upload multiple images, rearrange their sequence with drag-and-drop, and generate a customized PDF document.
        </p>
      </div>

      {/* Upload area if no images selected yet */}
      {imageList.length === 0 && !convertedPdf && (
        <div className="max-w-2xl mx-auto">
          <FileUploader
            onFilesSelected={handleFilesSelected}
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            multiple={true}
            title="Drag & drop your images here"
            subtitle="or browse from your computer"
            description="Supports JPG, JPEG, and PNG images up to 50MB (max 30 images)"
          />
        </div>
      )}

      {/* Interactive Image Arrangement & PDF Options */}
      {imageList.length > 0 && !convertedPdf && (
        <div className="space-y-8 animate-fade-in">
          {/* Top action bar: File count & add more */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                {imageList.length}
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {imageList.length} {imageList.length === 1 ? 'Image' : 'Images'} Selected
                </h3>
                <p className="text-xs text-slate-500">
                  Drag cards or use arrow buttons to rearrange the page sequence.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Add more images button */}
              <label className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors flex-1 sm:flex-initial">
                <Plus className="w-4 h-4" />
                <span>Add More</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  multiple
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFilesSelected(e.target.files);
                    }
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </label>

              {/* Clear all */}
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isConverting}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Draggable Images Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {imageList.map((item, idx) => (
              <ImageCard
                key={item.id}
                item={item}
                index={idx}
                total={imageList.length}
                onRemove={handleRemoveImage}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </div>

          {/* Options Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Sliders className="w-5 h-5 text-brand-600" />
              <h2 className="text-lg font-bold text-slate-900">
                PDF Page & Layout Options
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Page Size */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">
                  Page Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'a4', label: 'A4' },
                    { id: 'letter', label: 'Letter' },
                    { id: 'legal', label: 'Legal' },
                    { id: 'original', label: 'Original' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setPageSize(s.id)}
                      disabled={isConverting}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        pageSize === s.id
                          ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orientation */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">
                  Orientation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'auto', label: 'Auto' },
                    { id: 'portrait', label: 'Portrait' },
                    { id: 'landscape', label: 'Landscape' },
                  ].map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setOrientation(o.id)}
                      disabled={isConverting || pageSize === 'original'}
                      className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                        orientation === o.id
                          ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Fit */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">
                  Image Fit
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'fit', label: 'Fit Page' },
                    { id: 'fill', label: 'Fill Page' },
                    { id: 'original', label: 'Original' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setImageFit(f.id)}
                      disabled={isConverting}
                      className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                        imageFit === f.id
                          ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margins */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">
                  Margin
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'small', label: 'Small' },
                    { id: 'medium', label: 'Medium' },
                    { id: 'large', label: 'Large' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMargin(m.id)}
                      disabled={isConverting}
                      className={`py-2 px-1 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                        margin === m.id
                          ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Document Name input */}
            <div className="pt-2 max-w-sm">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Output PDF Filename
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  placeholder="converted_document"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
                <span className="text-xs font-semibold text-slate-400">.pdf</span>
              </div>
            </div>

            {/* Progress UI if converting */}
            {isConverting && (
              <div className="pt-4">
                <ProgressBar
                  progress={progress}
                  statusText={progressStatus}
                  totalPages={imageList.length}
                />
              </div>
            )}

            {/* Convert to PDF button */}
            {!isConverting && (
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleConvert}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/30 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-base"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Convert to PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Result Section */}
      {convertedPdf && (
        <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-lg text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">
                Your PDF is Ready!
              </h2>
              <p className="text-sm text-slate-500">
                All {convertedPdf.pageCount} {convertedPdf.pageCount === 1 ? 'image was' : 'images were'} successfully compiled into a PDF document.
              </p>
            </div>

            {/* PDF Details Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-around text-left">
              <div>
                <span className="text-xs text-slate-400 block">Filename</span>
                <span className="text-sm font-bold text-slate-800 truncate block max-w-[180px]">
                  {convertedPdf.filename}
                </span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-xs text-slate-400 block">Pages</span>
                <span className="text-sm font-bold text-slate-800">
                  {convertedPdf.pageCount}
                </span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-xs text-slate-400 block">File Size</span>
                <span className="text-sm font-bold text-slate-800">
                  {convertedPdf.fileSizeFormatted}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <a
                href={convertedPdf.downloadUrl}
                download={convertedPdf.filename}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/30 transition-all text-base"
              >
                <Download className="w-5 h-5" />
                <span>Download PDF</span>
              </a>

              <button
                type="button"
                onClick={handleReset}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Convert Another Batch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title="Processing Error"
        message={errorMessage}
      />
    </div>
  );
}
