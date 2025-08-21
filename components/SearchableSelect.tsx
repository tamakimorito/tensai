import React, { useState, useEffect, useRef, useId } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder = '選択してください' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();
  
  const optionId = (index: number) => `${listboxId}-option-${index}`;
  const selectedLabel = options.find(opt => opt.value === value)?.label || value;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);
  
  useEffect(() => {
      if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
          const optionElement = listboxRef.current.querySelector(`#${optionId(highlightedIndex)}`);
          if (optionElement) {
              optionElement.scrollIntoView({ block: 'nearest' });
          }
      }
  }, [highlightedIndex, isOpen, optionId]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSelect = (option: Option) => {
    onChange(option.value);
    setSearchTerm(option.label);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      // For free-text capable fields like operator
      if (!options.some(opt => opt.label === e.target.value)) {
          onChange(e.target.value);
      }
  }

  const handleInputClick = () => {
      setIsOpen(true);
      setSearchTerm(''); // Clear search term to show all options initially
  }
  
  const handleInputFocus = () => {
      setIsOpen(true);
      setSearchTerm('');
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
            break;
        case 'ArrowUp':
            e.preventDefault();
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
            break;
        case 'Enter':
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                handleSelect(filteredOptions[highlightedIndex]);
            } else if (filteredOptions.length > 0) {
                // If user typed something and hits enter, select first match
                handleSelect(filteredOptions[0]);
            }
            break;
        case 'Escape':
            setIsOpen(false);
            setHighlightedIndex(-1);
            break;
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 transition duration-150 ease-in-out"
        value={isOpen ? searchTerm : selectedLabel}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onClick={handleInputClick}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={highlightedIndex >= 0 ? optionId(highlightedIndex) : undefined}
      />
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <ul id={listboxId} role="listbox" ref={listboxRef} className="py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={value === option.value}
                  className={`px-3 py-2 text-sm text-slate-700 hover:bg-cyan-500 hover:text-white cursor-pointer ${index === highlightedIndex ? 'bg-cyan-500 text-white' : ''}`}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option.label}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-slate-400">該当なし</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;