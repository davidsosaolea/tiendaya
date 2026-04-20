import './Input.css';
import { forwardRef } from 'react';

const Input = forwardRef(function Input({ label, error, icon: Icon, className = '', type = 'text', ...props }, ref) {
  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        {Icon && <Icon size={18} className="input-icon" />}
        {type === 'textarea' ? (
          <textarea ref={ref} className={`input-field input-textarea ${Icon ? 'has-icon' : ''}`} {...props} />
        ) : (
          <input ref={ref} type={type} className={`input-field ${Icon ? 'has-icon' : ''}`} {...props} />
        )}
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
});

export default Input;
