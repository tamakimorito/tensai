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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

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
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSelect = (option: Option) => {
    onChange(option.value);
    setSearchTerm(option.label);
    setIsOpen(false);
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
      setSearchTerm(selectedLabel);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 transition duration-150 ease-in-out"
        value={isOpen ? searchTerm : selectedLabel}
        onChange={handleInputChange}
        onFocus={handleInputClick}
        onClick={handleInputClick}
        placeholder={placeholder}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
      />
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <ul id={listboxId} role="listbox" className="py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={value === option.value}
                  className="px-3 py-2 text-sm text-slate-700 hover:bg-cyan-600 hover:text-white cursor-pointer"
                  onClick={() => handleSelect(option)}
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