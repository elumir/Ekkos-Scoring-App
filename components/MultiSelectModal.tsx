import React from 'react';

interface Option {
  id: string;
  label: string;
  description: string;
}

interface MultiSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: Option[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

const MultiSelectModal: React.FC<MultiSelectModalProps> = ({
  isOpen,
  onClose,
  title,
  options,
  selectedIds,
  onToggle,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-lg shadow-xl m-4 w-full max-w-md border border-slate-700 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto max-h-[70vh] p-2">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-center w-full text-left px-4 py-3 text-sm transition-colors text-slate-200 hover:bg-slate-600 cursor-pointer rounded-md"
            >
              <input
                type="checkbox"
                checked={selectedIds.has(option.id)}
                onChange={() => onToggle(option.id)}
                className="h-5 w-5 rounded bg-slate-900 border-slate-500 text-sky-500 focus:ring-sky-500 focus:ring-2 shrink-0"
              />
              <div className="ml-4">
                <p className="font-semibold text-base">{option.label}</p>
                <p className="text-xs text-slate-400">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="p-4 border-t border-slate-700 flex-shrink-0">
            <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-sky-600 rounded text-white font-semibold hover:bg-sky-500 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
                Done
            </button>
        </div>
      </div>
    </div>
  );
};

export default MultiSelectModal;
