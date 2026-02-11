export interface ModuleMetadata {
    name: string;
    type: 'PAGE' | 'COMPONENT';
    fields: {
        name: string;
        type: string;
        label: string;
    }[];
}

export class Parser {
    /**
     * Transforma metadados JSON em um arquivo React (TSX)
     */
    parseToTSX(metadata: ModuleMetadata): string {
        const fieldsJSX = metadata.fields.map(field => `
      <div className="mb-4">
        <label className="block text-sm font-medium text-zinc-400 capitalize">${field.label || field.name}</label>
        <input type="${field.type === 'string' ? 'text' : 'number'}" className="mt-1 block w-full bg-zinc-900 border border-zinc-700 rounded-md p-2" />
      </div>
    `).join('');

        return `
import React from 'react';

export const ${metadata.name} = () => {
  return (
    <div className="p-8 bg-zinc-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">${metadata.name}</h1>
      <form className="max-w-md glass-card p-6">
        ${fieldsJSX}
        <button className="bg-blue-600 px-4 py-2 rounded mt-4">Salvar</button>
      </form>
    </div>
  );
};
    `.trim();
    }
}

export const parser = new Parser();
