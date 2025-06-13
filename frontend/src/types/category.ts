export interface Category {
  id: number;
  userId: number;
  name: string;
  color: string;
  icon: string;
  description?: string;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
  color?: string;
  icon?: string;
  description?: string;
}
