from flask import Flask, request
from flask_cors import CORS

# 导入控制器
from controllers.beverage_controller import BeverageController
from controllers.order_controller import OrderController
from controllers.ai_controller import AiController

app = Flask(__name__)
CORS(app)

# 初始化控制器
beverage_controller = BeverageController()
order_controller = OrderController()
ai_controller = AiController()

# 饮料相关路由
@app.route("/api/beverages", methods=["GET"])
def get_beverages():
    return beverage_controller.get_all_beverages()

@app.route("/api/condiments", methods=["GET"])
def get_condiments():
    return beverage_controller.get_all_condiments()

# 订单相关路由
@app.route("/api/orders", methods=["POST"])
def place_order():
    return order_controller.place_order()

@app.route("/api/orders/history", methods=["GET"])
def get_order_history():
    return order_controller.get_order_history()

@app.route("/api/orders/<order_id>", methods=["GET"])
def get_order(order_id: str):
    return order_controller.get_order(order_id)

@app.route("/api/orders/<order_id>/status", methods=["PUT"])
def update_order_status(order_id: str):
    data = request.get_json()
    if not data or "status" not in data:
        return {"success": False, "error": "无效的状态更新请求"}
    return order_controller.update_order_status(order_id, data["status"])

# AI相关路由
@app.route("/api/models/available", methods=["GET"])
def get_available_models():
    return ai_controller.get_available_models()

@app.route("/api/ai-recommendation", methods=["POST"])
def get_ai_recommendation():
    return ai_controller.get_ai_recommendation()

@app.route("/api/chat", methods=["POST"])
def chat():
    return ai_controller.chat()

if __name__ == "__main__":
    app.run(debug=True) 