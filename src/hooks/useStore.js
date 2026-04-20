import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useStore() {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [currentStore, setCurrentStore] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStores = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setStores(data);
      if (!currentStore && data.length > 0) {
        setCurrentStore(data[0]);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const createStore = async (storeData) => {
    const { data, error } = await supabase
      .from('stores')
      .insert({ ...storeData, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    setStores(prev => [...prev, data]);
    if (!currentStore) setCurrentStore(data);
    return data;
  };

  const updateStore = async (id, updates) => {
    const { data, error } = await supabase
      .from('stores')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setStores(prev => prev.map(s => s.id === id ? data : s));
    if (currentStore?.id === id) setCurrentStore(data);
    return data;
  };

  const getStoreBySlug = async (slug) => {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  };

  return { stores, currentStore, setCurrentStore, loading, createStore, updateStore, getStoreBySlug, refetch: fetchStores };
}
