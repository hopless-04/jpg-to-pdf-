import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function HowItWorks({ onNavigate }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16 space-y-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-4">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Workflow & Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          How PDF ↔ JPG Converter Works
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Learn how our high-performance engine converts documents, preserves quality, and protects your data privacy at every step.
        </p>
      </div>

      {/* Two Workflows Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PDF to JPG Workflow */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-rose-600 tracking-wider">Workflow 1</span>
              <h2 className="text-xl font-bold text-slate-900">PDF to JPG Conversion</h2>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            When you upload a PDF, our server-side engine parses the document structure page-by-page:
          </p>

          <ol className="space-y-4 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                1
              </span>
              <div>
                <strong className="font-semibold text-slate-900 block">Document Parsing & Integrity Check</strong>
                We inspect the PDF binary header and check for encryption or passwords. If password-protected, you are notified right away.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                2
              </span>
              <div>
                <strong className="font-semibold text-slate-900 block">High-Resolution Canvas Rasterization</strong>
                Selected pages are rendered onto an HTML5 canvas at your chosen DPI (72, 150, or 300 DPI) using modern Skia graphics.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                3
              </span>
              <div>
                <strong className="font-semibold text-slate-900 block">JPEG Encoding & ZIP Packaging</strong>
                Canvases are encoded into high-fidelity JPEGs. An archive ZIP is generated so you can download all pages in one click.
              </div>
            </li>
          </ol>

          <button
            onClick={() => { onNavigate('pdf-to-jpg'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
          >
            <span>Try PDF to JPG</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* JPG to PDF Workflow */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-brand-600 tracking-wider">Workflow 2</span>
              <h2 className="text-xl font-bold text-slate-900">JPG to PDF Conversion</h2>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            When you upload multiple images, you have full control over the output layout:
          </p>

          <ol className="space-y-4 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                1
              </span>
              <div>
                <strong className="font-semibold text-slate-900 block">Interactive Visual Reordering</strong>
                Rearrange images into your preferred page sequence using drag-and-drop or arrow controls.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                2
              </span>
              <div>
                <strong className="font-semibold text-slate-900 block">Page Geometry & Fit Calculation</strong>
                Select page size (A4, Letter, Legal, or Original), orientation (Portrait, Landscape, or Auto), margins, and image fit.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                3
              </span>
              <div>
                <strong className="font-semibold text-slate-900 block">Direct Vector PDF Generation</strong>
                Images are embedded natively into a PDF document without quality degradation, ready for instant download.
              </div>
            </li>
          </ol>

          <button
            onClick={() => { onNavigate('jpg-to-pdf'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
          >
            <span>Try JPG to PDF</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quality & DPI Tips */}
      <div className="bg-gradient-to-tr from-brand-50 to-indigo-50 border border-brand-200/60 rounded-3xl p-8 space-y-6">
        <h3 className="text-xl font-bold text-slate-900">
          Tips for Optimal Conversion Quality
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="bg-white/80 rounded-2xl p-5 border border-brand-100">
            <span className="text-xs font-bold text-brand-600 uppercase block mb-1">72 DPI</span>
            <strong className="text-slate-800 font-semibold block mb-1">Web & Digital Viewing</strong>
            <p className="text-slate-600 text-xs leading-relaxed">
              Produces the smallest file size. Ideal for uploading to websites, emailing, or reading on standard monitors.
            </p>
          </div>
          <div className="bg-white/80 rounded-2xl p-5 border border-brand-100">
            <span className="text-xs font-bold text-brand-600 uppercase block mb-1">150 DPI (Recommended)</span>
            <strong className="text-slate-800 font-semibold block mb-1">Balanced Clarity & Size</strong>
            <p className="text-slate-600 text-xs leading-relaxed">
              Crisp text and vibrant imagery with balanced file size. Best for high-res Retina/4K screens and presentations.
            </p>
          </div>
          <div className="bg-white/80 rounded-2xl p-5 border border-brand-100">
            <span className="text-xs font-bold text-brand-600 uppercase block mb-1">300 DPI</span>
            <strong className="text-slate-800 font-semibold block mb-1">Print & Archival Quality</strong>
            <p className="text-slate-600 text-xs leading-relaxed">
              Ultra-high fidelity rendering matching professional printing presses. Best for posters, photo books, and legal documents.
            </p>
          </div>
        </div>
      </div>

      {/* Security & Privacy Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Security & Privacy Policy
            </h3>
            <p className="text-xs text-slate-500">
              How we treat your documents and data.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-600">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              Automatic Cleanup
            </h4>
            <p className="text-xs leading-relaxed">
              Uploaded files are removed immediately after conversion completes. Converted files are kept in an isolated session folder and automatically deleted by an hourly cleanup worker after 30 minutes.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              File Signature Inspection
            </h4>
            <p className="text-xs leading-relaxed">
              All uploads are verified against true binary headers (magic bytes) to guarantee they are genuine PDFs or images, preventing dangerous file disguised execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
