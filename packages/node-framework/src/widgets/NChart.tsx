import React from 'react';
import { cn } from '../utils';

interface NChartProps {
    title?: string;
    type: 'bar' | 'line' | 'pie';
    data: { label: string; value: number; color?: string }[];
    height?: number;
    className?: string;
}

export const NChart: React.FC<NChartProps> = ({ title, type, data, height = 300, className }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    const renderBarChart = () => (
        <div className="flex items-end justify-around h-full w-full gap-2 pt-8">
            {data.map((item, i) => {
                const percentage = (item.value / maxValue) * 100;
                return (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group relative">
                        {/* Tooltip Mock */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-xl z-20 whitespace-nowrap">
                            {item.label}: {item.value}
                        </div>

                        <div
                            className="w-full rounded-t-lg transition-all duration-700 bg-gradient-to-t from-blue-600 to-blue-400 group-hover:from-blue-500 group-hover:to-blue-300 shadow-sm"
                            style={{ height: `${percentage}%`, backgroundColor: item.color }}
                        />
                        <span className="text-[10px] font-bold text-slate-400 truncate w-full text-center uppercase tracking-tighter">
                            {item.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );

    const renderLineChart = () => {
        const points = data.map((item, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - (item.value / maxValue) * 100;
            return `${x},${y}`;
        }).join(' ');

        return (
            <div className="relative h-full w-full pt-8">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Grids */}
                    {[0, 25, 50, 75, 100].map(v => (
                        <line key={v} x1="0" y1={v} x2="100" y2={v} stroke="#f1f5f9" strokeWidth="0.5" />
                    ))}

                    {/* Path */}
                    <polyline
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                        className="drop-shadow-lg"
                    />

                    {/* Points */}
                    {data.map((item, i) => {
                        const x = (i / (data.length - 1)) * 100;
                        const y = 100 - (item.value / maxValue) * 100;
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="1.5"
                                fill="white"
                                stroke="#2563eb"
                                strokeWidth="1"
                                className="hover:r-2 transition-all cursor-crosshair"
                            />
                        );
                    })}
                </svg>
                {/* Labels */}
                <div className="flex justify-between mt-2">
                    {data.map((item, i) => (
                        <span key={i} className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            {item.label}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className={cn("bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col", className)} style={{ height }}>
            {title && (
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{title}</h3>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
            )}
            <div className="flex-1 relative">
                {type === 'bar' && renderBarChart()}
                {type === 'line' && renderLineChart()}
                {type === 'pie' && <div className="flex items-center justify-center h-full text-zinc-400 text-xs italic">Pie Chart Implementation Coming Soon...</div>}
            </div>
        </div>
    );
};
