import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useOrders(storeId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0, shipped: 0, delivered: 0 });

  const fetchOrders = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setOrders(data);
      setStats({
        total: data.length,
        pending: data.filter(o => o.status === 'pending').length,
        paid: data.filter(o => o.status === 'paid').length,
        shipped: data.filter(o => o.status === 'shipped').length,
        delivered: data.filter(o => o.status === 'delivered').length,
      });
    }
    setLoading(false);
  }, [storeId]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const createOrder = async (orderData, items) => {
    const { data: order, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    if (error) throw error;

    if (items && items.length > 0) {
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.quantity * item.unit_price,
      }));
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;
    }

    await fetchOrders();
    return order;
  };

  const updateOrderStatus = async (id, status) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, order_items(*)')
      .single();
    if (error) throw error;
    setOrders(prev => prev.map(o => o.id === id ? data : o));
    return data;
  };

  const getMonthlyRevenue = () => {
    const now = new Date();
    const thisMonth = orders.filter(o => {
      const d = new Date(o.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && o.status !== 'cancelled';
    });
    return thisMonth.reduce((sum, o) => sum + Number(o.total), 0);
  };

  const getWeeklySales = () => {
    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const dayOrders = orders.filter(o => o.created_at.startsWith(dayStr) && o.status !== 'cancelled');
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      days.push({
        day: dayNames[d.getDay()],
        date: dayStr,
        sales: dayOrders.reduce((sum, o) => sum + Number(o.total), 0),
        count: dayOrders.length,
      });
    }
    return days;
  };

  return { orders, loading, stats, createOrder, updateOrderStatus, getMonthlyRevenue, getWeeklySales, refetch: fetchOrders };
}
