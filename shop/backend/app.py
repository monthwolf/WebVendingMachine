from flask import Flask, request, jsonify
from flask_cors import CORS
from models import (
    BeverageModel, CondimentModel, OrderModel, OrderItem,
    CondimentQuantity, OrderStatus
)
from ai_service import AiRecommendationService, BeverageChatbot
import datetime
import uuid
import json
import os
import time

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# 初始化AI服务
ai_recommendation = AiRecommendationService()
chatbot = BeverageChatbot()

# 保存用户历史订单
order_history = []

# 加载配置文件
def load_json_config(filename):
    config_path = os.path.join(os.path.dirname(__file__), 'config', filename)
    with open(config_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# 加载配置
BEVERAGES = load_json_config('beverages.json')
CONDIMENTS = load_json_config('condiments.json')

def get_request_data():
    """安全获取请求数据"""
    if request.is_json:
        return request.json
    return {}

@app.route('/api/beverages', methods=['GET'])
def get_beverages():
    """获取所有可用饮料"""
    return jsonify({
        'success': True,
        'data': BEVERAGES
    })

@app.route('/api/condiments', methods=['GET'])
def get_condiments():
    """获取所有可用配料"""
    return jsonify({
        'success': True,
        'data': CONDIMENTS
    })

@app.route('/api/orders/history', methods=['GET'])
def get_order_history():
    """获取订单历史"""
    return jsonify({
        'success': True,
        'data': {
            'history': [order.to_dict() for order in order_history[-5:]]  # 返回最近的5条历史
        }
    })

@app.route('/api/ai-recommendation', methods=['POST'])
def get_ai_recommendation():
    """获取AI大模型推荐"""
    data = get_request_data()
    user_preference = data.get('preference', '')
    provider_name = data.get('provider')  # 可选参数，指定使用的模型提供商
    model_name = data.get('model')  # 可选参数，指定使用的具体模型
    template = data.get('template')  # 可选参数，前端传入的代码模板
    
    result = ai_recommendation.get_ai_recommendation(user_preference, provider_name, model_name, template)
    if result is None:
        result = {
            "recommendation": ai_recommendation.get_recommendation(),
            "code": None,
            "model_info": {"error": "获取推荐失败"}
        }
    
    return jsonify({
        'success': True,
        'data': result
    })

@app.route('/api/models/available', methods=['GET'])
def get_available_models():
    """获取可用的AI模型列表"""
    return jsonify({
        'success': True,
        'data': {
            'providers': ai_recommendation.available_providers,
            'provider_models': ai_recommendation.provider_models
        }
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """与聊天机器人对话"""
    data = get_request_data()
    message = data.get('message', '')
    use_ai = data.get('use_ai', False)  # 是否使用大模型
    provider_name = data.get('provider')  # 可选参数，指定使用的模型提供商
    model_name = data.get('model')  # 可选参数，指定使用的具体模型
    
    if not message:
        response = chatbot.get_greeting()
        return jsonify({
            'success': True,
            'data': {
                'content': response,
                'model_info': None
            }
        })
    
    if use_ai and ai_recommendation.available_providers:
        result = chatbot.get_ai_response(message, provider_name, model_name)
        if result is None:
            result = {
                "content": chatbot.get_response(message),
                "model_info": {"error": "AI回复生成失败"}
            }
        
        return jsonify({
            'success': True,
            'data': result
        })
    else:
        # 使用传统聊天机器人
        response = chatbot.get_response(message)
        return jsonify({
            'success': True,
            'data': {
                'content': response,
                'model_info': None
            }
        })

def calculate_order_total(beverage_id, selected_condiments):
    """根据饮料和配料计算总价"""
    if not beverage_id or beverage_id not in BEVERAGES:
        return 0
    
    total = BEVERAGES[beverage_id]['price']
    
    for condiment_data in selected_condiments or []:
        condiment_id = condiment_data.get('id')
        quantity = condiment_data.get('quantity', 1)
        if condiment_id in CONDIMENTS:
            total += CONDIMENTS[condiment_id]['price'] * quantity
    return total

@app.route('/api/orders', methods=['POST'])
def place_order():
    """处理订单请求"""
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': '无效的请求数据'}), 400

    beverage_id = data.get('beverage')
    selected_condiments = data.get('condiments', [])
    
    if not beverage_id or beverage_id not in BEVERAGES:
        return jsonify({
            'success': False,
            'error': '无效的饮料选择'
        }), 400
    
    order_items = [
        OrderItem(
            id=beverage_id,
            type='beverage',
            quantity=1,
            price=BEVERAGES[beverage_id]['price']
        )
    ]

    for condiment_data in selected_condiments:
        condiment_id = condiment_data.get('id')
        quantity = condiment_data.get('quantity', 1)
        if not condiment_id or condiment_id not in CONDIMENTS:
            return jsonify({
                'success': False,
                'error': f"无效的配料: {condiment_id}"
            }), 400
        
        order_items.append(
            OrderItem(
                id=condiment_id,
                type='condiment',
                quantity=quantity,
                price=CONDIMENTS[condiment_id]['price']
            )
        )

    total_price = calculate_order_total(beverage_id, selected_condiments)

    # 创建订单
    now = datetime.datetime.now()
    new_order = OrderModel(
        id=str(uuid.uuid4()),
        items=order_items,
        total=total_price,
        status=OrderStatus.PROCESSING,
        createdAt=now,
        updatedAt=now,
    )
    
    # 添加到历史记录
    order_history.insert(0, new_order)
    
    # 如果历史记录太长，保留最近的20条
    if len(order_history) > 20:
        order_history.pop()
    
    return jsonify({
        'success': True,
        'data': {
            'order': new_order.to_dict()
        }
    }), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000) 