import './Button.css';

export default function Button({ children, variant = 'primary', size = 'md', icon: Icon, iconRight: IconRight, loading, disabled, fullWidth, className = '', ...props }) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${loading ? 'btn-loading' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      {!loading && Icon && <Icon size={size === 'sm' ? 16 : 18} />}
      {children && <span>{children}</span>}
      {!loading && IconRight && <IconRight size={size === 'sm' ? 16 : 18} />}
    </button>
  );
}
