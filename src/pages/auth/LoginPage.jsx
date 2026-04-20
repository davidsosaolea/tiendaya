import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import './Auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await signIn(email, password);

      // On first login after email confirmation, create the store if it doesn't exist
      if (user?.user_metadata?.store_slug) {
        const { data: existingStores } = await supabase
          .from('stores')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (!existingStores || existingStores.length === 0) {
          const { error: storeError } = await supabase.from('stores').insert({
            user_id: user.id,
            name: user.user_metadata.store_name || 'Mi Tienda',
            slug: user.user_metadata.store_slug,
            phone: user.user_metadata.store_phone || '',
          });
          if (storeError) {
            console.warn('Auto store creation failed:', storeError.message);
          }
        }
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Email o contraseña incorrectos'
        : err.message === 'Email not confirmed'
          ? 'Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.'
          : 'Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow" />
      <div className="auth-container animate-fade-in-up">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">T</div>
            <h1 className="auth-logo-text">TiendaYa</h1>
          </div>
          <p className="auth-subtitle">Inicia sesión en tu cuenta</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <Input
            label="Correo electrónico"
            type="email"
            icon={Mail}
            placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <Button type="submit" fullWidth size="lg" loading={loading} iconRight={ArrowRight}>
            Iniciar sesión
          </Button>
        </form>

        <p className="auth-footer-text">
          ¿No tienes cuenta? <Link to="/register">Crear cuenta gratis</Link>
        </p>
      </div>
    </div>
  );
}

