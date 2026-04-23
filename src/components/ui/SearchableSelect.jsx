import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import './SearchableSelect.css';

/**
 * Searchable dropdown select component with autocomplete.
 * 
 * Props:
 * - label: Label text
 * - icon: Icon component for the label area
 * - placeholder: Placeholder text
 * - options: Array of strings to pick from
 * - value: Currently selected value
 * - onChange: Called with the selected string
 * - disabled: If true, the field is disabled
 * - required: If true, the field is visually required
 */
export default function SearchableSelect({
  label,
  icon: Icon,
  placeholder = 'Seleccionar...',
  options = [],
  value = '',
  onChange,
  disabled = false,
  required = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Filter options based on search
  const filtered = search
    ? options.filter(opt =>
        opt.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  // Close on click outside
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = useCallback((opt) => {
    onChange(opt);
    setIsOpen(false);
    setSearch('');
  }, [onChange]);

  const handleClear = useCallback((e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  }, [onChange]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(prev => !prev);
    setSearch('');
  };

  return (
    <div className={`ss-group ${disabled ? 'ss-disabled' : ''}`} ref={containerRef}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="ss-required">*</span>}
        </label>
      )}
      <div className="ss-wrapper">
        {/* Trigger button */}
        <button
          type="button"
          className={`ss-trigger ${isOpen ? 'ss-trigger-open' : ''} ${value ? 'ss-has-value' : ''}`}
          onClick={handleToggle}
          disabled={disabled}
        >
          {Icon && <Icon size={18} className="ss-trigger-icon" />}
          <span className={`ss-trigger-text ${!value ? 'ss-placeholder' : ''}`}>
            {value || placeholder}
          </span>
          {value && !disabled ? (
            <span className="ss-clear" onClick={handleClear} role="button" tabIndex={-1}>
              <X size={14} />
            </span>
          ) : (
            <ChevronDown size={16} className={`ss-chevron ${isOpen ? 'ss-chevron-open' : ''}`} />
          )}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="ss-dropdown">
            {/* Search input */}
            <div className="ss-search">
              <Search size={15} className="ss-search-icon" />
              <input
                ref={inputRef}
                type="text"
                className="ss-search-input"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
              />
            </div>

            {/* Options list */}
            <ul className="ss-options" ref={listRef}>
              {filtered.length === 0 ? (
                <li className="ss-no-results">Sin resultados</li>
              ) : (
                filtered.map((opt) => (
                  <li
                    key={opt}
                    className={`ss-option ${opt === value ? 'ss-option-selected' : ''}`}
                    onClick={() => handleSelect(opt)}
                  >
                    {opt}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
