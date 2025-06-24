#!/usr/bin/env python
# -*- coding: utf-8 -*-

import random
import os
import json
import requests
import re
from typing import Dict, List, Optional, Any, Tuple
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

from constants import AUTO_SELECT_TEMPLATE

class ModelProvider:
    """大模型提供者基类"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get(f"{self.__class__.__name__.upper()}_API_KEY")
        self.is_available = bool(self.api_key)
        self.models = []
        
    def get_response(self, prompt: str, model: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """获取模型响应"""
        raise NotImplementedError("子类必须实现此方法")
    
    def generate_code(self, prompt: str, model: Optional[str] = None) -> str:
        """生成JavaScript代码"""
        raise NotImplementedError("子类必须实现此方法")
    
    def get_available_models(self) -> List[str]:
        """获取可用的模型列表"""
        return self.models


class GPTProvider(ModelProvider):
    """OpenAI GPT API提供者"""
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__(api_key)
        # 从环境变量加载模型列表
        models_str = os.environ.get("GPT_MODELS", '["gpt-3.5-turbo"]')
        try:
            self.models = json.loads(models_str)
        except json.JSONDecodeError:
            self.models = ["gpt-3.5-turbo"]
        
        self.base_url = "https://api.openai.com/v1/chat/completions"
        
    def get_response(self, prompt: str, model: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """获取GPT响应"""
        if not self.is_available:
            return {"error": "API密钥未配置"}
        
        # 使用指定模型或默认使用第一个模型
        use_model = model if model and model in self.models else self.models[0]
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        payload = {
            "model": use_model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": kwargs.get("temperature", 0.7),
            "max_tokens": kwargs.get("max_tokens", 500)
        }
        
        try:
            response = requests.post(self.base_url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            
            return {
                "content": result["choices"][0]["message"]["content"],
                "model": use_model,
                "provider": "OpenAI"
            }
        except Exception as e:
            return {"error": f"GPT API错误: {str(e)}"}
    
    def generate_code(self, prompt: str, model: Optional[str] = None) -> str:
        """生成JavaScript代码，使用AUTO_SELECT_TEMPLATE模板"""
        # 解析提示词中的饮料和配料信息
        beverage_id = None
        condiments = []
        
        # 尝试从提示中提取饮料ID
        beverage_match = re.search(r'选择["\']?([a-zA-Z0-9_-]+)["\']?饮料', prompt)
        if beverage_match:
            beverage_id = beverage_match.group(1)
        
        # 尝试从提示中提取配料信息
        condiment_matches = re.findall(r'([a-zA-Z0-9_-]+)(?:\s*[,，和与]\s*|配料|\s+)(?:(\d+)个?份?)?', prompt)
        for match in condiment_matches:
            condiment_id = match[0]
            # 排除可能是饮料ID的匹配
            if condiment_id != beverage_id and len(condiment_id) > 1:
                quantity = int(match[1]) if match[1].isdigit() else 1
                condiments.append({"id": condiment_id, "quantity": quantity})
        
        # 如果没有找到饮料ID，尝试使用AI生成一个
        if not beverage_id or not any(c.isalpha() for c in beverage_id):
            code_prompt = f"""分析以下用户需求，提取出要选择的饮料ID和配料ID列表。
饮料可选ID: coffee, latte, mocha, americano, blackTea, cola, sprite, orangeJuice, appleJuice
配料可选ID: milk, cream, sugar, honey, ice, vanilla, caramel, chocolate, cinnamon, soymilk, coconut

用户需求: {prompt}

