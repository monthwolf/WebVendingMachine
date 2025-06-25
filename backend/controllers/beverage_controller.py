import json
import os
from typing import Dict, Any
from flask import jsonify
from models.beverage import Beverage, Condiment
from views.response import ApiResponse

class BeverageController:
    """饮料控制器"""
    
    def __init__(self):
        # 获取当前文件所在目录
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # 加载饮料和配料数据
        with open(os.path.join(current_dir, "config/beverages.json"), "r", encoding="utf-8") as f:
            self.beverages = {k: Beverage.from_dict(v) for k, v in json.load(f).items()}
            
        with open(os.path.join(current_dir, "config/condiments.json"), "r", encoding="utf-8") as f:
            self.condiments = {k: Condiment.from_dict(v) for k, v in json.load(f).items()}
    
    def get_all_beverages(self) -> Dict[str, Any]:
        """获取所有饮料"""
        try:
            beverages_dict = {k: v.to_dict() for k, v in self.beverages.items()}
            return ApiResponse.success(data=beverages_dict)
        except Exception as e:
            return ApiResponse.error(str(e))
    
    def get_all_condiments(self) -> Dict[str, Any]:
        """获取所有配料"""
        try:
            condiments_dict = {k: v.to_dict() for k, v in self.condiments.items()}
            return ApiResponse.success(data=condiments_dict)
        except Exception as e:
            return ApiResponse.error(str(e))
    
    def get_beverage(self, beverage_id: str) -> Dict[str, Any]:
        """获取指定饮料"""
        try:
            if beverage_id not in self.beverages:
                return ApiResponse.error("饮料不存在")
            return ApiResponse.success(data=self.beverages[beverage_id].to_dict())
        except Exception as e:
            return ApiResponse.error(str(e))
    
    def get_condiment(self, condiment_id: str) -> Dict[str, Any]:
        """获取指定配料"""
        try:
            if condiment_id not in self.condiments:
                return ApiResponse.error("配料不存在")
            return ApiResponse.success(data=self.condiments[condiment_id].to_dict())
        except Exception as e:
            return ApiResponse.error(str(e)) 