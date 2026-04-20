import { NavLink, useNavigate } from 'react-router';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Store, ExternalLink, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/products', icon: Package, label: 'Productos' },
  { to: '/dashboard/orders', icon: ShoppingCart, label: 'Pedidos' },
  { to: '/dashboard/customers', icon: Users, label: 'Clientes' },
  { to: '/dashboard/settings', icon: Settings, label: 'Configuración' },
];

export default function Sidebar({ store }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button className="sidebar-mobile-toggle" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
        <Menu size={22} />
      </button>

      {/* Overlay */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">T</div>
            <span className="sidebar-logo-text">TiendaYa</span>
          </div>
          <button className="sidebar-close-mobile" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {store && (
          <div className="sidebar-store">
            <div className="sidebar-store-avatar">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} />
              ) : (
                <Store size={18} />
              )}
            </div>
            <div className="sidebar-store-info">
              <span className="sidebar-store-name truncate">{store.name}</span>
              <a
                href={`/${store.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="sidebar-store-link"
              >
                Ver tienda <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link sidebar-logout" onClick={handleSignOut}>
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
