import React, { useState, useRef } from 'react';
import { FileUp, FileText, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';
import { FieldError } from './NFormContainer';

interface NUploadProps {
    label?: string;
    value?: File | File[] | null;
    onChange?: (files: File | File[] | null) => void;
    multiple?: boolean;
    accept?: string;
    name?: string;
    className?: string;
}

export const NUpload: React.FC<NUploadProps> = ({
    label,
    value,
    onChange,
    multiple = false,
    accept = "image/*,application/pdf",
    name,
    className
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (fileList: FileList | null) => {
        if (!fileList) return;
        const newFiles = Array.from(fileList);
        if (multiple) {
            const currentFiles = Array.isArray(value) ? value : value ? [value as File] : [];
            onChange?.([...currentFiles, ...newFiles]);
        } else {
            onChange?.(newFiles[0]);
        }
    };

    const removeFile = (index: number) => {
        if (multiple && Array.isArray(value)) {
            const newFiles = value.filter((_, i) => i !== index);
            onChange?.(newFiles.length > 0 ? newFiles : null);
        } else {
            onChange?.(null);
        }
    };

    const renderPreview = (file: File, index: number) => {
        const isImage = file.type.startsWith('image/');
        const url = isImage ? URL.createObjectURL(file) : null;

        return (
            <motion.div
                key={file.name + index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group w-24 h-24 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
            >
                {isImage ? (
                    <img src={url!} alt="preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                        <FileText size={24} />
                        <span className="text-[8px] mt-1 font-bold uppercase truncate px-1 w-full text-center">{file.name}</span>
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                    <Trash2 size={12} />
                </button>
            </motion.div>
        );
    };

    const files = Array.isArray(value) ? value : value ? [value] : [];

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)}>
            {label && <label className="text-xs font-bold text-slate-600 uppercase tracking-tight ml-1">{label}</label>}

            <div
                className={cn(
                    "relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group",
                    isDragging ? "border-blue-500 bg-blue-50/50" : "border-slate-200 bg-slate-50/30 hover:border-slate-400 hover:bg-white"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className={cn(
                    "p-4 rounded-2xl bg-white border border-slate-100 text-blue-500 shadow-sm transition-transform group-hover:scale-110",
                    isDragging && "scale-110 rotate-3"
                )}>
                    <FileUp size={32} />
                </div>

                <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">Arraste seus arquivos ou clique para buscar</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">PNG, JPG, PDF • Máx 10MB</p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    accept={accept}
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>

            <AnimatePresence>
                {files.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-2">
                        {files.map((file, idx) => renderPreview(file as File, idx))}
                    </div>
                )}
            </AnimatePresence>

            <FieldError name={name || label || ''} />
        </div>
    );
};
