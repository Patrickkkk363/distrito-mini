export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'cashier';
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string | null;
  description: string | null;
  category_id: string | null;
  purchase_price: number;
  price: number;
  stock: number;
  min_stock: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Sale {
  id: string;
  cashier_id: string;
  total_amount: number;
  amount_paid: number;
  change_given: number;
  payment_method: 'cash' | 'card' | 'yape' | 'plin';
  status: 'completed' | 'cancelled';
  created_at: string;
  cashier?: Profile;
  items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: Product;
}

export interface StockMovement {
  id: string;
  product_id: string;
  user_id: string | null;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  stock_before: number;
  stock_after: number;
  reason: string | null;
  created_at: string;
  product?: Product;
  user?: Profile;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'cash' | 'card' | 'yape' | 'plin';
