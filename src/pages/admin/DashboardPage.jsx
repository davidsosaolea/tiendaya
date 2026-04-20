import { useOutletContext, Link } from 'react-router';
import { DollarSign, ShoppingCart, Users, Package, Plus, ExternalLink, TrendingUp, Store } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import { useCustomers } from '../../hooks/useCustomers';
import { formatPrice } from '../../lib/whatsapp';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './DashboardPage.css';

export default function DashboardPage() {
  const { currentStore, storeLoading } = useOutletContext();

  if (storeLoading) return <PageSpinner />;
  if (!currentStore) {
    return (
      <EmptyState
        icon={Store}
        title="Crea tu primera tienda"
        description="Configura tu tienda para empezar a vender por WhatsApp"
        action={<Link to="/dashboard/settings"><Button icon={Plus}>Crear tienda</Button></Link>}
      />
    );
  }

  return <DashboardContent store={currentStore} />;
}

function DashboardContent({ store }) {
  const { orders, stats, getMonthlyRevenue, getWeeklySales, loading: ordersLoading } = useOrders(store.id);
  const { products } = useProducts(store.id);
  const { customers } = useCustomers(store.id);

  const revenue = getMonthlyRevenue();
  const weeklySales = getWeeklySales();
  const recentOrders = orders.slice(0, 5);
  const activeProducts = products.filter(p => p.is_active).length;

  const statCards = [
    { label: 'Ventas del mes', value: formatPrice(revenue), icon: DollarSign, color: 'primary', trend: '+12%' },
    { label: 'Pedidos', value: stats.total, icon: ShoppingCart, color: 'accent' },
    { label: 'Clientes', value: customers.length, icon: Users, color: 'info' },
    { label: 'Productos activos', value: activeProducts, icon: Package, color: 'warning' },
  ];

  return (
    <div className="dashboard animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Bienvenido a {store.name}</p>
        </div>
        <div className="dashboard-actions">
          <Link to={`/${store.slug}`} target="_blank">
            <Button variant="secondary" icon={ExternalLink} size="sm">Ver tienda</Button>
          </Link>
          <Link to="/dashboard/products">
            <Button icon={Plus} size="sm">Nuevo producto</Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid stagger-children">
        {statCards.map((stat) => (
          <Card key={stat.label} className={`stat-card stat-card-${stat.color}`}>
            <div className="stat-card-header">
              <span className="stat-label">{stat.label}</span>
              <div className={`stat-icon stat-icon-${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
            {stat.trend && (
              <div className="stat-trend">
                <TrendingUp size={14} /> {stat.trend} vs mes anterior
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Chart + Recent Orders */}
      <div className="dashboard-grid">
        <Card className="chart-card">
          <h3 className="card-title">Ventas últimos 7 días</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklySales}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => `S/${v}`} />
                <Tooltip
                  contentStyle={{ background: '#12122a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f1f5f9' }}
                  formatter={(v) => [`S/${v.toFixed(2)}`, 'Ventas']}
                />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2} fill="url(#salesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="recent-orders-card">
          <div className="card-title-row">
            <h3 className="card-title">Pedidos recientes</h3>
            <Link to="/dashboard/orders" className="card-link">Ver todos</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="no-data-text">Aún no hay pedidos</p>
          ) : (
            <div className="recent-orders-list">
              {recentOrders.map(order => (
                <div key={order.id} className="recent-order-item">
                  <div className="recent-order-info">
                    <span className="recent-order-name">{order.customer_name}</span>
                    <span className="recent-order-date">
                      {new Date(order.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <div className="recent-order-right">
                    <span className="recent-order-total">{formatPrice(order.total)}</span>
                    <Badge status={order.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
