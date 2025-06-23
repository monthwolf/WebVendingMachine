#!/usr/bin/env python
# -*- coding: utf-8 -*-

from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime
from enum import Enum

class OrderStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

@dataclass
class BeverageModel:
    id: str
    category: str  # 'coffee' | 'tea' | 'soda' | 'juice'
    name: str
    price: float
    description: str
    calories: int
    hot: bool
    image: str

@dataclass
class CondimentModel:
    id: str
    category: str  # 'dairy' | 'sweetener' | 'syrup' | 'topping' | 'other'
    name: str
    price: float
    description: str
    calories: int
    image: str

@dataclass
class CondimentQuantity:
    id: str
    quantity: int

@dataclass
class OrderItem:
    id: str
    type: str  # 'beverage' or 'condiment'
    quantity: int
    price: float # Price of a single unit at the time of order

@dataclass
class OrderModel:
    id: str
    items: List[OrderItem]
    total: float
    status: OrderStatus
    createdAt: datetime
    updatedAt: datetime

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "items": [
                {
                    "id": item.id,
                    "type": item.type,
                    "quantity": item.quantity,
                    "price": item.price,
                }
                for item in self.items
            ],
            "total": self.total,
            "status": self.status.value,
            "createdAt": self.createdAt.isoformat(),
            "updatedAt": self.updatedAt.isoformat()
        }

# 基础饮料类
class Beverage:
    def __init__(self):
        self.description = "未知饮料"
        
    def get_description(self):
        return self.description
    
    def get_cost(self):
        pass

# 可乐
class Coca(Beverage):
    def __init__(self):
        self.description = "可口可乐"
    
    def get_cost(self):
        return 5.0

# 咖啡
class Coffee(Beverage):
    def __init__(self):
        self.description = "咖啡"
    
    def get_cost(self):
        return 7.0

# 不存在的饮料处理
class NoBeverage(Beverage):
    def __init__(self):
        self.description = "没有您所点的饮料，请重新点(coca或coffee)。"
    
    def get_cost(self):
        return 0.0

# 装饰器基类
class Decorator(Beverage):
    def __init__(self, beverage):
        super().__init__()
        self.beverage = beverage
        
    def get_description(self):
        return self.beverage.get_description()
    
    def get_cost(self):
        return self.beverage.get_cost()

# 牛奶配料
class Milk(Decorator):
    def __init__(self, beverage):
        super().__init__(beverage)
        
    def get_description(self):
        return self.beverage.get_description() + "，加牛奶"
    
    def get_cost(self):
        return self.beverage.get_cost() + 2.0

# 冰块配料
class Ice(Decorator):
    def __init__(self, beverage):
        super().__init__(beverage)
        
    def get_description(self):
        return self.beverage.get_description() + "，加冰"
    
    def get_cost(self):
        return self.beverage.get_cost() + 1.0

# 不存在的配料处理
class NoDecorator(Decorator):
    def __init__(self, beverage):
        super().__init__(beverage)
        self.description = "没有您所点的配料，请重新点(milk或ice)。"
        
    def get_description(self):
        return self.beverage.get_description() + "，" + self.description
    
    def get_cost(self):
        return self.beverage.get_cost() 