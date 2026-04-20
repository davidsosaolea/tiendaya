import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { Plus, Search, Package, Edit2, Trash2, Eye, EyeOff, ImagePlus } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { formatPrice } from '../../lib/whatsapp';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import './ProductsPage.css';

export default function ProductsPage() {
  const { currentStore } = useOutletContext();
  const { products, loading, createProduct, updateProduct, deleteProduct, toggleActive } = useProducts(currentStore?.id);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  if (!currentStore) return <PageSpinner />;

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditingProduct(null); setModalOpen(true); };
  const openEdit = (product) => { setEditingProduct(product); setModalOpen(true); };

  const handleSave = async (formData) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, formData);
    } else {
      await createProduct(formData);
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteProduct(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="products-page animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Productos</h1>
          <p className="page-subtitle">{products.length} productos en tu catálogo</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Nuevo producto</Button>
      </div>

      {products.length > 0 && (
        <div className="products-toolbar">
          <Input
            icon={Search}
            placeholder="Buscar productos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="products-search"
          />
        </div>
      )}

      {loading ? (
        <PageSpinner />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Sin productos aún"
          description="Agrega tu primer producto para empezar a vender"
          action={<Button icon={Plus} onClick={openCreate}>Agregar producto</Button>}
        />
      ) : (
        <div className="products-grid stagger-children">
          {filtered.map(product => (
            <Card key={product.id} className={`product-admin-card ${!product.is_active ? 'product-inactive' : ''}`}>
              <div className="product-admin-image">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} />
                ) : (
                  <div className="product-admin-no-image">
                    <ImagePlus size={28} />
                  </div>
                )}
                {!product.is_active && <div className="product-inactive-badge">Inactivo</div>}
              </div>
              <div className="product-admin-body">
                <h3 className="product-admin-name truncate">{product.name}</h3>
                <p className="product-admin-price">{formatPrice(product.price)}</p>
                {product.stock !== null && product.stock !== undefined && (
                  <span className="product-admin-stock">Stock: {product.stock}</span>
                )}
              </div>
              <div className="product-admin-actions">
                <button className="product-action-btn" onClick={() => toggleActive(product.id, !product.is_active)} title={product.is_active ? 'Desactivar' : 'Activar'}>
                  {product.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button className="product-action-btn" onClick={() => openEdit(product)} title="Editar">
                  <Edit2 size={16} />
                </button>
                <button className="product-action-btn product-action-danger" onClick={() => setDeleteConfirm(product)} title="Eliminar">
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingProduct ? 'Editar producto' : 'Nuevo producto'} size="md">
        <ProductForm product={editingProduct} onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar producto" size="sm">
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
          ¿Estás seguro de eliminar <strong>{deleteConfirm?.name}</strong>? Esta acción no se puede deshacer.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}

function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    image_url: product?.image_url || '',
    stock: product?.stock ?? '',
    category: product?.category || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        image_url: form.image_url || null,
        stock: form.stock !== '' ? parseInt(form.stock) : null,
        category: form.category || null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <Input label="Nombre del producto" placeholder="Ej: Polo negro talla M" value={form.name} onChange={handleChange('name')} required />
      <Input label="Precio (S/)" type="number" step="0.01" min="0" placeholder="0.00" value={form.price} onChange={handleChange('price')} required />
      <Input label="Descripción" type="textarea" placeholder="Describe tu producto..." value={form.description} onChange={handleChange('description')} />
      <Input label="URL de imagen" placeholder="https://..." value={form.image_url} onChange={handleChange('image_url')} />
      <div className="product-form-row">
        <Input label="Stock (opcional)" type="number" min="0" placeholder="∞" value={form.stock} onChange={handleChange('stock')} />
        <Input label="Categoría (opcional)" placeholder="Ej: Ropa" value={form.category} onChange={handleChange('category')} />
      </div>
      <div className="product-form-actions">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{product ? 'Guardar cambios' : 'Crear producto'}</Button>
      </div>
    </form>
  );
}
