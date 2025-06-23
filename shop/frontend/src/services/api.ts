import axios from 'axios';
import { Beverage, Condiment, Order, Recommendation, ChatMessage, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 获取所有饮料
export const fetchBeverages = async (): Promise<Record<string, Beverage>> => {
  const response = await api.get<ApiResponse<Record<string, Beverage>>>('/beverages');
  if (!response.data.success) {
    throw new Error(response.data.error || '获取饮料列表失败');
  }
  return response.data.data || {};
};

// 获取所有配料
export const fetchCondiments = async (): Promise<Record<string, Condiment>> => {
  const response = await api.get<ApiResponse<Record<string, Condiment>>>('/condiments');
  if (!response.data.success) {
    throw new Error(response.data.error || '获取配料列表失败');
  }
  return response.data.data || {};
};

// 提交订单
export const placeOrder = async (
  beverageId: string,
  condiments: { id: string; quantity: number; }[]
): Promise<ApiResponse<{ order: Order }>> => {
  const response = await api.post<ApiResponse<{ order: Order }>>('/orders', {
    beverage: beverageId,
    condiments,
  });
  if (!response.data.success) {
    throw new Error(response.data.error || '提交订单失败');
  }
  return response.data;
};

// 获取历史订单
export const fetchOrderHistory = async (): Promise<ApiResponse<{ history: Order[] }>> => {
  const response = await api.get<ApiResponse<{ history: Order[] }>>('/orders/history');
  if (!response.data.success) {
    throw new Error(response.data.error || '获取历史订单失败');
  }
  return response.data;
};

// 获取推荐
export const fetchRecommendation = async (): Promise<ApiResponse<{ recommendation: Recommendation }>> => {
  const response = await api.get<ApiResponse<{ recommendation: Recommendation }>>('/recommendation');
  if (!response.data.success) {
    throw new Error(response.data.error || '获取推荐失败');
  }
  return response.data;
};

// 发送聊天消息
export const sendChatMessage = async (message: string): Promise<ApiResponse<{ content: string }>> => {
  const response = await api.post<ApiResponse<{ content: string }>>('/chat', { message });
  if (!response.data.success) {
    throw new Error(response.data.error || '发送消息失败');
  }
  return response.data;
}; 