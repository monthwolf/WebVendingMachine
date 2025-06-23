from flask import Flask, request, jsonify
from flask_cors import CORS
from models import (
    BeverageModel, CondimentModel, OrderModel, OrderItem,
    CondimentQuantity, OrderStatus
)
from ai_service import AiRecommendationService, BeverageChatbot
import datetime
import uuid

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 初始化AI服务
ai_recommendation = AiRecommendationService()
chatbot = BeverageChatbot()

# 保存用户历史订单
order_history = []

# 预定义的饮料数据
BEVERAGES = {
    'coffee': BeverageModel(
        id='coffee',
        category='coffee',
        name='经典咖啡',
        price=18.0,
        description='使用优质阿拉比卡咖啡豆现磨制作',
        calories=5,
        hot=True,
        image='/images/beverages/coffee.png'
    ),
    'latte': BeverageModel(
        id='latte',
        category='coffee',
        name='拿铁咖啡',
        price=22.0,
        description='浓缩咖啡与蒸煮牛奶的完美结合',
        calories=120,
        hot=True,
        image='/images/beverages/latte.png'
    ),
    'americano': BeverageModel(
        id='americano',
        category='coffee',
        name='美式咖啡',
        price=20.0,
        description='清淡醇厚的黑咖啡',
        calories=10,
        hot=True,
        image='/images/beverages/americano.png'
    ),
    'mocha': BeverageModel(
        id='mocha',
        category='coffee',
        name='摩卡咖啡',
        price=25.0,
        description='咖啡与巧克力的甜蜜邂逅',
        calories=200,
        hot=True,
        image='/images/beverages/mocha.png'
    ),
    'cola': BeverageModel(
        id='cola',
        category='soda',
        name='可乐',
        price=12.0,
        description='经典汽水饮料',
        calories=140,
        hot=False,
        image='/images/beverages/cola.png'
    ),
    'sprite': BeverageModel(
        id='sprite',
        category='soda',
        name='雪碧',
        price=12.0,
        description='清爽柠檬味汽水',
        calories=140,
        hot=False,
        image='/images/beverages/sprite.png'
    ),
    'greenTea': BeverageModel(
        id='greenTea',
        category='tea',
        name='绿茶',
        price=15.0,
        description='清香淡雅的日式绿茶',
        calories=0,
        hot=True,
        image='/images/beverages/green-tea.png'
    ),
    'blackTea': BeverageModel(
        id='blackTea',
        category='tea',
        name='红茶',
        price=15.0,
        description='浓郁芳香的锡兰红茶',
        calories=0,
        hot=True,
        image='/images/beverages/black-tea.png'
    ),
    'orangeJuice': BeverageModel(
        id='orangeJuice',
        category='juice',
        name='鲜榨橙汁',
        price=20.0,
        description='100%纯鲜榨橙汁',
        calories=120,
        hot=False,
        image='/images/beverages/orange-juice.png'
    ),
    'appleJuice': BeverageModel(
        id='appleJuice',
        category='juice',
        name='苹果汁',
        price=18.0,
        description='清甜可口的苹果汁',
        calories=110,
        hot=False,
        image='/images/beverages/apple-juice.png'
    )
}

# 预定义的配料数据
CONDIMENTS = {
    'milk': CondimentModel(
        id='milk',
        category='dairy',
        name='牛奶',
        price=3.0,
        description='新鲜牛奶',
        calories=60,
        image='/images/condiments/milk.png'
    ),
    'cream': CondimentModel(
        id='cream',
        category='dairy',
        name='奶油',
        price=4.0,
        description='香浓奶油',
        calories=120,
        image='/images/condiments/cream.png'
    ),
    'sugar': CondimentModel(
        id='sugar',
        category='sweetener',
        name='糖',
        price=1.0,
        description='白砂糖',
        calories=30,
        image='/images/condiments/sugar.png'
    ),
    'honey': CondimentModel(
        id='honey',
        category='sweetener',
        name='蜂蜜',
        price=3.0,
        description='天然蜂蜜',
        calories=45,
        image='/images/condiments/honey.png'
    ),
    'vanilla': CondimentModel(
        id='vanilla',
        category='syrup',
        name='香草糖浆',
        price=4.0,
        description='香草风味糖浆',
        calories=50,
        image='/images/condiments/vanilla.png'
    ),
    'caramel': CondimentModel(
        id='caramel',
        category='syrup',
        name='焦糖糖浆',
        price=4.0,
        description='焦糖风味糖浆',
        calories=60,
        image='/images/condiments/caramel.png'
    ),
    'chocolate': CondimentModel(
        id='chocolate',
        category='syrup',
        name='巧克力酱',
        price=4.0,
        description='浓郁巧克力酱',
        calories=80,
        image='/images/condiments/chocolate.png'
    ),
    'cinnamon': CondimentModel(
        id='cinnamon',
        category='topping',
        name='肉桂粉',
        price=2.0,
        description='增添温暖香料风味',
        calories=5,
        image='/images/condiments/cinnamon.png'
    ),
    'coconut': CondimentModel(
        id='coconut',
        category='dairy',
        name='椰奶',
        price=4.0,
        description='香浓椰子奶',
        calories=70,
        image='/images/condiments/coconut.png'
    ),
    'ice': CondimentModel(
        id='ice',
        category='other',
        name='冰块',
        price=0.0,
        description='清凉冰块',
        calories=0,
        image='/images/condiments/ice.png'
    )
}

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
    subtotal = beverage.price
    
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
            subtotal += CONDIMENTS[condiment_id].price * quantity
    
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
    
    return jsonify({
        'success': True,
        'data': {
            'recommendation': {
                'beverage': recommendation['beverage'],
                'condiments': recommendation['condiments'],
                'reason': recommendation['reason']
            }
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