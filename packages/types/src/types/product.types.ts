export interface Product {
  id: string;
  name: string;
  subtitle: string | null;
  category: string;
  brand: string;
  price: number;
  details: string | null;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface CreateProductRequest {
  name: string;
  subtitle?: string;
  category: string;
  brand: string;
  price: number;
  details?: string;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

export interface ProductListItem {
  id: string;
  name: string;
  subtitle: string | null;
  category: string;
  productId: string;
  price: number;
}
