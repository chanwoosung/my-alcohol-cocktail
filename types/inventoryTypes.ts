export interface InventoryItem {
  id: string;
  name: string;
  nameEn: string;
  category: 'base' | 'liqueur' | 'mixer' | 'other';
}

export interface InventoryState {
  items: InventoryItem[];
}
