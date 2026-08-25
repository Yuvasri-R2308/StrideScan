"use client";

import React, { useState, useRef } from "react";
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Sparkles, 
  Image as ImageIcon, 
  UserCheck, 
  History, 
  Layers,
  ArrowRight,
  FileCheck,
  RefreshCw
} from "lucide-react";

interface PatientAnalysisProps {
  onAnalyze: (file: File) => void;
  onViewDemo: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const PatientAnalysis: React.FC<PatientAnalysisProps> = ({
  onAnalyze,
  onViewDemo,
  isLoading,
  error,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onAnalyze(selectedFile);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
          Patient Intake & Data Upload
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload Plantar Pressure Dataset
        </h2>
        <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
          Upload an 8-channel Excel (.xlsx, .xls) or CSV (.csv) sensor matrix containing time-series plantar pressure readings in kPa.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main Upload Box & Multi-Modal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left 7 Columns: Active CSV/Excel File Dropzone */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                <span>Pressure Sensor Matrix Upload</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                ACTIVE DATA INPUT
              </span>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 rounded-xl border-2 border-dashed transition-all text-center cursor-pointer space-y-3 ${
                isDragOver
                  ? "border-teal-500 bg-teal-50/50"
                  : selectedFile
                  ? "border-emerald-300 bg-emerald-50/20"
                  : "border-stone-200 bg-stone-50/50 hover:bg-stone-100/80 hover:border-teal-400"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready for Clinical Pipeline
                    </p>
                  </div>
                  <span className="inline-block text-[10px] font-semibold text-teal-700 underline">
                    Click to change file
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-stone-100 text-teal-700 flex items-center justify-center mx-auto border border-stone-200">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Drag & Drop CSV or Excel dataset here
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Supports .xlsx, .xls, and .csv files with 8 pressure columns
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold shadow-xs">
                      Browse Local Files
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedFile || isLoading}
                className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  selectedFile && !isLoading
                    ? "bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/20"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed"
                }`}
              >
                <span>Run Clinical Pipeline</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onViewDemo}
                className="py-3.5 px-4 rounded-xl font-semibold text-xs bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-200 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Load Clinical Demo</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right 5 Columns: MANDATED Future-Ready Disabled Placeholders */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200/80 space-y-4">
            
            <div className="flex items-center space-x-2 border-b border-stone-200 pb-3">
              <Layers className="w-4 h-4 text-stone-500" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Multi-Modal Expansion Pipeline</h4>
                <p className="text-[10px] text-slate-500">Future diagnostic inputs (UI Placeholders)</p>
              </div>
            </div>

            {/* PLACEHOLDER 1: Footprint Image (Coming Soon) */}
            <div className="p-3.5 rounded-xl bg-white border border-stone-200 opacity-65 flex items-start space-x-3 cursor-not-allowed">
              <div className="p-2 rounded-lg bg-stone-100 text-stone-400 border border-stone-200">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Footprint Image</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Coming Soon</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">High-resolution optical plantar footprint registration.</p>
              </div>
            </div>

            {/* PLACEHOLDER 2: Clinical Metadata (Coming Soon) */}
            <div className="p-3.5 rounded-xl bg-white border border-stone-200 opacity-65 flex items-start space-x-3 cursor-not-allowed">
              <div className="p-2 rounded-lg bg-stone-100 text-stone-400 border border-stone-200">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Clinical Metadata</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Coming Soon</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Patient HbA1c, BMI, and neuropathy grading scores.</p>
              </div>
            </div>

            {/* PLACEHOLDER 3: Patient History (Coming Soon) */}
            <div className="p-3.5 rounded-xl bg-white border border-stone-200 opacity-65 flex items-start space-x-3 cursor-not-allowed">
              <div className="p-2 rounded-lg bg-stone-100 text-stone-400 border border-stone-200">
                <History className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Patient History</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Coming Soon</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Longitudinal plantar pressure progression tracking.</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200/60 text-[11px] text-blue-900 leading-normal">
              <span className="font-bold">Scalability Architecture:</span> These disabled placeholders demonstrate StrideScan's multi-modal extension roadmap for combined pressure, optical, and clinical metadata screening.
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
