import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NDataGrid } from './NDataGrid';

export const NUniqueSearch: React.FC<any> = ({
    label,
    targetModel,
    targetEndpoint,
    displayField,
    onSelect,
    value,
    placeholder = "Clique para selecionar..."
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState('');

    const handleSelection = (item: any) => {
        const labelValue = item[displayField] || item.id;
        setSelectedLabel(labelValue);
        onSelect?.(item.id, labelValue);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-1.5 w-full">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-tight ml-1">{label}</label>
            <div className="relative group" onClick={() => setIsModalOpen(true)}>
                <input
                    type="text"
                    readOnly
                    placeholder={placeholder}
                    value={selectedLabel || value || ''}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer shadow-sm"
                />
                <Search className="absolute right-3.5 top-3 text-slate-400 group-hover:text-blue-500 transition-colors" size={20} />
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200"
                        >
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="font-bold text-slate-700">Vincular {targetModel}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors p-1"><X size={24} /></button>
                            </div>
                            <div className="p-6 flex-1 overflow-auto">
                                <NDataGrid
                                    endpoint={targetEndpoint}
                                    columns={[
                                        { name: 'id', label: 'ID' },
                                        { name: displayField, label: 'Identificador', sortable: true }
                                    ]}
                                    pageSize={5}
                                    onRowClick={handleSelection}
                                    actions={{ onEdit: (row: any) => handleSelection(row) }}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
