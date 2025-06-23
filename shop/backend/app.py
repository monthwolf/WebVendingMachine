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

app = Flask(__name__)
CORS(app)  # 允许跨域请求

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
RECOMMENDATIONS = load_json_config('recommendations.json')

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

@app.route('/api/orders', methods=['POST'])
def place_order():
    """处理订单请求"""
    data = get_request_data()
    beverage_id = data.get('beverage', '')
    condiment_quantities = data.get('condiments', [])  # [{id: string, quantity: number}]
    
    # 验证饮料是否存在
    if beverage_id not in BEVERAGES:
        return jsonify({
            'success': False,
            'error': '无效的饮料选择'
        }), 400
    
    # 计算订单金额
    beverage = BEVERAGES[beverage_id]
    subtotal = beverage['price']
    
    # 处理配料
    condiments = []
    for condiment_data in condiment_quantities:
        condiment_id = condiment_data.get('id')
        quantity = condiment_data.get('quantity', 0)
        
        if condiment_id in CONDIMENTS and quantity > 0:
            condiments.append(CondimentQuantity(
                id=condiment_id,
                quantity=quantity
            ))
            subtotal += CONDIMENTS[condiment_id]['price'] * quantity
    
    # 创建订单项
    order_item = OrderItem(
        beverage=beverage_id,
        condiments=condiments,
        subtotal=subtotal
    )
    
    # 创建订单
    now = datetime.datetime.now()
    order = OrderModel(
        id=str(uuid.uuid4()),
        items=[order_item],
        total=subtotal,
        status=OrderStatus.PENDING,
        createdAt=now,
        updatedAt=now
    )
    
    # 添加到历史记录
    order_history.append(order)
    
    # 如果历史记录太长，保留最近的20条
    if len(order_history) > 20:
        order_history.pop(0)
    
    return jsonify({
        'success': True,
        'data': {
            'order': order.to_dict()
        }
    })

@app.route('/api/orders/history', methods=['GET'])
def get_history():
    """获取订单历史"""
    return jsonify({
        'success': True,
        'data': {
            'history': [order.to_dict() for order in order_history[-5:]]  # 返回最近的5条历史
        }
    })

@app.route('/api/recommendations', methods=['GET'])
def get_recommendation():
    """获取饮料推荐"""
    # 获取个性化推荐
    recommendation = ai_recommendation.get_personalized_recommendation(order_history)
    
    # 查找完整的推荐信息
    for rec in RECOMMENDATIONS['recommendations']:
        if rec['beverage'] == recommendation['beverage']:
            return jsonify({
                'success': True,
                'data': {
                    'recommendation': rec
                }
            })
    
    return jsonify({
        'success': True,
        'data': {
            'recommendation': recommendation
        }
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """与聊天机器人对话"""
    data = get_request_data()
    message = data.get('message', '')
    
    # 获取聊天机器人回应
    response = chatbot.get_response(message) if message else chatbot.get_greeting()
    
    return jsonify({
        'success': True,
        'data': {
            'content': response
        }
    })

if __name__ == '__main__':
    app.run(debug=True) 