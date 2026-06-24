import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Pencil, Plus, Trash2, X } from 'lucide-react';

export default function EditableCreatableSelect({
  value,
  options = [],
  disabled = false,
  placeholder = 'Select value',
  onChange,
  onAdd,
  onRename,
  onDelete,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [editingValue, setEditingValue] = useState(null);
  const [editingText, setEditingText] = useState('');
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const close = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
        setEditingValue(null);
      }
    };

    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [isOpen]);

  const uniqueOptions = useMemo(() => {
    const seen = new Set();
    return options.filter(option => {
      const key = String(option || '').trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [options]);

  const commitAdd = () => {
    const cleaned = newValue.trim();
    if (!cleaned) return;
    onAdd?.(cleaned);
    onChange?.(cleaned);
    setNewValue('');
    setIsOpen(false);
  };

  const startRename = (option) => {
    setEditingValue(option);
    setEditingText(option);
  };

  const commitRename = () => {
    const cleaned = editingText.trim();
    if (!editingValue || !cleaned) return;
    onRename?.(editingValue, cleaned);
    if (value === editingValue) onChange?.(cleaned);
    setEditingValue(null);
    setEditingText('');
  };

  const commitDelete = (option) => {
    const deleted = onDelete?.(option);
    if (deleted && value === option) onChange?.('');
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(current => !current)}
        className="w-full px-4 py-3 text-[13px] font-medium rounded-xl text-slate-800 border border-slate-200 bg-white transition-all outline-none input-glow disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-between gap-3 text-left"
      >
        <span className={`truncate ${value ? 'text-slate-800' : 'text-slate-400'}`}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newValue}
                onChange={(event) => setNewValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    commitAdd();
                  }
                }}
                className="min-w-0 flex-1 px-3 py-2 text-[13px] font-medium rounded-lg border border-slate-200 outline-none focus:border-emerald-500/50"
                placeholder="Add new value"
              />
              <button
                type="button"
                onClick={commitAdd}
                className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                title="Add value"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto custom-scrollbar py-1">
            {uniqueOptions.length === 0 && (
              <div className="px-3 py-4 text-center text-xs font-medium text-slate-400">
                No values yet
              </div>
            )}

            {uniqueOptions.map(option => {
              const isSelected = option === value;
              const isEditing = option === editingValue;

              return (
                <div key={option} className="group flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editingText}
                        autoFocus
                        onChange={(event) => setEditingText(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            commitRename();
                          }
                          if (event.key === 'Escape') {
                            setEditingValue(null);
                            setEditingText('');
                          }
                        }}
                        className="min-w-0 flex-1 px-3 py-2 text-[13px] font-medium rounded-lg border border-slate-200 outline-none focus:border-emerald-500/50"
                      />
                      <button type="button" onClick={commitRename} className="h-8 w-8 rounded-lg text-emerald-700 hover:bg-emerald-50 flex items-center justify-center" title="Save value">
                        <Check size={15} />
                      </button>
                      <button type="button" onClick={() => setEditingValue(null)} className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 flex items-center justify-center" title="Cancel">
                        <X size={15} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onChange?.(option);
                          setIsOpen(false);
                        }}
                        className={`min-w-0 flex-1 px-2 py-2 rounded-lg text-left text-[13px] font-bold truncate ${isSelected ? 'text-emerald-700 bg-emerald-50' : 'text-slate-700 hover:text-slate-900'}`}
                        title={option}
                      >
                        {option}
                      </button>
                      <button type="button" onClick={() => startRename(option)} className="h-8 w-8 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 flex items-center justify-center" title="Edit value">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => commitDelete(option)} className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center" title="Delete value">
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
