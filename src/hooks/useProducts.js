import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useProducts(storeId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .order('sort_order', { ascending: true });
    if (!error) setProducts(data || []);
    setLoading(false);
  }, [storeId]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const createProduct = async (productData) => {
    const { data, error } = await supabase
      .from('products')
      .insert({ ...productData, store_id: storeId })
      .select()
      .single();
    if (error) throw error;
    setProducts(prev => [...prev, data]);
    return data;
  };

  const updateProduct = async (id, updates) => {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setProducts(prev => prev.map(p => p.id === id ? data : p));
    return data;
  };

  const deleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleActive = async (id, isActive) => {
    return updateProduct(id, { is_active: isActive });
  };

  return { products, loading, createProduct, updateProduct, deleteProduct, toggleActive, refetch: fetchProducts };
}

export function usePublicProducts(storeId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      setProducts(data || []);
      setLoading(false);
    })();
  }, [storeId]);

  return { products, loading };
}
