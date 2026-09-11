import React, { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  ArrowRight,
  Zap,
  Sparkles,
  Layers,
  ShieldCheck,
  ChevronDown,
  UploadCloud,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function Home({ onNavigate }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Can I convert multiple PDF pages to JPG?",
      a: "Yes! Each PDF page is converted into a crisp, high-resolution individual JPG image. You can download pages individually or all at once in a convenient ZIP archive."
    },
    {
      q: "Can I convert multiple JPG images into one PDF?",
      a: "Yes! You can upload multiple JPG, JPEG, or PNG images at once, visually reorder them with drag-and-drop, configure page orientation and margins, and merge them into a single PDF document."
    },
    {
      q: "Are my files stored?",
      a: "No. Your privacy is paramount. Uploaded and converted files are processed in a dedicated secure session and are automatically deleted immediately after download or after 30 minutes of retention."
    },
    {
      q: "Is there a file size limit?",
      a: "You can upload individual PDFs or batches of images up to 50MB per conversion request."
    },
    {
      q: "Can I select specific pages of a PDF to convert?",
      a: "Yes! You can either convert all pages or specify custom page ranges (such as 1, 3, 5-8) to extract only the pages you need."
    }
  ];

  const features = [
    {
      icon: Zap,
      title: "Fast Conversion",
      desc: "Convert documents and images in seconds with our optimized processing engine.",
      color: "from-amber-500/20 to-orange-500/10 text-amber-600"
    },
    {
      icon: Sparkles,
      title: "High Quality",
      desc: "Maintain crisp image details and customizable DPI settings up to 300 DPI for print quality.",
      color: "from-brand-500/20 to-indigo-500/10 text-brand-600"
    },
    {
      icon: Layers,
      title: "Multiple Files",
      desc: "Batch process up to 30 images simultaneously with intuitive drag-and-drop page reordering.",
      color: "from-blue-500/20 to-cyan-500/10 text-blue-600"
    },
    {
      icon: ShieldCheck,
      title: "Secure & Private",
      desc: "Zero permanent storage. Uploads and converted outputs are completely purged automatically.",
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-600"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Upload your file",
      desc: "Drag & drop your PDF document or images directly onto the upload zone."
    },
    {
      number: "02",
      title: "Choose conversion options",
      desc: "Tailor resolution, quality, page orientation, margins, or select specific pages."
    },
    {
      number: "03",
      title: "Download your converted file",
      desc: "Instantly download your output file, individual pages, or a single ZIP archive."
    }
  ];

  return (
    <div className="space-y-24 py-6 sm:py-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Professional Document Conversion Suite</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight mb-6">
          PDF <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">↔</span> JPG Converter
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-12">
          Convert your PDF files to high-quality JPG images and combine your JPG images into PDF documents — quickly and easily.
        </p>

        {/* Two Large Conversion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
          {/* PDF to JPG Card */}
          <div
            onClick={() => onNavigate('pdf-to-jpg')}
            className="group relative bg-white rounded-3xl p-8 border border-slate-200/80 hover:border-brand-500/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <FileText className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1 block">
                PDF Tool
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                PDF to JPG
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Convert PDF pages into JPG images with custom DPI and page range selection.
              </p>
            </div>

            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-white bg-rose-600 group-hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Convert PDF to JPG</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* JPG to PDF Card */}
          <div
            onClick={() => onNavigate('jpg-to-pdf')}
            className="group relative bg-white rounded-3xl p-8 border border-slate-200/80 hover:border-brand-500/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <ImageIcon className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1 block">
                Image Tool
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                JPG to PDF
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Convert JPG, JPEG or PNG images into a PDF with customizable layout and margins.
              </p>
            </div>

            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-white bg-brand-600 group-hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Convert JPG to PDF</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Privacy Notice Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 text-emerald-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1">
                Your Privacy is Guaranteed
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                Your files are processed securely and are automatically deleted after processing.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
              Zero Permanent Storage
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl mb-4">
            Everything You Need for Fast Conversion
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Built from the ground up for speed, quality, and complete privacy on desktop, tablet, and mobile.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-100/70 rounded-3xl py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2 block">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl mb-3">
            How It Works
          </h2>
          <p className="text-slate-600 text-base">
            Convert your files in three effortless steps without any registration required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
          {steps.map((step, idx) => (
            <div key={idx} className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <span className="text-4xl font-black text-brand-100 block mb-3">
                {step.number}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2 block">
            Common Questions
          </span>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none"
                >
                  <span className="text-base font-semibold text-slate-900 pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-brand-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
