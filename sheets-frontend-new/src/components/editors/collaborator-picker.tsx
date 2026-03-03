import React, { useState, useCallback, useRef, useEffect } from 'react';
import { IUserInfo } from '@/types/cell';
import { UserAvatar } from './user-avatar';
import { X, Search } from 'lucide-react';
import { searchUsers as apiSearchUsers } from '@/services/api';

interface CollaboratorPickerProps {
  selectedUsers: IUserInfo[];
  onChange: (users: IUserInfo[]) => void;
  isMultiple?: boolean;
  placeholder?: string;
}

export const CollaboratorPicker: React.FC<CollaboratorPickerProps> = ({
  selectedUsers,
  onChange,
  isMultiple = true,
  placeholder = 'Search users...',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IUserInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchUsers = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiSearchUsers({ query });
      const users = (response?.data || []).map((u: any) => ({
        id: String(u.id || u.userId),
        name: u.name || u.fullName || '',
        email: u.email || '',
        avatar: u.avatar || u.profilePicture || '',
      }));
      setSearchResults(users.filter((u: IUserInfo) =>
        !selectedUsers.some(s => s.id === u.id)
      ));
    } catch {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedUsers]);

  useEffect(() => {
    const timeout = setTimeout(() => searchUsers(searchQuery), 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, searchUsers]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addUser = (user: IUserInfo) => {
    if (isMultiple) {
      onChange([...selectedUsers, user]);
    } else {
      onChange([user]);
    }
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
  };

  const removeUser = (userId: string) => {
    onChange(selectedUsers.filter(u => u.id !== userId));
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex flex-wrap items-center gap-1 border rounded-md px-2 py-1 min-h-[36px] bg-white dark:bg-zinc-900 dark:border-zinc-700 focus-within:ring-2 focus-within:ring-brand-500/30">
        {selectedUsers.map(user => (
          <div key={user.id} className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 rounded-full px-2 py-0.5 text-sm">
            <UserAvatar user={user} size={18} />
            <span className="max-w-[120px] truncate">{user.name || user.email}</span>
            <button onClick={() => removeUser(user.id)} className="hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full p-0.5">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <div className="relative flex-1 min-w-[80px]">
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedUsers.length === 0 ? placeholder : ''}
            className="w-full bg-transparent outline-none text-sm py-1"
          />
        </div>
      </div>
      {isOpen && (searchResults.length > 0 || isLoading) && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-900 border dark:border-zinc-700 rounded-md shadow-lg max-h-[200px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center gap-2 p-3 text-sm text-gray-500">
              <Search className="w-4 h-4 animate-pulse" />
              Searching...
            </div>
          ) : (
            searchResults.map(user => (
              <button
                key={user.id}
                onClick={() => addUser(user)}
                className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 text-left"
              >
                <UserAvatar user={user} size={24} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{user.name}</div>
                  {user.email && <div className="text-xs text-gray-500 truncate">{user.email}</div>}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
