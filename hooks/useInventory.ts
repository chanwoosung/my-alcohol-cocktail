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
        const parsed = JSON.parse(stored);
        const normalized = Array.isArray(parsed)
          ? parsed
              .map((raw): InventoryItem | null => {
                if (!raw || typeof raw !== 'object') return null;
                const item = raw as Partial<InventoryItem> & { id?: unknown; name?: unknown; nameEn?: unknown; category?: unknown };
                const id = typeof item.id === 'string' && item.id ? item.id : `legacy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                const name = typeof item.name === 'string' ? item.name : '';
                const nameEnCandidate =
                  typeof item.nameEn === 'string' && item.nameEn.trim()
                    ? item.nameEn
                    : typeof item.name === 'string'
                      ? item.name
                      : '';
                const category =
                  item.category === 'base' || item.category === 'liqueur' || item.category === 'mixer' || item.category === 'other'
                    ? item.category
                    : 'base';

                if (!name || !nameEnCandidate) return null;
                return { id, name, nameEn: nameEnCandidate, category };
              })
              .filter((item): item is InventoryItem => item !== null)
          : [];

        setItems(normalized);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
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
