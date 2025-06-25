from typing import Dict, Any, Optional, Union

class ApiResponse:
    """API响应类"""
    
    @staticmethod
    def success(data: Optional[Union[Dict[str, Any], list]] = None, message: str = "success") -> Dict[str, Any]:
        """成功响应"""
        response = {
            "success": True,
            "message": message
        }
        if data is not None:
            response["data"] = data
        return response
    
    @staticmethod
    def error(message: str = "error", code: int = 400) -> Dict[str, Any]:
        """错误响应"""
        return {
            "success": False,
            "error": message,
            "code": code
        }

    @staticmethod
    def not_found(message: str = "Resource not found") -> Dict:
        """404响应"""
        return ApiResponse.error(message, 404)

    @staticmethod
    def bad_request(message: str = "Invalid request") -> Dict:
        """400响应"""
        return ApiResponse.error(message, 400)

    @staticmethod
    def unauthorized(message: str = "Unauthorized") -> Dict:
        """401响应"""
        return ApiResponse.error(message, 401)

    @staticmethod
    def forbidden(message: str = "Forbidden") -> Dict:
        """403响应"""
        return ApiResponse.error(message, 403) 