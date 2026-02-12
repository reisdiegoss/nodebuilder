import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { cn } from '../utils';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

export const NToastContainer = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Expor função globalmente para simplificar o framework sem Redux/Context complexo
    useEffect(() => {
        (window as any).notify = (message: string, type: ToastType = 'success') => {
            const id = Math.random().toString(36).substring(2, 9);
            setToasts(prev => [...prev, { id, message, type }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 3000);
        };
    }, []);

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 min-w-[320px]">
            <AnimatePresence>
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className={cn(
                            "flex items-center gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md",
                            toast.type === 'success' && "bg-green-50/90 border-green-200 text-green-800",
                            toast.type === 'error' && "bg-red-50/90 border-red-200 text-red-800",
                            toast.type === 'info' && "bg-blue-50/90 border-blue-200 text-blue-800"
                        )}
                    >
                        {toast.type === 'success' && <CheckCircle size={20} className="text-green-600" />}
                        {toast.type === 'error' && <AlertCircle size={20} className="text-red-600" />}
                        {toast.type === 'info' && <Info size={20} className="text-blue-600" />}

                        <span className="text-sm font-bold flex-1">{toast.message}</span>

                        <button
                            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                            className="p-1 hover:bg-black/5 rounded-lg transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
