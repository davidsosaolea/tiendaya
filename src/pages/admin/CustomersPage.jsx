import { useOutletContext } from 'react-router';
import { Users, Search, MessageCircle } from 'lucide-react';
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

  if (!currentStore) return <PageSpinner />;

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

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
          {filtered.map(customer => (
            <Card key={customer.id} className="customer-card">
              <div className="customer-avatar">{customer.name.charAt(0).toUpperCase()}</div>
              <div className="customer-info">
                <span className="customer-name">{customer.name}</span>
                <span className="customer-phone">{customer.phone}</span>
              </div>
              <div className="customer-meta">
                <span className="customer-date">
                  Desde {new Date(customer.created_at).toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              <a href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                <Button variant="whatsapp" size="sm" icon={MessageCircle}>WhatsApp</Button>
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
