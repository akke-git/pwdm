import api from './axios';
import type { Category, CategoryFormData } from '../types/category';

// 모든 카테고리 조회
export const getAllCategories = async (): Promise<Category[]> => {
  const token = localStorage.getItem('token');
  const response = await api.get('/categories', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};

// 특정 카테고리 조회
export const getCategory = async (id: number): Promise<Category> => {
  const token = localStorage.getItem('token');
  const response = await api.get(`/categories/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};

// 카테고리 생성
export const createCategory = async (categoryData: CategoryFormData): Promise<Category> => {
  const token = localStorage.getItem('token');
  const response = await api.post('/categories', categoryData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};

// 카테고리 수정
export const updateCategory = async (id: number, categoryData: CategoryFormData): Promise<Category> => {
  const token = localStorage.getItem('token');
  const response = await api.put(`/categories/${id}`, categoryData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};

// 카테고리 삭제
export const deleteCategory = async (id: number, reassignTo?: number): Promise<void> => {
  const token = localStorage.getItem('token');
  const url = reassignTo ? `/categories/${id}?reassignTo=${reassignTo}` : `/categories/${id}`;
  await api.delete(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// 카테고리 통계 조회
export const getCategoryStats = async (): Promise<any> => {
  const token = localStorage.getItem('token');
  const response = await api.get('/categories/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};
