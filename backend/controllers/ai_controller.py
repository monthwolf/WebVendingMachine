from flask import request
from typing import Dict, Any
from views.response import ApiResponse
from services.ai_service import AiRecommendationService, BeverageChatbot

class AiController:
    """AI控制器"""
    
    def __init__(self):
        self.recommendation_service = AiRecommendationService()
        self.chatbot = BeverageChatbot()
    
    def get_available_models(self) -> Dict[str, Any]:
        """获取可用的AI模型列表"""
        try:
            return ApiResponse.success(data={
                "providers": self.recommendation_service.available_providers,
                "provider_models": self.recommendation_service.provider_models
            })
        except Exception as e:
            return ApiResponse.error(str(e))
    
    def get_ai_recommendation(self) -> Dict[str, Any]:
        """获取AI推荐"""
        try:
            data = request.get_json()
            if not data:
                return ApiResponse.error("无效的请求数据")
            
            preference = data.get("preference", "")
            provider = data.get("provider")
            model = data.get("model")
            template = data.get("template")
            
            result = self.recommendation_service.get_ai_recommendation(
                preference, provider, model, template
            )
            
            return ApiResponse.success(data=result)
        except Exception as e:
            return ApiResponse.error(str(e))
    
    def chat(self) -> Dict[str, Any]:
        """聊天对话"""
        try:
            data = request.get_json()
            if not data:
                return ApiResponse.error("无效的请求数据")
            
            message = data.get("message", "")
            use_ai = data.get("use_ai", False)
            provider = data.get("provider")
            model = data.get("model")
            
            if use_ai:
                result = self.chatbot.get_ai_response(message, provider, model)
            else:
                result = {"content": self.chatbot.get_response(message)}
            
            return ApiResponse.success(data=result)
        except Exception as e:
            return ApiResponse.error(str(e)) 