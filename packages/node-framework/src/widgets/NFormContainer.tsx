import React, { createContext, useContext } from 'react';

export const FormContext = createContext<{ errors: Record<string, string> }>({ errors: {} });

export const NFormContainer: React.FC<any> = ({ children, errors = {} }) => {
    return (
        <FormContext.Provider value={{ errors }}>
            <div className="space-y-4">{children}</div>
        </FormContext.Provider>
    );
};

export const FieldError = ({ name }: { name: string }) => {
    const { errors } = useContext(FormContext);
    if (!errors[name]) return null;
    return <span className="text-[10px] text-red-500 font-bold uppercase mt-1 animate-in fade-in slide-in-from-top-1">{errors[name]}</span>;
};
