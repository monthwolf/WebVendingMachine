import os
import json
from typing import Dict, Any

def load_json_config(filename: str) -> Dict[str, Any]:
    """加载JSON配置文件"""
    config_path = os.path.join(os.path.dirname(__file__), '..', 'config', filename)
    with open(config_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def safe_get_request_data(request) -> Dict[str, Any]:
    """安全获取请求数据"""
    if request.is_json:
        return request.json
    return {} 