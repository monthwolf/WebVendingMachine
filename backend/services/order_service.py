import json
import uuid
import os
from typing import Dict, List, Optional, Any
from datetime import datetime
from models.order import Order, OrderStatus
from models.beverage import Beverage, Condiment, BeverageDecorator

class OrderService:
    """订单服务"""
    
    def __init__(self):
        # 获取当前文件所在目录
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # 加载饮料和配料数据
        with open(os.path.join(current_dir, "config/beverages.json"), "r", encoding="utf-8") as f:
            data = json.load(f)
            self.beverages: Dict[str, Beverage] = {}
            for k, v in data.items():
                self.beverages[k] = Beverage.from_dict(v)
            
        with open(os.path.join(current_dir, "config/condiments.json"), "r", encoding="utf-8") as f:
            data = json.load(f)
            self.condiments: Dict[str, Condiment] = {}
            for k, v in data.items():
                self.condiments[k] = Condiment.from_dict(v)
        
        # 内存中存储订单
        self.orders: Dict[str, Order] = {}
    
    def create_order(self, beverage_id: str, condiments: List[Dict[str, str]]) -> Optional[Order]:
        """创建订单"""
        try:
            # 验证饮料是否存在
            if beverage_id not in self.beverages:
                raise ValueError("饮料不存在")
            
            beverage = self.beverages[beverage_id]
            
            # 验证配料是否存在并装饰饮料
            for condiment_data in condiments:
                condiment_id = condiment_data.get("id")
                if not condiment_id or condiment_id not in self.condiments:
                    raise ValueError(f"配料 {condiment_id} 不存在")
                
                condiment = self.condiments[condiment_id]
                quantity = int(condiment_data.get("quantity", 1))
                
                # 使用装饰器模式添加配料
                beverage = BeverageDecorator(beverage, condiment, quantity)
            
            # 创建订单
            order_id = str(uuid.uuid4())
            order = Order(
                id=order_id,
                beverage=beverage,
                condiments=getattr(beverage, 'condiments', []),
                status=OrderStatus.PENDING,
                created_at=datetime.now()
            )
            
            # 保存订单
            self.orders[order_id] = order
            return order
            
        except Exception as e:
            print(f"创建订单失败: {str(e)}")
            return None
    
    def get_order(self, order_id: str) -> Optional[Order]:
        """获取订单"""
        return self.orders.get(order_id)
    
    def get_order_history(self) -> List[Order]:
        """获取历史订单"""
        return list(self.orders.values())
    
    def update_order_status(self, order_id: str, status: str) -> Optional[Order]:
        """更新订单状态"""
        order = self.orders.get(order_id)
        if order:
            order.status = status
            return order
        return None
    
    def calculate_order_total(self, beverage_id: str, selected_condiments: List[Dict[str, Any]]) -> float:
        """计算订单总价"""
        if beverage_id not in self.beverages:
            raise ValueError("无效的饮料选择")
        
        beverage = self.beverages[beverage_id]
        total = beverage.price
        
        for condiment_data in selected_condiments:
            condiment_id = condiment_data.get('id')
            quantity = condiment_data.get('quantity', 1)
            
            if not condiment_id or condiment_id not in self.condiments:
                raise ValueError(f"无效的配料: {condiment_id}")
            
            condiment = self.condiments[condiment_id]
            total += condiment.price * quantity
        
        return total 