import './Card.css';

export default function Card({ children, className = '', hover = false, padding = true, glow = false, ...props }) {
  return (
    <div className={`card ${hover ? 'card-hover' : ''} ${padding ? 'card-padded' : ''} ${glow ? 'card-glow' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
}
