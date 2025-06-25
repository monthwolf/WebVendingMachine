// 饮料类型
export interface Beverage {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'coffee' | 'tea' | 'soda' | 'juice';
  hot: boolean;
  calories: number;
}

// 配料类型
export interface Condiment {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'dairy' | 'sweetener' | 'syrup' | 'topping' | 'other';
  calories: number;
}

// 订单状态
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

// 订单项类型
export interface OrderItem {
  id: string;
  quantity: number;
  type: 'beverage' | 'condiment';
  price: number;
}

// 订单类型
export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

// 推荐类型
export interface Recommendation {
  beverage: string;
  beverageName?: string;
  condiments: Array<string | {
    id: string;
    name?: string;
    quantity: number;
  }>;
  reason: string;
  explanation?: string;
}

// AI模型信息类型
export interface ModelInfo {
  provider?: string;
  model?: string;
  error?: string;
}

// AI推荐结果类型
export interface AiRecommendationResult {
  recommendation: Recommendation;
  code: string | null;
  model_info: ModelInfo | null;
}

// 聊天消息类型
export interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  time: string;
  model_info?: ModelInfo;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 