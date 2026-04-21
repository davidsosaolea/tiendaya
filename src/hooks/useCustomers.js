import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useCustomers(storeId) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    if (!error) setCustomers(data || []);
    setLoading(false);
  }, [storeId]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const createCustomer = async (customerData) => {
    const { data, error } = await supabase
      .from('customers')
      .insert({ ...customerData, store_id: storeId })
      .select()
      .single();
    if (error) throw error;
    setCustomers(prev => [data, ...prev]);
    return data;
  };

  const findOrCreateCustomer = async (name, phone) => {
    const { data: existing } = await supabase
      .from('customers')
      .select('*')
      .eq('store_id', storeId)
      .eq('phone', phone)
      .maybeSingle();
    if (existing) return existing;
    return createCustomer({ name, phone });
  };

  const updateCustomer = async (id, updates) => {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setCustomers(prev => prev.map(c => c.id === id ? data : c));
    return data;
  };

  return { customers, loading, createCustomer, findOrCreateCustomer, updateCustomer, refetch: fetchCustomers };
}
