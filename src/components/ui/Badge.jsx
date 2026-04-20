import './Badge.css';

const variantMap = {
  pending: 'warning',
  paid: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'danger',
};

const labelMap = {
  pending: 'Pendiente',
  paid: 'Pagado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export default function Badge({ children, variant = 'default', status, size = 'md' }) {
  const v = status ? (variantMap[status] || 'default') : variant;
  const label = status ? (labelMap[status] || status) : children;

  return (
    <span className={`badge badge-${v} badge-${size}`}>
      {status && <span className="badge-dot" />}
      {label}
    </span>
  );
}
