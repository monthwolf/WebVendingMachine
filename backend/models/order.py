from typing import Dict, Any, List, Optional
from datetime import datetime
from models.base import Serializable
from models.beverage import Beverage, Condiment

class OrderStatus:
    """订单状态"""
    PENDING = "pending"  # 待处理
    PROCESSING = "processing"  # 处理中
    COMPLETED = "completed"  # 已完成
    CANCELLED = "cancelled"  # 已取消

class Order(Serializable):
    """订单类"""
    
    def __init__(self, id: str, beverage: Beverage, condiments: List[Dict[str, Any]], 
                 status: str = OrderStatus.PENDING, created_at: Optional[datetime] = None):
        self.id = id
        self.beverage = beverage
        self.condiments = condiments
        self.status = status
        self.created_at = created_at or datetime.now()
        
        # 计算总价和总卡路里
        self.total_price = beverage.price
        self.total_calories = beverage.calories
        
        for condiment in condiments:
            quantity = condiment.get("quantity", 1)
            self.total_price += condiment["price"] * quantity
            self.total_calories += condiment["calories"] * quantity
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式，适配前端期望的格式"""
        # 创建订单项列表
        items = []
        
        # 添加饮料项
        items.append({
            "id": self.beverage.id,
            "quantity": 1,
            "type": "beverage",
            "price": self.beverage.price
        })
        
        # 添加配料项
        for condiment in self.condiments:
            items.append({
                "id": condiment["id"],
                "quantity": condiment.get("quantity", 1),
                "type": "condiment",
                "price": condiment["price"]
            })
        
        return {
            "id": self.id,
            "items": items,
            "total": self.total_price,
            "status": self.status,
            "createdAt": self.created_at.isoformat(),
            "updatedAt": self.created_at.isoformat(),
            # 保留原有字段以便兼容
            "beverage": self.beverage.to_dict(),
            "condiments": self.condiments,
            "created_at": self.created_at.isoformat(),
            "total_price": self.total_price,
            "total_calories": self.total_calories
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Order':
        """从字典创建实例"""
        return cls(
            id=data["id"],
            beverage=Beverage.from_dict(data["beverage"]),
            condiments=data["condiments"],
            status=data.get("status", OrderStatus.PENDING),
            created_at=datetime.fromisoformat(data["created_at"]) if "created_at" in data else None
        ) 