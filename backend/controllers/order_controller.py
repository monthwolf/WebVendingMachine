from typing import Dict, Any
from flask import request
from models.order import OrderStatus
from services.order_service import OrderService
from views.response import ApiResponse

class OrderController:
    """订单控制器"""
    
    def __init__(self):
        self.order_service = OrderService()
    
    def place_order(self) -> Dict[str, Any]:
        """提交订单"""
        try:
            data = request.get_json()
            if not data:
                return ApiResponse.error("无效的请求数据")
            
            beverage_id = data.get("beverage")
            condiments = data.get("condiments", [])
            
            if not beverage_id:
                return ApiResponse.error("未指定饮料")
            
            # 创建订单
            order = self.order_service.create_order(beverage_id, condiments)
            if not order:
                return ApiResponse.error("创建订单失败")
            
            return ApiResponse.success(data={"order": order.to_dict()})
        except Exception as e:
            return ApiResponse.error(str(e))
    
    def get_order_history(self) -> Dict[str, Any]:
        """获取历史订单"""
        try:
            history = self.order_service.get_order_history()
            return ApiResponse.success(data={"history": [order.to_dict() for order in history]})
        except Exception as e:
            return ApiResponse.error(str(e))
    
    def get_order(self, order_id: str) -> Dict[str, Any]:
        """获取指定订单"""
        try:
            order = self.order_service.get_order(order_id)
            if not order:
                return ApiResponse.error("订单不存在")
            return ApiResponse.success(data=order.to_dict())
        except Exception as e:
            return ApiResponse.error(str(e))
    
    def update_order_status(self, order_id: str, status: str) -> Dict[str, Any]:
        """更新订单状态"""
        try:
            if status not in [OrderStatus.PENDING, OrderStatus.PROCESSING, 
                            OrderStatus.COMPLETED, OrderStatus.CANCELLED]:
                return ApiResponse.error("无效的订单状态")
            
            order = self.order_service.update_order_status(order_id, status)
            if not order:
                return ApiResponse.error("更新订单状态失败")
            
            return ApiResponse.success(data=order.to_dict())
        except Exception as e:
            return ApiResponse.error(str(e)) 