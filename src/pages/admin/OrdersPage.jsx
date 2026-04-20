import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { ShoppingCart, Filter, MessageCircle } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { formatPrice } from '../../lib/whatsapp';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import './OrdersPage.css';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'paid', label: 'Pagado' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const NEXT_STATUS = {
  pending: 'paid',
  paid: 'shipped',
  shipped: 'delivered',
};

const NEXT_LABEL = {
  pending: 'Marcar como pagado',
  paid: 'Marcar como enviado',
  shipped: 'Marcar como entregado',
};

export default function OrdersPage() {
  const { currentStore } = useOutletContext();
  const { orders, loading, updateOrderStatus } = useOrders(currentStore?.id);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  if (!currentStore) return <PageSpinner />;

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div className="orders-page animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Pedidos</h1>
          <p className="page-subtitle">{orders.length} pedidos en total</p>
        </div>
      </div>

      {orders.length > 0 && (
        <div className="orders-filters">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`filter-chip ${filter === opt.value ? 'filter-chip-active' : ''}`}
              onClick={() => setFilter(opt.value)}
            >
              {opt.label}
              {opt.value !== 'all' && (
                <span className="filter-count">
                  {orders.filter(o => o.status === opt.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <PageSpinner />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Sin pedidos aún"
          description="Los pedidos aparecerán aquí cuando tus clientes compren desde tu catálogo"
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Filter} title="Sin resultados" description="No hay pedidos con este filtro" />
      ) : (
        <div className="orders-list stagger-children">
          {filtered.map(order => (
            <Card key={order.id} hover className="order-card" onClick={() => setSelectedOrder(order)}>
              <div className="order-card-top">
                <div className="order-card-info">
                  <span className="order-card-number">#{order.order_number || order.id.slice(0, 8)}</span>
                  <span className="order-card-customer">{order.customer_name}</span>
                </div>
                <Badge status={order.status} />
              </div>
              <div className="order-card-bottom">
                <span className="order-card-date">
                  {new Date(order.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="order-card-total">{formatPrice(order.total)}</span>
              </div>
              {order.order_items && order.order_items.length > 0 && (
                <div className="order-card-items">
                  {order.order_items.slice(0, 3).map((item, i) => (
                    <span key={i} className="order-card-item">{item.quantity}x {item.product_name}</span>
                  ))}
                  {order.order_items.length > 3 && <span className="order-card-item">+{order.order_items.length - 3} más</span>}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Pedido #${selectedOrder?.order_number || selectedOrder?.id?.slice(0, 8) || ''}`} size="md">
        {selectedOrder && (
          <div className="order-detail">
            <div className="order-detail-status">
              <Badge status={selectedOrder.status} />
            </div>

            <div className="order-detail-section">
              <h4>Cliente</h4>
              <p>{selectedOrder.customer_name}</p>
              <p className="text-muted">{selectedOrder.customer_phone}</p>
            </div>

            <div className="order-detail-section">
              <h4>Productos</h4>
              <div className="order-detail-items">
                {selectedOrder.order_items?.map((item, i) => (
                  <div key={i} className="order-detail-item">
                    <span>{item.quantity}x {item.product_name}</span>
                    <span>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="order-detail-total">
                <span>Total</span>
                <span>{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="order-detail-section">
              <h4>Fecha</h4>
              <p className="text-muted">
                {new Date(selectedOrder.created_at).toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {selectedOrder.notes && (
              <div className="order-detail-section">
                <h4>Notas</h4>
                <p className="text-muted">{selectedOrder.notes}</p>
              </div>
            )}

            <div className="order-detail-actions">
              <a
                href={`https://wa.me/${selectedOrder.customer_phone?.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="whatsapp" icon={MessageCircle} size="sm">Contactar</Button>
              </a>
              {NEXT_STATUS[selectedOrder.status] && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange(selectedOrder.id, NEXT_STATUS[selectedOrder.status])}
                >
                  {NEXT_LABEL[selectedOrder.status]}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
