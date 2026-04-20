import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { ShoppingCart, Plus, Minus, X, MessageCircle, Phone, Trash2, Store, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { generateWhatsAppLink, formatPrice } from '../../lib/whatsapp';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { PageSpinner } from '../../components/ui/Spinner';
import './StorefrontPage.css';

export default function StorefrontPage() {
  const { slug } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [orderSending, setOrderSending] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: storeData, error } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !storeData) { setNotFound(true); setLoading(false); return; }
      setStore(storeData);

      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeData.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      setProducts(prods || []);
      setLoading(false);
    })();
  }, [slug]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev
      .map(item => item.id === productId ? { ...item, quantity: item.quantity + delta } : item)
      .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (!customer.name || !customer.phone) return;
    setOrderSending(true);

    try {
      // Create order in DB
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          store_id: store.id,
          customer_name: customer.name,
          customer_phone: customer.phone,
          total: cartTotal,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const items = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
      }));
      await supabase.from('order_items').insert(items);

      // Try to create/find customer
      const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('store_id', store.id)
        .eq('phone', cleanPhone)
        .single();

      if (!existingCustomer) {
        await supabase.from('customers').insert({
          store_id: store.id,
          name: customer.name,
          phone: cleanPhone,
        });
      }

      // Generate WhatsApp link and open
      const waLink = generateWhatsAppLink(
        store.phone,
        cart.map(item => ({ name: item.name, quantity: item.quantity, unitPrice: item.price })),
        cartTotal,
        customer.name,
        customer.phone,
        store.name,
        order.order_number || order.id.slice(0, 8)
      );

      window.open(waLink, '_blank');
      setCart([]);
      setCheckoutOpen(false);
      setCartOpen(false);
      setCustomer({ name: '', phone: '' });
    } catch (err) {
      console.error(err);
      alert('Error al crear el pedido. Intenta de nuevo.');
    } finally {
      setOrderSending(false);
    }
  };

  if (loading) return <div className="storefront-theme"><PageSpinner /></div>;

  if (notFound) {
    return (
      <div className="storefront-theme storefront-not-found">
        <Store size={64} strokeWidth={1} />
        <h1>Tienda no encontrada</h1>
        <p>La tienda que buscas no existe o fue desactivada.</p>
      </div>
    );
  }

  const primaryColor = store.primary_color || '#6366f1';

  return (
    <div className="storefront-theme" style={{ '--store-primary': primaryColor }}>
      {/* Header */}
      <header className="sf-header" style={{ background: store.banner_url ? `url(${store.banner_url}) center/cover` : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}>
        <div className="sf-header-overlay" />
        <div className="sf-header-content">
          {store.logo_url && <img src={store.logo_url} alt={store.name} className="sf-logo" />}
          <h1 className="sf-store-name">{store.name}</h1>
          {store.description && <p className="sf-store-desc">{store.description}</p>}
        </div>
      </header>

      {/* Cart FAB */}
      {cartCount > 0 && (
        <button className="sf-cart-fab" onClick={() => setCartOpen(true)}>
          <ShoppingCart size={22} />
          <span className="sf-cart-fab-count">{cartCount}</span>
        </button>
      )}

      {/* Products */}
      <main className="sf-main">
        <div className="sf-container">
          {products.length === 0 ? (
            <div className="sf-empty">
              <Store size={48} strokeWidth={1} />
              <p>Esta tienda aún no tiene productos</p>
            </div>
          ) : (
            <div className="sf-products-grid">
              {products.map(product => {
                const inCart = cart.find(item => item.id === product.id);
                return (
                  <div key={product.id} className="sf-product-card">
                    <div className="sf-product-image">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} />
                      ) : (
                        <div className="sf-product-no-image">
                          <ShoppingCart size={32} />
                        </div>
                      )}
                    </div>
                    <div className="sf-product-body">
                      <h3 className="sf-product-name">{product.name}</h3>
                      {product.description && <p className="sf-product-desc">{product.description}</p>}
                      <div className="sf-product-footer">
                        <span className="sf-product-price">{formatPrice(product.price)}</span>
                        {inCart ? (
                          <div className="sf-qty-control">
                            <button onClick={() => updateQuantity(product.id, -1)}><Minus size={16} /></button>
                            <span>{inCart.quantity}</span>
                            <button onClick={() => updateQuantity(product.id, 1)}><Plus size={16} /></button>
                          </div>
                        ) : (
                          <button className="sf-add-btn" onClick={() => addToCart(product)}>
                            <Plus size={18} /> Agregar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Cart Drawer */}
      {cartOpen && <div className="sf-drawer-overlay" onClick={() => { setCartOpen(false); setCheckoutOpen(false); }} />}
      <div className={`sf-cart-drawer ${cartOpen ? 'sf-cart-drawer-open' : ''}`}>
        <div className="sf-cart-header">
          <h2><ShoppingCart size={20} /> Tu pedido</h2>
          <button onClick={() => { setCartOpen(false); setCheckoutOpen(false); }}><X size={22} /></button>
        </div>

        {!checkoutOpen ? (
          <>
            <div className="sf-cart-items">
              {cart.length === 0 ? (
                <p className="sf-cart-empty">Tu carrito está vacío</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="sf-cart-item">
                    <div className="sf-cart-item-info">
                      <span className="sf-cart-item-name">{item.name}</span>
                      <span className="sf-cart-item-price">{formatPrice(item.price)} c/u</span>
                    </div>
                    <div className="sf-cart-item-actions">
                      <div className="sf-qty-control sf-qty-sm">
                        <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                      </div>
                      <span className="sf-cart-item-subtotal">{formatPrice(item.price * item.quantity)}</span>
                      <button className="sf-cart-remove" onClick={() => removeFromCart(item.id)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="sf-cart-footer">
                <div className="sf-cart-total">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <Button variant="whatsapp" fullWidth size="lg" icon={MessageCircle} onClick={() => setCheckoutOpen(true)}>
                  Pedir por WhatsApp
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="sf-checkout">
            <button className="sf-checkout-back" onClick={() => setCheckoutOpen(false)}>
              <ArrowLeft size={16} /> Volver al carrito
            </button>
            <h3 className="sf-checkout-title">Tus datos</h3>
            <p className="sf-checkout-desc">Para enviar tu pedido por WhatsApp</p>
            <div className="sf-checkout-form">
              <Input label="Tu nombre" placeholder="Juan Pérez" value={customer.name} onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))} required />
              <Input label="Tu WhatsApp" icon={Phone} placeholder="51999888777" value={customer.phone} onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))} required />
            </div>
            <div className="sf-cart-total" style={{ marginTop: 'var(--space-4)' }}>
              <span>Total a pagar</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <Button
              variant="whatsapp"
              fullWidth
              size="lg"
              icon={MessageCircle}
              loading={orderSending}
              onClick={handleCheckout}
              disabled={!customer.name || !customer.phone}
            >
              Enviar pedido por WhatsApp
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="sf-footer">
        <p>Powered by <strong>TiendaYa</strong></p>
      </footer>
    </div>
  );
}