仅返回JSON格式:
{{
  "beverage": "饮料ID",
  "condiments": [
    {{"id": "配料ID", "quantity": 数量}},
    ...
  ]
}}
"""
            response = self.get_response(code_prompt, model, temperature=0.3)
            if "error" not in response:
                try:
                    # 尝试解析JSON响应
                    content = response.get("content", "{}")
                    # 查找JSON内容
                    json_match = re.search(r'({[\s\S]*})', content)
                    if json_match:
                        content = json_match.group(1)
                    
                    result = json.loads(content)
                    beverage_id = result.get("beverage")
                    condiment_list = result.get("condiments", [])
                    
                    # 清空之前的配料列表，使用AI生成的配料列表
                    condiments = []
                    for condiment_item in condiment_list:
                        if isinstance(condiment_item, dict):
                            condiment_id = condiment_item.get('id', '')
                            quantity = condiment_item.get('quantity', 1)
                            condiments.append({"id": condiment_id, "quantity": quantity})
                        elif isinstance(condiment_item, str):
                            # 处理旧格式的配料列表，兼容性处理
                            condiments.append({"id": condiment_item, "quantity": 1})
                except Exception:
                    # 解析失败时使用默认值
                    beverage_id = "coffee"
                    condiments = [{"id": "milk", "quantity": 1}]
        
        # 如果仍然没有找到饮料ID，使用默认值
        if not beverage_id:
            beverage_id = "coffee"
        
        # 使用模板生成代码
        code = AUTO_SELECT_TEMPLATE
        
        # 替换饮料ID
        code = code.replace("{{BEVERAGE_ID}}", beverage_id)
        
        # 处理配料部分
        if not condiments:
            # 如果没有配料，清空配料数组
            code = re.sub(r'const targetCondiments = \[.*?\n  \/\/ 可以添加更多配料...\n\];', 
                          'const targetCondiments = [];', 
                          code, 
                          flags=re.DOTALL)
        else:
            # 替换第一个配料
            first_condiment = condiments[0]
            code = code.replace("{{CONDIMENT_ID}}", first_condiment["id"])
            code = code.replace("{{QUANTITY}}", str(first_condiment["quantity"]))
            
            # 如果有多个配料，添加额外的配料
            if len(condiments) > 1:
                additional_condiments = ""
                for i in range(1, len(condiments)):
                    additional_condiments += f'  {{ id: "{condiments[i]["id"]}", quantity: {condiments[i]["quantity"]} }},\n'
                
                code = code.replace("  // 可以添加更多配料...", additional_condiments + "  // 可以添加更多配料...")
        
        return code


class DeepseekProvider(ModelProvider):
    """Deepseek API提供者"""
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__(api_key)
        # 从环境变量加载模型列表
        models_str = os.environ.get("DEEPSEEK_MODELS", '["deepseek-chat"]')
        try:
            self.models = json.loads(models_str)
        except json.JSONDecodeError:
            self.models = ["deepseek-chat"]
            
        self.base_url = "https://api.deepseek.com/v1/chat/completions"  # 示例URL，可能需要调整
        
    def get_response(self, prompt: str, model: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """获取Deepseek响应"""
        if not self.is_available:
            return {"error": "API密钥未配置"}
        
        # 使用指定模型或默认使用第一个模型
        use_model = model if model and model in self.models else self.models[0]
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        payload = {
            "model": use_model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": kwargs.get("temperature", 0.7),
            "max_tokens": kwargs.get("max_tokens", 500)
        }
        
        try:
            response = requests.post(self.base_url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            
            # 根据实际API调整返回结构
            return {
                "content": result["choices"][0]["message"]["content"],
                "model": use_model,
                "provider": "Deepseek"
            }
        except Exception as e:
            return {"error": f"Deepseek API错误: {str(e)}"}
    
    def generate_code(self, prompt: str, model: Optional[str] = None) -> str:
        """生成JavaScript代码，使用AUTO_SELECT_TEMPLATE模板"""
        # 复用GPTProvider的代码生成逻辑
        gpt_provider = GPTProvider(self.api_key)
        return gpt_provider.generate_code(prompt, model)


class AiRecommendationService:
    """饮料推荐AI服务"""
    
    def __init__(self):
        # 初始化默认推荐数据
        self.default_recommendations = [
            {
                'beverage': 'coffee',
                'beverageName': '经典咖啡',
                'condiments': [
                    {'id': 'milk', 'name': '牛奶', 'quantity': 1},
                    {'id': 'sugar', 'name': '糖', 'quantity': 1}
                ],
                'reason': '经典搭配，香浓可口'
            },
            {
                'beverage': 'latte',
                'beverageName': '拿铁咖啡',
                'condiments': [
                    {'id': 'vanilla', 'name': '香草', 'quantity': 1},
                    {'id': 'cream', 'name': '奶油', 'quantity': 1}
                ],
                'reason': '香草风味，甜蜜享受'
            },
            {
                'beverage': 'mocha',
                'beverageName': '摩卡咖啡',
                'condiments': [
                    {'id': 'cream', 'name': '奶油', 'quantity': 1},
                    {'id': 'chocolate', 'name': '巧克力', 'quantity': 2}
                ],
                'reason': '巧克力控的最爱'
            },
            {
                'beverage': 'americano',
                'beverageName': '美式咖啡',
                'condiments': [
                    {'id': 'ice', 'name': '冰块', 'quantity': 1},
                    {'id': 'caramel', 'name': '焦糖', 'quantity': 1}
                ],
                'reason': '清爽解暑，焦糖点缀'
            }
        ]
        
        # 初始化大模型提供者
        self.model_providers = {
            'gpt': GPTProvider(),
            'deepseek': DeepseekProvider()
        }
        
        # 默认使用的大模型
        self.default_provider = 'gpt'
        self.available_providers = self._get_available_providers()
        self.provider_models = self._get_provider_models()
    
    def _get_available_providers(self) -> List[str]:
        """获取可用的模型提供商"""
        return [name for name, provider in self.model_providers.items() if provider.is_available]
    
    def _get_provider_models(self) -> Dict[str, List[str]]:
        """获取每个提供商可用的模型列表"""
        result = {}
        for name, provider in self.model_providers.items():
            if provider.is_available:
                result[name] = provider.get_available_models()
        return result
    
    def get_recommendation(self):
        """获取随机推荐"""
        return random.choice(self.default_recommendations)
    
    def get_ai_recommendation(self, user_preference: str, provider_name: Optional[str] = None, model_name: Optional[str] = None, template: Optional[str] = None):
        """使用大模型生成推荐"""
        # 如果未指定或指定的提供商不可用，则使用默认提供商
        if not provider_name or provider_name not in self.available_providers:
            provider_name = next(iter(self.available_providers)) if self.available_providers else None
        
        # 如果没有可用提供商，返回默认推荐
        if not provider_name:
            default_rec = self.get_recommendation()
            return {
                "recommendation": default_rec, 
                "code": None, 
                "model_info": {"error": "没有可用的AI模型提供商"}
            }
        
        provider = self.model_providers[provider_name]
        
        # 检查模型是否可用
        if model_name and model_name not in provider.get_available_models():
            model_name = None
        
        # 生成推荐提示
        prompt = f"""根据用户喜好，推荐一款饮料和配料组合。
