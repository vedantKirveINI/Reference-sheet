import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ILinkRecord } from '@/types/cell';
import { X, Search, Plus } from 'lucide-react';

interface LinkEditorProps {
  value: ILinkRecord[] | null;
  onChange: (records: ILinkRecord[]) => void;
  foreignTableId?: number;
  onSearch?: (query: string) => Promise<ILinkRecord[]>;
}

export const LinkEditor: React.FC<LinkEditorProps> = ({
  value,
  onChange,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ILinkRecord[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = value || [];

  const doSearch = useCallback(async (query: string) => {
    if (!query || !onSearch) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const results = await onSearch(query);
      setSearchResults(results.filter(r => !selected.some(s => s.id === r.id)));
    } catch {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [onSearch, selected]);

  useEffect(() => {
    const timeout = setTimeout(() => doSearch(searchQuery), 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, doSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addRecord = (record: ILinkRecord) => {
    onChange([...selected, record]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeRecord = (id: number) => {
    onChange(selected.filter(r => r.id !== id));
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex flex-wrap items-center gap-1 border rounded-md px-2 py-1 min-h-[36px] bg-white dark:bg-zinc-900 dark:border-zinc-700">
        {selected.map(record => (
          <div key={record.id} className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded px-2 py-0.5 text-sm">
            <span className="max-w-[150px] truncate">{record.title}</span>
            <button onClick={() => removeRecord(record.id)} className="hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full p-0.5">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <div className="relative flex-1 min-w-[80px]">
          <input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder={selected.length === 0 ? 'Link records...' : ''}
            className="w-full bg-transparent outline-none text-sm py-1"
          />
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded">
          <Plus className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      {isOpen && (searchResults.length > 0 || isLoading) && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-900 border dark:border-zinc-700 rounded-md shadow-lg max-h-[200px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center gap-2 p-3 text-sm text-gray-500">
              <Search className="w-4 h-4 animate-pulse" />
              Searching...
            </div>
          ) : (
            searchResults.map(record => (
              <button
                key={record.id}
                onClick={() => addRecord(record)}
                className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 text-left text-sm"
              >
                <span className="truncate">{record.title}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
