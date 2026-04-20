import { Link } from 'react-router';
import { Home } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '6rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)' }}>Página no encontrada</p>
      <Link to="/dashboard"><Button icon={Home}>Ir al inicio</Button></Link>
    </div>
  );
}