可用的饮料: coffee(经典咖啡), latte(拿铁咖啡), mocha(摩卡咖啡), americano(美式咖啡), blackTea(红茶), cola(可乐), sprite(雪碧), orangeJuice(鲜榨橙汁), appleJuice(苹果汁)
可用的配料: milk(牛奶), cream(奶油), sugar(糖), honey(蜂蜜), ice(冰块), vanilla(香草), caramel(焦糖), chocolate(巧克力), cinnamon(肉桂), soymilk(豆浆), coconut(椰子)

注意：可以推荐多种配料，并且可以为每种配料指定份数。请在返回的JSON中为每个配料指定数量。

请以JSON格式返回推荐:
{{
  "beverage": "饮料ID",
  "beverageName": "饮料中文名称",
  "condiments": [
    {{"id": "配料1ID", "name": "配料1中文名称", "quantity": 1}},
    {{"id": "配料2ID", "name": "配料2中文名称", "quantity": 2}}
  ],
  "reason": "推荐原因",
  "explanation": "详细解释"
}}

用户喜好: {user_preference}
"""
        
        response = provider.get_response(prompt, model_name)
        code = None
        
        if "error" not in response:
            # 尝试解析JSON响应
            try:
                content = response.get("content", "{}")
                # 查找JSON内容
                json_match = re.search(r'({[\s\S]*})', content)
                if json_match:
                    content = json_match.group(1)
                
                recommendation = json.loads(content)
                
                # 生成自动选择的JavaScript代码
                beverage_id = recommendation.get('beverage', '')
                condiments_list = recommendation.get('condiments', [])
                
                # 准备配料数据
                condiments = []
                for condiment_item in condiments_list:
                    condiment_id = condiment_item.get('id', '')
                    quantity = condiment_item.get('quantity', 1)
                    condiments.append({"id": condiment_id, "quantity": quantity})
                
                # 使用模板生成代码（优先使用传入的模板）
                code_template = template or AUTO_SELECT_TEMPLATE
                
                # 替换饮料ID
                code = code_template.replace("{{BEVERAGE_ID}}", beverage_id)
                
                # 处理配料部分
                if not condiments:
                    # 如果没有配料，清空配料数组
                    code = re.sub(r'const targetCondiments = \[.*?\n  \/\/ 可以添加更多配料...\n\];', 
                                'const targetCondiments = [];', 
                                code, 
                                flags=re.DOTALL)
                else:
                    # 替换第一个配料
                    first_condiment = condiments[0]
                    code = code.replace("{{CONDIMENT_ID}}", first_condiment["id"])
                    code = code.replace("{{QUANTITY}}", str(first_condiment["quantity"]))
                    
                    # 如果有多个配料，添加额外的配料
                    if len(condiments) > 1:
                        additional_condiments = ""
                        for i in range(1, len(condiments)):
                            additional_condiments += f'  {{ id: "{condiments[i]["id"]}", quantity: {condiments[i]["quantity"]} }},\n'
                        
                        code = code.replace("  // 可以添加更多配料...", additional_condiments + "  // 可以添加更多配料...")
                
                return {
                    "recommendation": recommendation,
                    "code": code,
                    "model_info": {
                        "provider": response.get("provider"),
                        "model": response.get("model")
                    }
                }
            except Exception as e:
                return {
                    "recommendation": self.get_recommendation(), 
                    "code": None,
                    "model_info": {
                        "error": f"解析推荐失败: {str(e)}",
                        "provider": response.get("provider"),
                        "model": response.get("model")
                    }
                }
        else:
            return {
                "recommendation": self.get_recommendation(),
                "code": None,
                "model_info": {"error": response.get("error")}
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
        
        # 初始化大模型提供者
        self.model_providers = {
            'gpt': GPTProvider(),
            'deepseek': DeepseekProvider()
        }
        self.available_providers = [name for name, provider in self.model_providers.items() if provider.is_available]
        self.provider_models = {}
        for name, provider in self.model_providers.items():
            if provider.is_available:
                self.provider_models[name] = provider.get_available_models()
    
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
    
    def get_ai_response(self, message: str, provider_name: Optional[str] = None, model_name: Optional[str] = None):
        """使用大模型回答用户消息"""
        # 选择模型提供者
        if not provider_name or provider_name not in self.available_providers:
            provider_name = next(iter(self.available_providers)) if self.available_providers else None
        
        # 如果没有可用模型，使用默认回答
        if not provider_name:
            return {"content": self.get_response(message), "model_info": None}
        
        provider = self.model_providers[provider_name]
        
        # 检查模型是否可用
        if model_name and model_name not in provider.get_available_models():
            model_name = None
        
        # 生成提示
        prompt = f"""你是一个饮料售货机的AI助手。请用简短、友好的方式回答用户关于饮料的问题。
可用的饮料: coffee(咖啡), latte(拿铁), mocha(摩卡), americano(美式), blackTea(红茶), greenTea(绿茶), cola(可乐), sprite(雪碧), orangeJuice(橙汁), appleJuice(苹果汁)
可用的配料: milk(牛奶), cream(奶油), sugar(糖), honey(蜂蜜), ice(冰块), vanilla(香草), caramel(焦糖), chocolate(巧克力), cinnamon(肉桂), soymilk(豆浆), coconut(椰子)

如果用户询问饮料推荐，请推荐一款饮料和适合的配料。
如果用户提问与饮料无关的问题，请礼貌地将话题引回到饮料上。
回答可以使用Markdown格式来增强可读性。

用户消息: {message}
"""
        
        response = provider.get_response(prompt, model_name, temperature=0.7, max_tokens=300)
        if "error" in response:
            return {"content": self.get_response(message), "model_info": {"error": response.get("error")}}
        
        return {
            "content": response.get("content", ""),
            "model_info": {
                "provider": response.get("provider"),
                "model": response.get("model")
            }
        }