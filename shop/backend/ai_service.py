#!/usr/bin/env python
# -*- coding: utf-8 -*-

import random
from typing import Dict, List, Optional

class AiRecommendationService:
    """饮料推荐AI服务"""
    
    def __init__(self):
        # 初始化推荐模型和数据
        self.default_recommendations = [
            {
                'beverage': 'coffee',
                'condiments': ['milk', 'sugar'],
                'reason': '经典搭配，香浓可口'
            },
            {
                'beverage': 'latte',
                'condiments': ['vanilla', 'cream'],
                'reason': '香草风味，甜蜜享受'
            },
            {
                'beverage': 'mocha',
                'condiments': ['cream', 'chocolate'],
                'reason': '巧克力控的最爱'
            },
            {
                'beverage': 'americano',
                'condiments': ['ice', 'caramel'],
                'reason': '清爽解暑，焦糖点缀'
            }
        ]
    
    def get_recommendation(self):
        """获取随机推荐"""
        return random.choice(self.default_recommendations)
    
    def get_personalized_recommendation(self, order_history: Optional[List[Dict]] = None):
        """基于用户历史获取个性化推荐"""
        if not order_history:
            return self.get_recommendation()
            
        # 分析用户历史订单数据
        beverage_count = {}
        condiment_count = {}
        
        for order in order_history:
            for item in order.items:
                if not isinstance(item, dict):
                    item = item.__dict__
                
                beverage = item.get('beverage')
                if beverage:
                    beverage_count[beverage] = beverage_count.get(beverage, 0) + 1
                
                for condiment in item.get('condiments', []):
                    if isinstance(condiment, dict):
                        condiment_id = condiment.get('id')
                    else:
                        condiment_id = condiment.id
                    
                    if condiment_id:
                        condiment_count[condiment_id] = condiment_count.get(condiment_id, 0) + 1
        
        # 如果没有历史数据，返回随机推荐
        if not beverage_count:
            return self.get_recommendation()
        
        # 找出最常点的饮料
        preferred_beverage = max(beverage_count.keys(), key=lambda k: beverage_count[k])
        
        # 找出最常用的配料
        preferred_condiments = sorted(
            list(condiment_count.keys()),
            key=lambda k: condiment_count[k],
            reverse=True
        )[:2]  # 最多推荐两种配料
        
        # 如果没有配料偏好，使用默认推荐
        if not preferred_condiments:
            for rec in self.default_recommendations:
                if rec['beverage'] == preferred_beverage:
                    return rec
        
        return {
            'beverage': preferred_beverage,
            'condiments': preferred_condiments,
            'reason': '根据您的历史订单推荐'
        }


class BeverageChatbot:
    """饮料聊天机器人"""
    
    def __init__(self):
        self.greetings = [
            '您好！欢迎使用智能饮料售货机，需要什么饮料？',
            '您好！今天想喝点什么？',
            '欢迎光临！需要咖啡还是茶？'
        ]
        
        self.recommendations = [
            '为您推荐{beverage}，{reason}',
            '今天的推荐是{beverage}，{reason}',
            '{beverage}非常适合现在享用，{reason}'
        ]
        
        self.beverage_info = {
            'coffee': '咖啡富含抗氧化物质，适量饮用有益健康',
            'latte': '拿铁口感香浓，奶香四溢',
            'mocha': '摩卡是咖啡与巧克力的完美结合',
            'americano': '美式咖啡清淡醇厚，回味悠长',
            'tea': '茶类饮品含有茶多酚，具有抗氧化功效',
            'juice': '果汁富含维生素，补充能量好选择',
            'soda': '汽水清爽解暑，但要适量饮用'
        }
        
        self.default_responses = [
            '我们有多种饮品供您选择，包括咖啡、茶、果汁和汽水，您想尝试哪种？',
            '需要为您介绍一下我们的特色饮品吗？',
            '您可以告诉我您的口味偏好，我可以为您推荐合适的饮品。'
        ]
    
    def get_greeting(self) -> str:
        """获取随机问候语"""
        return random.choice(self.greetings)
    
    def get_response(self, message: str) -> str:
        """根据用户消息获取回应"""
        message = message.lower()
        
        # 问候语
        if any(word in message for word in ['你好', 'hello', '嗨', '早上好', '下午好', '晚上好']):
            return self.get_greeting()
        
        # 饮品信息
        for beverage, info in self.beverage_info.items():
            if beverage in message:
                return info
        
        # 默认回复
        return random.choice(self.default_responses) 