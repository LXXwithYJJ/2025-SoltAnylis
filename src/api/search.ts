import axios from 'axios';
import type { CriteriaRequest, SearchResponse, CitationTextURLParams } from '@/types/search';
import { mockSearchByCriteria, mockGetCitationText } from '@/mock/searchMock';

// 后端统一响应格式
export interface APIResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 从环境变量读取配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;
const ENABLE_MOCK_FALLBACK = import.meta.env.VITE_ENABLE_MOCK_FALLBACK !== 'false';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器（可用于添加 token 等）
apiClient.interceptors.request.use(
  (config) => {
    // 这里可以添加认证 token
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器（可用于统一处理后端响应格式和错误）
apiClient.interceptors.response.use(
  (response) => {
    // 检查后端返回的业务状态码
    const apiResponse = response.data as APIResponse<any>;
    
    if (apiResponse.code !== 200 && apiResponse.code !== 0) {
      // 业务错误（后端返回了，但业务失败）
      console.error('API 业务错误:', apiResponse.code, apiResponse.message);
      return Promise.reject(new Error(apiResponse.message || '请求失败'));
    }
    
    return response;
  },
  (error) => {
    // 网络错误或HTTP错误处理
    if (error.response) {
      // 服务器返回错误状态码（如404、500等）
      console.error('API HTTP错误:', error.response.status, error.response.data);
    } else if (error.request) {
      // 请求已发送但没有收到响应（网络问题）
      console.error('API 无响应:', error.message);
    } else {
      // 请求配置出错
      console.error('API 请求配置错误:', error.message);
    }
    return Promise.reject(error);
  }
);

// API 响应包装器（包含是否使用Mock数据的标记）
export interface ApiResponse<T> {
  data: T;
  isMockData: boolean;
}

// 按条件检索成果
// 优先调用真实API，如果失败且启用了Mock降级，则使用mock数据作为兜底
export const searchByCriteria = async (data: CriteriaRequest): Promise<ApiResponse<SearchResponse>> => {
  try {
    console.log('🔍 尝试调用真实 API...', { url: `${API_BASE_URL}/search/criteria` });
    
    // 调用后端接口，返回格式: { code, message, data }
    const response = await apiClient.post<APIResponse<SearchResponse>>('/search/criteria', data);
    
    // 解包后端统一响应格式，取出实际数据
    const apiResponse = response.data;
    
    console.log('✅ API 调用成功', { 
      code: apiResponse.code,
      message: apiResponse.message,
      totalElements: apiResponse.data.pageResult.totalElements,
      currentPage: apiResponse.data.pageResult.number 
    });
    
    return {
      data: apiResponse.data, // 取出 data 字段中的真实数据
      isMockData: false,
    };
  } catch (error) {
    // API调用失败
    if (ENABLE_MOCK_FALLBACK) {
      // 启用了Mock降级，使用mock数据
      if (axios.isAxiosError(error)) {
        console.warn('⚠️ API 调用失败，使用 Mock 数据兜底:', error.message);
      } else {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.warn('⚠️ API 调用出错，使用 Mock 数据兜底:', errMsg);
      }
      const mockData = await mockSearchByCriteria(data);
      return {
        data: mockData,
        isMockData: true,
      };
    } else {
      // 未启用Mock降级，直接抛出错误
      console.error('❌ API 调用失败:', error);
      throw error;
    }
  }
};

// 获取引用格式文本
// 优先调用真实API，如果失败且启用了Mock降级，则使用mock数据作为兜底
export const getCitationText = async (outputUuid: string): Promise<ApiResponse<string>> => {
  try {
    console.log('🔍 尝试调用真实 API 获取引用文本...', { 
      url: `${API_BASE_URL}/search/citation_text`,
      outputUuid 
    });

    // 调用后端接口，返回格式: { code, message, data }
    const response = await apiClient.get<APIResponse<string>>('/search/citation_text', {
      params: { outputUuid }
    });

    // 解包后端统一响应格式，取出实际数据
    const apiResponse = response.data;

    console.log('✅ API 调用成功', {
      code: apiResponse.code,
      message: apiResponse.message,
      citationLength: apiResponse.data.length
    });

    return {
      data: apiResponse.data, // 取出 data 字段中的真实引用文本
      isMockData: false,
    };
  } catch (error) {
    // API调用失败
    if (ENABLE_MOCK_FALLBACK) {
      // 启用了Mock降级，使用mock数据
      if (axios.isAxiosError(error)) {
        console.warn('⚠️ 获取引用文本 API 调用失败，使用 Mock 数据兜底:', error.message);
      } else {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.warn('⚠️ 获取引用文本 API 调用出错，使用 Mock 数据兜底:', errMsg);
      }
      const mockData = await mockGetCitationText(outputUuid);
      return {
        data: mockData,
        isMockData: true,
      };
    } else {
      // 未启用Mock降级，直接抛出错误
      console.error('❌ 获取引用文本 API 调用失败:', error);
      throw error;
    }
  }
};
