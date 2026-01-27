'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  searchQuery: string
  onSearch: (query: string) => void
  placeholder?: string
  debounceMs?: number
}

export function SearchBar({ searchQuery, onSearch, placeholder = 'Search', debounceMs = 300 }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(searchQuery);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchQuery) {
        onSearch(inputValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, debounceMs, onSearch, searchQuery]);

  // Update input value when searchQuery prop changes (for external updates)
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleClear = () => {
    setInputValue('');
    onSearch(''); // Immediate clear, no debounce
  };

  return (
    <div className='flex items-center pb-4'>
      <form className='w-full'>
        <div className='flex items-center gap-2 px-3 py-2.5 border border-[#E3E5E8] rounded-[7px] '>
          <Search className='w-4 h-4 text-[#2F2F2F] flex-shrink-0' />
          <Input
            type='text'
            value={inputValue}
            onChange={handleChange}
            placeholder={placeholder}
            className='bg-transparent border-none outline-none text-sm text-[#6B7280] placeholder-[#6B7280]  h-4 p-0 focus-visible:ring-0 focus-visible:ring-offset-0'
          />
          {inputValue && (
            <button
              type='button'
              onClick={handleClear}
              className='flex items-center justify-center p-0 ml-auto text-[#6B7280] hover:text-[#2F2F2F] transition-colors'
            >
              <X className='w-4 h-4' />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
