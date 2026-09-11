import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Archive,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Settings2,
  Sparkles,
  AlertCircle,
  Eye,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import FileUploader from '../components/FileUploader';
import ProgressBar from '../components/ProgressBar';
import AlertModal from '../components/AlertModal';
import { fetchPdfInfo, convertPdfToJpg, triggerDownload } from '../services/api';

export default function PdfToJpg() {
  const [file, setFile] = useState(null);
  const [pdfMeta, setPdfMeta] = useState(null); // { pageCount, fileSizeFormatted, pages }
  const [isInspecting, setIsInspecting] = useState(false);

  // Conversion options
  const [quality, setQuality] = useState('high'); // 'low', 'medium', 'high'
  const [dpi, setDpi] = useState('150'); // '72', '150', '300'
  const [pageSelectionType, setPageSelectionType] = useState('all'); // 'all' or 'custom'
  const [pageRangeInput, setPageRangeInput] = useState('');

  // Conversion state
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('Uploading...');
  const [convertedResult, setConvertedResult] = useState(null);

  // Error modal
  const [errorMessage, setErrorMessage] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // When a file is chosen, inspect metadata (page count)
  const handleFileSelected = async (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      showError('Invalid file type. Please upload a PDF document (.pdf).');
      return;
    }

    setFile(selectedFile);
    setConvertedResult(null);
    setIsInspecting(true);

    try {
      const info = await fetchPdfInfo(selectedFile);
      setPdfMeta(info);
      setPageRangeInput(`1-${info.pageCount}`);
    } catch (err) {
      showError(err.message || 'Unable to inspect this PDF document.');
      setFile(null);
      setPdfMeta(null);
    } finally {
      setIsInspecting(false);
    }
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setIsAlertOpen(true);
  };

  // Run the conversion
  const handleConvert = async () => {
    if (!file) return;

    setIsConverting(true);
    setProgress(15);
    setProgressStatus('Uploading & preparing PDF pages...');

    // Progress simulation while server converts
    const totalPages = pdfMeta ? pdfMeta.pageCount : 1;
    let currentEstPage = 1;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const next = prev + Math.floor(Math.random() * 10) + 5;
        if (next > 40 && currentEstPage < totalPages) {
          currentEstPage = Math.min(totalPages, currentEstPage + 1);
          setProgressStatus(`Converting page ${currentEstPage} of ${totalPages}...`);
        }
        return Math.min(90, next);
      });
    }, 400);

    try {
      const options = {
        quality,
        dpi: parseInt(dpi, 10),
        pageRange: pageSelectionType === 'all' ? 'all' : pageRangeInput
      };

      const result = await convertPdfToJpg(file, options);

      clearInterval(interval);
      setProgress(100);
      setProgressStatus('Conversion complete!');

      setTimeout(() => {
        setConvertedResult(result);
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
      showError(err.message || 'Conversion failed. Please check the file and try again.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setPdfMeta(null);
    setConvertedResult(null);
    setIsConverting(false);
    setProgress(0);
    setPageSelectionType('all');
    setPageRangeInput('');
  };

  const handleDownloadAllZip = () => {
    if (convertedResult?.zipDownloadUrl) {
      triggerDownload(convertedResult.zipDownloadUrl, `${file.name.replace(/\.[^/.]+$/, "")}_pages.zip`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Title / Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-4">
          <FileText className="w-3.5 h-3.5" />
          <span>PDF to JPG Converter</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Convert PDF Pages into JPG Images
        </h1>
        <p className="text-slate-600 text-base">
          Extract high-resolution images from any PDF document with custom DPI and page range options.
        </p>
      </div>

      {/* Upload State or Options State */}
      {!file && !convertedResult && (
        <div className="max-w-2xl mx-auto">
          <FileUploader
            onFilesSelected={handleFileSelected}
            accept=".pdf,application/pdf"
            multiple={false}
            title="Drag & drop your PDF file here"
            subtitle="or browse from your computer"
            description="Supports all valid PDF documents up to 50MB"
          />
        </div>
      )}

      {/* Loading PDF Metadata State */}
      {isInspecting && (
        <div className="max-w-xl mx-auto text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center animate-spin mb-4">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            Analyzing PDF Document...
          </h3>
          <p className="text-sm text-slate-500">
            Reading page structure and verifying document integrity.
          </p>
        </div>
      )}

      {/* Selected File & Conversion Options */}
      {file && pdfMeta && !convertedResult && !isInspecting && (
        <div className="space-y-8 animate-fade-in">
          {/* File summary bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="truncate">
                <h3 className="text-base font-bold text-slate-800 truncate" title={file.name}>
                  {file.name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span>{pdfMeta.fileSizeFormatted}</span>
                  <span>•</span>
                  <span className="font-semibold text-brand-600">
                    {pdfMeta.pageCount} {pdfMeta.pageCount === 1 ? 'Page' : 'Pages'} detected
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              disabled={isConverting}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors w-full sm:w-auto"
            >
              Choose different file
            </button>
          </div>

          {/* Options Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Sliders className="w-5 h-5 text-brand-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Conversion Options
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Image Quality */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">
                  Image Quality
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'low', label: 'Low', desc: '60%' },
                    { id: 'medium', label: 'Medium', desc: '80%' },
                    { id: 'high', label: 'High', desc: '95%' },
                  ].map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setQuality(q.id)}
                      disabled={isConverting}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        quality === q.id
                          ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs block">{q.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{q.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution / DPI */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">
                  Image DPI (Resolution)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '72', label: '72 DPI', desc: 'Standard' },
                    { id: '150', label: '150 DPI', desc: 'Crisp' },
                    { id: '300', label: '300 DPI', desc: 'Print' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDpi(d.id)}
                      disabled={isConverting}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        dpi === d.id
                          ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs block">{d.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{d.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">
                  Pages to Convert
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPageSelectionType('all')}
                    disabled={isConverting}
                    className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                      pageSelectionType === 'all'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All Pages ({pdfMeta.pageCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageSelectionType('custom')}
                    disabled={isConverting}
                    className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                      pageSelectionType === 'custom'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Specific Pages
                  </button>
                </div>

                {pageSelectionType === 'custom' && (
                  <div className="pt-2 animate-fade-in">
                    <input
                      type="text"
                      value={pageRangeInput}
                      onChange={(e) => setPageRangeInput(e.target.value)}
                      placeholder={`e.g. 1, 3, 5-${pdfMeta.pageCount}`}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Example: 1, 3, 5-8 or 1-4
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress UI if converting */}
            {isConverting && (
              <div className="pt-4">
                <ProgressBar
                  progress={progress}
                  statusText={progressStatus}
                  totalPages={pdfMeta.pageCount}
                />
              </div>
            )}

            {/* Convert Action Button */}
            {!isConverting && (
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleConvert}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/30 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-base"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Convert to JPG</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results View */}
      {convertedResult && (
        <div className="space-y-8 animate-fade-in">
          {/* Header Action Banner */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-900">
                  Conversion Complete!
                </h3>
                <p className="text-xs text-emerald-700">
                  Successfully converted {convertedResult.convertedCount} {convertedResult.convertedCount === 1 ? 'page' : 'pages'} to JPG format.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors flex-1 sm:flex-initial"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Convert Another</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadAllZip}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all duration-150 flex-1 sm:flex-initial"
              >
                <Archive className="w-4 h-4" />
                <span>Download All (ZIP)</span>
              </button>
            </div>
          </div>

          {/* Generated JPG Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Generated Pages ({convertedResult.pages.length})
              </h3>
              <span className="text-xs text-slate-500">
                Click "Download" on any image to save individually.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {convertedResult.pages.map((p) => (
                <div
                  key={p.pageNumber}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                        Page {p.pageNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {p.fileSizeFormatted}
                      </span>
                    </div>

                    {/* Image Preview */}
                    <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 mb-3 relative group/preview">
                      <img
                        src={p.downloadUrl}
                        alt={`Page ${p.pageNumber}`}
                        className="w-full h-full object-contain p-2"
                        loading="lazy"
                      />
                      <a
                        href={p.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/preview:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        View Full Size
                      </a>
                    </div>
                  </div>

                  {/* Individual Download Button */}
                  <a
                    href={p.downloadUrl}
                    download={p.filename}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JPG</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error alert modal */}
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title="Processing Error"
        message={errorMessage}
      />
    </div>
  );
}
