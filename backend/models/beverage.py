from abc import ABC, abstractmethod
from typing import Dict, Any, List
from models.base import Serializable

class Beverage(Serializable):
    """饮料基类"""
    
    def __init__(self, id: str, category: str, name: str, price: float, description: str = "", 
                 calories: int = 0, hot: bool = True, image: str = ""):
        self.id = id
        self.category = category
        self.name = name
        self.price = price
        self.description = description
        self.calories = calories
        self.hot = hot
        self.image = image
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            "id": self.id,
            "category": self.category,
            "name": self.name,
            "price": self.price,
            "description": self.description,
            "calories": self.calories,
            "hot": self.hot,
            "image": self.image
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Beverage':
        """从字典创建实例"""
        return cls(
            id=data["id"],
            category=data["category"],
            name=data["name"],
            price=data["price"],
            description=data.get("description", ""),
            calories=data.get("calories", 0),
            hot=data.get("hot", True),
            image=data.get("image", "")
        )

class Condiment(Serializable):
    """配料基类"""
    
    def __init__(self, id: str, category: str, name: str, price: float, description: str = "",
                 calories: int = 0, image: str = ""):
        self.id = id
        self.category = category
        self.name = name
        self.price = price
        self.description = description
        self.calories = calories
        self.image = image
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            "id": self.id,
            "category": self.category,
            "name": self.name,
            "price": self.price,
            "description": self.description,
            "calories": self.calories,
            "image": self.image
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Condiment':
        """从字典创建实例"""
        return cls(
            id=data["id"],
            category=data["category"],
            name=data["name"],
            price=data["price"],
            description=data.get("description", ""),
            calories=data.get("calories", 0),
            image=data.get("image", "")
        )

class BeverageDecorator(Beverage):
    """饮料装饰器基类"""
    
    def __init__(self, beverage: Beverage, condiment: Condiment, quantity: int = 1):
        super().__init__(
            id=beverage.id,
            category=beverage.category,
            name=beverage.name,
            price=beverage.price + condiment.price * quantity,
            description=beverage.description,
            calories=beverage.calories + condiment.calories * quantity,
            hot=beverage.hot,
            image=beverage.image
        )
        self._beverage = beverage
        self._condiment = condiment
        self.quantity = quantity
        self.condiments = getattr(beverage, 'condiments', []) + [{
            **condiment.to_dict(),
            "quantity": quantity
        }]
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        base_dict = super().to_dict()
        base_dict["condiments"] = self.condiments
        return base_dict

class Coffee(Beverage):
    """咖啡类"""
    
    def __init__(self, id: str, name: str, price: float, description: str = "", calories: int = 0):
        super().__init__(id, "coffee", name, price, description, calories, True, "")
    
    def get_cost(self) -> float:
        return self.price
    
    def get_description(self) -> str:
        return self.description

class Tea(Beverage):
    """茶类"""
    
    def __init__(self, id: str, name: str, price: float, description: str = "", calories: int = 0):
        super().__init__(id, "tea", name, price, description, calories, True, "")
    
    def get_cost(self) -> float:
        return self.price
    
    def get_description(self) -> str:
        return self.description

class Soda(Beverage):
    """汽水类"""
    
    def __init__(self, id: str, name: str, price: float, description: str = "", calories: int = 0):
        super().__init__(id, "soda", name, price, description, calories, False, "")
    
    def get_cost(self) -> float:
        return self.price
    
    def get_description(self) -> str:
        return self.description

class Juice(Beverage):
    """果汁类"""
    
    def __init__(self, id: str, name: str, price: float, description: str = "", calories: int = 0):
        super().__init__(id, "juice", name, price, description, calories, False, "")
    
    def get_cost(self) -> float:
        return self.price
    
    def get_description(self) -> str:
        return self.description

class Milk(BeverageDecorator):
    """牛奶装饰器"""
    def __init__(self, beverage: Beverage):
        super().__init__(
            beverage=beverage,
            condiment=Condiment(
                id="milk",
                category="milk",
                name="牛奶",
                price=2.0,
                description="添加牛奶",
                calories=50,
                image=""
            ),
            quantity=1
        )

class Sugar(BeverageDecorator):
    """糖装饰器"""
    def __init__(self, beverage: Beverage):
        super().__init__(
            beverage=beverage,
            condiment=Condiment(
                id="sugar",
                category="sugar",
                name="糖",
                price=1.0,
                description="添加糖",
                calories=30,
                image=""
            ),
            quantity=1
        )

class Ice(BeverageDecorator):
    """冰块装饰器"""
    def __init__(self, beverage: Beverage):
        super().__init__(
            beverage=beverage,
            condiment=Condiment(
                id="ice",
                category="ice",
                name="冰块",
                price=0.5,
                description="添加冰块",
                calories=0,
                image=""
            ),
            quantity=1
        )

class BeverageFactory:
    """饮料工厂类"""
    
    _beverage_types = {
        "coffee": Coffee,
        "tea": Tea,
        "soda": Soda,
        "juice": Juice
    }
    
    _condiment_types = {
        "milk": Milk,
        "sugar": Sugar,
        "ice": Ice
    }
    
    @classmethod
    def create_beverage(cls, beverage_type: str, **kwargs) -> Beverage:
        """创建饮料"""
        if beverage_type not in cls._beverage_types:
            raise ValueError(f"不支持的饮料类型: {beverage_type}")
        
        return cls._beverage_types[beverage_type](**kwargs)
    
    @classmethod
    def add_condiment(cls, beverage: Beverage, condiment_type: str) -> Beverage:
        """添加配料"""
        if condiment_type not in cls._condiment_types:
            raise ValueError(f"不支持的配料类型: {condiment_type}")
        
        return cls._condiment_types[condiment_type](beverage)
    
    @classmethod
    def create_beverage_with_condiments(cls, beverage_type: str, condiments: List[str], **kwargs) -> Beverage:
        """创建带配料的饮料"""
        beverage = cls.create_beverage(beverage_type, **kwargs)
        
        for condiment in condiments:
            beverage = cls.add_condiment(beverage, condiment)
        
        return beverage 