/**
 * Generates a WhatsApp wa.me link with a pre-filled order message.
 *
 * @param {string} phone - Store phone number in international format (e.g. "51999888777")
 * @param {Array} items - Array of { name, quantity, unitPrice }
 * @param {number} total - Order total
 * @param {string} customerName - Customer name
 * @param {string} customerPhone - Customer phone
 * @param {string} storeName - Store name
 * @param {string|number} orderNumber - Order reference number
 * @returns {string} Full wa.me URL
 */
export function generateWhatsAppLink(phone, items, total, customerName, customerPhone, storeName, orderNumber) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const itemLines = items
    .map(item => `• ${item.quantity}x ${item.name} - S/${(item.unitPrice * item.quantity).toFixed(2)}`)
    .join('\n');

  const message = `🛒 *Nuevo Pedido - ${storeName}*

📦 Productos:
${itemLines}

💰 *Total: S/${total.toFixed(2)}*

👤 Cliente: ${customerName}
📱 Tel: ${customerPhone}

📋 Pedido #${orderNumber}`;

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

/**
 * Generates a simple WhatsApp link for a single product inquiry.
 */
export function generateProductLink(phone, productName, price, storeName) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const message = `Hola! Me interesa el producto *${productName}* (S/${price.toFixed(2)}) de *${storeName}*. ¿Está disponible?`;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

/**
 * Format price in Peruvian Soles.
 */
export function formatPrice(amount) {
  return `S/${Number(amount).toFixed(2)}`;
}

/**
 * Format phone number for display.
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('51') && clean.length === 11) {
    return `+51 ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}`;
  }
  return phone;
}
