export type FnbCategory = 'POPCORN' | 'DRINK' | 'SNACK';

export type FnbStatus = 'AVAILABLE' | 'UNAVAILABLE';

export interface FnbItem {
  id: number;
  name: string;
  category: FnbCategory;
  price: number;
  imageUrl: string | null;
  status: FnbStatus;
  deleted: boolean;
}

export interface FnbComboItem {
  itemId: number;
  itemName: string;
  category: FnbCategory;
  unitPrice: number;
  quantity: number;
  itemStatus: FnbStatus;
  itemDeleted: boolean;
}

export interface FnbCombo {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  status: FnbStatus;
  items: FnbComboItem[];
  itemsTotalPrice: number;
  orderable: boolean;
  deleted: boolean;
}

export interface FnbBestSellers {
  comboIds: number[];
  itemIds: number[];
}

export interface FnbMenu {
  combos: FnbCombo[];
  items: FnbItem[];
}

export interface FnbItemRequest {
  name: string;
  category: FnbCategory;
  price: number;
  imageUrl: string | null;
  status: FnbStatus;
}

export interface FnbComboItemRequest {
  itemId: number;
  quantity: number;
}

export interface FnbComboRequest {
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  status: FnbStatus;
  items: FnbComboItemRequest[];
}

export interface FnbItemSearchParams {
  keyword?: string;
  category?: FnbCategory;
  status?: FnbStatus;
  deleted: boolean;
  page: number;
  size: number;
}

export interface FnbComboSearchParams {
  keyword?: string;
  status?: FnbStatus;
  deleted: boolean;
  page: number;
  size: number;
}
