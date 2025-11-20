import axios from 'axios';
import type { CriteriaRequest, SearchResponse } from '@/types/search';

// 创建axios实例
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 按条件检索成果
export const searchByCriteria = async (data: CriteriaRequest): Promise<SearchResponse> => {
  const response = await apiClient.post<SearchResponse>('/search/criteria', data);
  return response.data;
};
