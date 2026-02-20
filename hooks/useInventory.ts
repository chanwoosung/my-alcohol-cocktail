'use client';

import { useState, useEffect, useCallback } from 'react';
import { InventoryItem } from '@/types/inventoryTypes';

const STORAGE_KEY = 'cocktail-inventory';

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse inventory:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveToStorage = useCallback((newItems: InventoryItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  }, []);

  const addItem = useCallback((item: InventoryItem) => {
    setItems(prev => {
      if (prev.some(i => i.nameEn.toLowerCase() === item.nameEn.toLowerCase())) {
        return prev;
      }
      const newItems = [...prev, item];
      saveToStorage(newItems);
      return newItems;
    });
  }, [saveToStorage]);

  const removeItem = useCallback((id: string) => {
    setItems(prev => {
      const newItems = prev.filter(i => i.id !== id);
      saveToStorage(newItems);
      return newItems;
    });
  }, [saveToStorage]);

  const clearAll = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    items,
    isLoaded,
    addItem,
    removeItem,
    clearAll,
  };
};
