"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, ArrowRight, X } from "lucide-react";

interface UploadCardProps {
  onFileSelect: (file: File) => void;
  onAnalyze: (file: File) => void;
  isLoading: boolean;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  onFileSelect,
  onAnalyze,
  isLoading,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setErrorMsg("Invalid file format. Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setErrorMsg(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 transition-all duration-300">
      <div className="card-apple p-8 sm:p-10 text-center relative overflow-hidden">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Upload Plantar Pressure Scan
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Select or drag & drop an Excel file containing time-series plantar pressure readings from sensors.
          </p>
        </div>

        {/* Dropzone Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !selectedFile && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-[14px] p-8 sm:p-10 transition-all duration-200 cursor-pointer ${
            dragActive
              ? "border-blue-600 bg-blue-50/50 scale-[1.01]"
              : selectedFile
              ? "border-emerald-200 bg-emerald-50/30 cursor-default"
              : "border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx, .xls"
            onChange={handleChange}
            className="hidden"
          />

          {!selectedFile ? (
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                <UploadCloud className="w-7 h-7 stroke-[1.8]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">
                  Drag and drop your Excel scan here, or <span className="text-blue-600 underline underline-offset-2">browse</span>
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  Supports .xlsx or .xls sensor datasets
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-emerald-700">
                  ✓ Scan Loaded Successfully
                </p>
                <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-xs">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>{selectedFile.name}</span>
                  <span className="text-slate-400">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-red-500 font-medium transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove file</span>
              </button>
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Action Button */}
        {selectedFile && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              onClick={() => onAnalyze(selectedFile)}
              disabled={isLoading}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-base rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Analyze Scan</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
