from abc import ABC, abstractmethod
from typing import Dict, Any
from datetime import datetime

class BaseModel(ABC):
    """基础模型类"""
    
    def __init__(self, id: str):
        self.id = id
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
    
    @abstractmethod
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            "id": self.id,
            "createdAt": self.created_at.isoformat(),
            "updatedAt": self.updated_at.isoformat()
        }
    
    def update(self):
        """更新修改时间"""
        self.updated_at = datetime.now()

class Serializable(ABC):
    """可序列化基类"""
    
    @abstractmethod
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        pass
    
    @classmethod
    @abstractmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Serializable':
        """从字典创建实例"""
        pass 