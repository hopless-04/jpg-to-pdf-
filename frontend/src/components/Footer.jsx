import React from 'react';
import { ArrowLeftRight, ShieldCheck, Zap, Lock } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                PDF <span className="text-brand-600">↔</span> JPG Converter
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
              Convert your PDF files to high-quality JPG images and combine your JPG images into PDF documents — quickly, reliably, and completely free.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg w-fit border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Secure: Files are automatically deleted after processing.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Tools
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => { onNavigate('pdf-to-jpg'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-slate-600 hover:text-brand-600 transition-colors"
                >
                  PDF to JPG
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onNavigate('jpg-to-pdf'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-slate-600 hover:text-brand-600 transition-colors"
                >
                  JPG to PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onNavigate('how-it-works'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-slate-600 hover:text-brand-600 transition-colors"
                >
                  How It Works
                </button>
              </li>
            </ul>
          </div>

          {/* Security & Features */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Features
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-brand-500" />
                <span>Instant In-Memory/Local Pipeline</span>
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-brand-500" />
                <span>Zero File Retention</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                <span>High Resolution & DPI Options</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} PDF ↔ JPG Converter. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Client & Server Verification Built-in</span>
            <span>Privacy Guaranteed</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
