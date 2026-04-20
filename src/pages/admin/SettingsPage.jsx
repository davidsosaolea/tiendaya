import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { Store, Save, Globe, Phone, Palette, Plus } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { PageSpinner } from '../../components/ui/Spinner';
import './SettingsPage.css';

export default function SettingsPage() {
  const { currentStore, stores, createStore, setCurrentStore } = useOutletContext();

  return (
    <div className="settings-page animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">Administra tu tienda</p>
        </div>
      </div>

      {/* Store Selector for multi-store */}
      {stores && stores.length > 1 && (
        <Card className="settings-store-selector">
          <h3 className="card-title">Tus tiendas</h3>
          <div className="store-list">
            {stores.map(s => (
              <button key={s.id} className={`store-select-btn ${s.id === currentStore?.id ? 'active' : ''}`} onClick={() => setCurrentStore(s)}>
                <Store size={16} /> {s.name}
              </button>
            ))}
          </div>
        </Card>
      )}

      {currentStore ? (
        <StoreSettings store={currentStore} />
      ) : (
        <NewStoreForm onCreate={createStore} />
      )}
    </div>
  );
}

function StoreSettings({ store }) {
  const { updateStore } = useStore();
  const [form, setForm] = useState({
    name: store.name || '',
    slug: store.slug || '',
    description: store.description || '',
    phone: store.phone || '',
    logo_url: store.logo_url || '',
    banner_url: store.banner_url || '',
    primary_color: store.primary_color || '#6366f1',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'slug') value = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateStore(store.id, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <Card>
        <h3 className="card-title">Información de la tienda</h3>
        <div className="settings-fields">
          <Input label="Nombre de la tienda" icon={Store} value={form.name} onChange={handleChange('name')} required />
          <div className="settings-row">
            <Input label="URL (slug)" icon={Globe} value={form.slug} onChange={handleChange('slug')} required />
            <Input label="WhatsApp" icon={Phone} value={form.phone} onChange={handleChange('phone')} placeholder="51999888777" required />
          </div>
          <Input label="Descripción" type="textarea" value={form.description} onChange={handleChange('description')} placeholder="Describe tu tienda..." />
        </div>
      </Card>

      <Card>
        <h3 className="card-title">Apariencia</h3>
        <div className="settings-fields">
          <Input label="URL del logo" value={form.logo_url} onChange={handleChange('logo_url')} placeholder="https://..." />
          <Input label="URL del banner" value={form.banner_url} onChange={handleChange('banner_url')} placeholder="https://..." />
          <div className="color-picker-group">
            <label className="input-label">Color primario</label>
            <div className="color-picker-row">
              <input type="color" value={form.primary_color} onChange={handleChange('primary_color')} className="color-picker-input" />
              <span className="color-picker-value">{form.primary_color}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="settings-actions">
        <Button type="submit" icon={Save} loading={loading} size="lg">
          {saved ? '✓ Guardado' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}

function NewStoreForm({ onCreate }) {
  const [form, setForm] = useState({ name: '', slug: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'slug') value = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await onCreate(form); } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <Card>
      <h3 className="card-title">Crear nueva tienda</h3>
      <form className="settings-fields" onSubmit={handleSubmit}>
        <Input label="Nombre" icon={Store} value={form.name} onChange={handleChange('name')} required />
        <Input label="URL (slug)" icon={Globe} value={form.slug} onChange={handleChange('slug')} required />
        <Input label="WhatsApp" icon={Phone} value={form.phone} onChange={handleChange('phone')} placeholder="51999888777" required />
        <Button type="submit" icon={Plus} loading={loading}>Crear tienda</Button>
      </form>
    </Card>
  );
}
