import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, Store, Phone, Globe, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import './Auth.css';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '', password: '', storeName: '', slug: '', phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'slug') {
      value = value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);
    }
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (!form.slug || form.slug.length < 3) {
      setError('El slug debe tener al menos 3 caracteres');
      return;
    }

    setLoading(true);
    try {
      // Store metadata includes store info so we can create the store on first login
      const data = await signUp(form.email, form.password, {
        store_name: form.storeName,
        store_slug: form.slug,
        store_phone: form.phone,
      });

      const user = data?.user;
      const session = data?.session;

      // If session is available (email confirmation disabled), create store now
      if (session && user) {
        const { error: storeError } = await supabase.from('stores').insert({
          user_id: user.id,
          name: form.storeName,
          slug: form.slug,
          phone: form.phone,
        });
        if (storeError && !storeError.message?.includes('duplicate')) {
          console.warn('Store creation deferred:', storeError.message);
        }
        navigate('/dashboard');
      } else {
        // Email confirmation required — show success message
        setRegistered(true);
      }
    } catch (err) {
      if (err.message?.includes('already registered')) {
        setError('Este correo ya está registrado');
      } else if (err.message?.includes('duplicate key') || err.message?.includes('unique')) {
        setError('Este slug ya está en uso. Elige otro.');
      } else {
        setError(err.message || 'Error al crear la cuenta');
      }
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="auth-page">
        <div className="auth-bg-glow" />
        <div className="auth-container animate-fade-in-up">
          <div className="auth-header">
            <div className="auth-success-icon">
              <CheckCircle size={48} />
            </div>
            <h1 className="auth-logo-text">¡Cuenta creada!</h1>
            <p className="auth-subtitle">
              Revisa tu correo electrónico <strong>{form.email}</strong> y haz clic en el enlace de confirmación para activar tu cuenta.
            </p>
          </div>
          <Link to="/login">
            <Button fullWidth size="lg" iconRight={ArrowRight}>
              Ir a iniciar sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-glow" />
      <div className="auth-container auth-container-wide animate-fade-in-up">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">T</div>
            <h1 className="auth-logo-text">TiendaYa</h1>
          </div>
          <p className="auth-subtitle">Crea tu tienda y empieza a vender por WhatsApp</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-form-grid">
            <Input
              label="Correo electrónico"
              type="email"
              icon={Mail}
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange('email')}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              icon={Lock}
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={handleChange('password')}
              required
            />
          </div>

          <Input
            label="Nombre de tu tienda"
            icon={Store}
            placeholder="Ej: Mi Tienda de Ropa"
            value={form.storeName}
            onChange={handleChange('storeName')}
            required
          />

          <div className="auth-form-grid">
            <Input
              label="URL de tu tienda"
              icon={Globe}
              placeholder="mi-tienda"
              value={form.slug}
              onChange={handleChange('slug')}
              required
            />
            <Input
              label="WhatsApp (con código país)"
              icon={Phone}
              placeholder="51999888777"
              value={form.phone}
              onChange={handleChange('phone')}
              required
            />
          </div>

          {form.slug && (
            <p className="auth-slug-preview">
              Tu catálogo estará en: <strong>/{form.slug}</strong>
            </p>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading} iconRight={ArrowRight}>
            Crear mi tienda gratis
          </Button>
        </form>

        <p className="auth-footer-text">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
