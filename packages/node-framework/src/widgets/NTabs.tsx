import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';

export interface NTabItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
}

interface NTabsProps {
    tabs: NTabItem[];
    defaultTab?: string;
    className?: string;
}

export const NTabs: React.FC<NTabsProps> = ({ tabs, defaultTab, className }) => {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

    return (
        <div className={cn("flex flex-col w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden", className)}>
            {/* Tab List */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 p-1.5 gap-1 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "relative flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap z-10",
                            activeTab === tab.id
                                ? "text-blue-600 bg-white shadow-sm ring-1 ring-slate-200"
                                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                        )}
                    >
                        {tab.icon && <span className={cn(activeTab === tab.id ? "text-blue-500" : "text-slate-400")}>{tab.icon}</span>}
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabHighlight"
                                className="absolute inset-0 bg-blue-50/20 rounded-2xl -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
                <AnimatePresence mode="wait">
                    {tabs.map((tab) => (
                        activeTab === tab.id && (
                            <motion.div
                                key={tab.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {tab.content}
                            </motion.div>
                        )
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
