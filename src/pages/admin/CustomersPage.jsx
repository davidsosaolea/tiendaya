import { useOutletContext } from 'react-router';
import { Users, Search, MessageCircle, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useCustomers } from '../../hooks/useCustomers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import './CustomersPage.css';

export default function CustomersPage() {
  const { currentStore } = useOutletContext();
  const { customers, loading } = useCustomers(currentStore?.id);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  if (!currentStore) return <PageSpinner />;

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const toggleExpanded = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const formatAddress = (customer) => {
    const parts = [customer.direccion, customer.distrito, customer.provincia, customer.departamento].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  return (
    <div className="customers-page animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">{customers.length} clientes registrados</p>
        </div>
      </div>

      {customers.length > 0 && (
        <div className="products-toolbar">
          <Input icon={Search} placeholder="Buscar por nombre o teléfono..." value={search} onChange={e => setSearch(e.target.value)} className="products-search" />
        </div>
      )}

      {loading ? <PageSpinner /> : customers.length === 0 ? (
        <EmptyState icon={Users} title="Sin clientes aún" description="Los clientes se registran cuando hacen un pedido desde tu catálogo" />
      ) : (
        <div className="customers-list stagger-children">
          {filtered.map(customer => {
            const address = formatAddress(customer);
            const isExpanded = expandedId === customer.id;
            return (
              <Card key={customer.id} className={`customer-card ${isExpanded ? 'customer-card-expanded' : ''}`}>
                <div className="customer-card-main" onClick={() => address && toggleExpanded(customer.id)}>
                  <div className="customer-avatar">{customer.name.charAt(0).toUpperCase()}</div>
                  <div className="customer-info">
                    <span className="customer-name">{customer.name}</span>
                    <span className="customer-phone">{customer.phone}</span>
                  </div>
                  <div className="customer-meta">
                    <span className="customer-date">
                      Desde {new Date(customer.created_at).toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })}
                    </span>
                    {address && (
                      <span className="customer-has-address">
                        <MapPin size={12} /> Dirección
                      </span>
                    )}
                  </div>
                  <div className="customer-actions">
                    <a href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                      <Button variant="whatsapp" size="sm" icon={MessageCircle}>WhatsApp</Button>
                    </a>
                    {address && (
                      <button className="customer-expand-btn" onClick={(e) => { e.stopPropagation(); toggleExpanded(customer.id); }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    )}
                  </div>
                </div>
                {isExpanded && address && (
                  <div className="customer-address-detail">
                    <div className="customer-address-icon"><MapPin size={16} /></div>
                    <div className="customer-address-info">
                      <span className="customer-address-label">Dirección de envío</span>
                      {customer.direccion && <span className="customer-address-line">{customer.direccion}</span>}
                      <span className="customer-address-line customer-address-location">
                        {[customer.distrito, customer.provincia, customer.departamento].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
