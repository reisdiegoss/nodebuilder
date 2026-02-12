import React, { useState, useEffect } from 'react';
import { cn } from '../utils';
import { FieldError } from './NFormContainer';

export type MaskType = 'cpf' | 'cnpj' | 'phone' | 'cep' | 'currency';

interface NMaskedInputProps {
    label?: string;
    mask: MaskType;
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    name?: string;
    className?: string;
}

export const NMaskedInput: React.FC<NMaskedInputProps> = ({
    label,
    mask,
    value = '',
    onChange,
    placeholder,
    name,
    className
}) => {
    const [displayValue, setDisplayValue] = useState('');

    const applyMask = (val: string, type: MaskType) => {
        let cleaned = String(val).replace(/\D/g, '');

        switch (type) {
            case 'cpf':
                cleaned = cleaned.substring(0, 11);
                return cleaned
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            case 'cnpj':
                cleaned = cleaned.substring(0, 14);
                return cleaned
                    .replace(/^(\d{2})(\d)/, '$1.$2')
                    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                    .replace(/\.(\d{3})(\d)/, '.$1/$2')
                    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
            case 'phone':
                cleaned = cleaned.substring(0, 11);
                if (cleaned.length <= 10) {
                    return cleaned
                        .replace(/^(\d{2})(\d)/, '($1) $2')
                        .replace(/(\d{4})(\d)/, '$1-$2');
                }
                return cleaned
                    .replace(/^(\d{2})(\d)/, '($1) $2')
                    .replace(/(\d{5})(\d)/, '$1-$2');
            case 'cep':
                cleaned = cleaned.substring(0, 8);
                return cleaned.replace(/^(\d{5})(\d)/, '$1-$2');
            case 'currency':
                if (!cleaned) return '';
                const numeric = parseInt(cleaned, 10);
                return (numeric / 100).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                });
            default:
                return val;
        }
    };

    useEffect(() => {
        setDisplayValue(applyMask(value, mask));
    }, [value, mask]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const formatted = applyMask(raw, mask);
        setDisplayValue(formatted);

        const cleanValue = mask === 'currency'
            ? formatted.replace(/[^\d]/g, '')
            : raw.replace(/\D/g, '');

        onChange?.(cleanValue);
    };

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)}>
            {label && <label className="text-xs font-bold text-slate-600 uppercase tracking-tight ml-1">{label}</label>}
            <input
                type="text"
                value={displayValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
            />
            <FieldError name={name || label || ''} />
        </div>
    );
};
