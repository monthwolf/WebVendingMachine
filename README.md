# 智能饮料售货机系统

一个基于装饰器模式的智能饮料系统，支持饮料和配料的自由搭配，并提供多模型AI推荐和智能对话功能。

## 项目概述

智能饮料售货机是一个全栈应用，前端使用React和TypeScript构建交互式界面，后端采用Flask提供RESTful API服务。系统核心采用装饰器设计模式实现饮料和配料的灵活组合，并集成了多种AI大模型提供智能推荐和对话功能。

## 项目结构

```
shop/
├── backend/                # 后端Flask应用
│   ├── app.py              # 应用入口和路由定义
│   ├── config/             # 配置文件目录
│   │   ├── beverages.json  # 饮料数据
│   │   ├── condiments.json # 配料数据
│   │   └── recommendations.json # 推荐数据
│   ├── constants.py        # 常量定义
│   ├── controllers/        # 控制器层
│   │   ├── ai_controller.py      # AI功能控制器
│   │   ├── beverage_controller.py # 饮料控制器
│   │   └── order_controller.py   # 订单控制器
│   ├── models/             # 数据模型层
│   │   ├── base.py         # 基础模型类
│   │   ├── beverage.py     # 饮料和配料模型
│   │   └── order.py        # 订单模型
│   ├── services/           # 服务层
│   │   ├── ai_service.py   # AI服务
│   │   └── order_service.py # 订单服务
│   ├── utils/              # 工具函数
│   │   └── helpers.py      # 辅助函数
│   └── views/              # 视图层
│       └── response.py     # API响应格式化
│
├── frontend/               # 前端React应用
│   ├── public/             # 静态资源
│   │   ├── images/         # 图片资源
│   │   │   ├── beverages/  # 饮料图片
│   │   │   └── condiments/ # 配料图片
│   │   └── index.html      # HTML入口
│   └── src/                # 源代码
│       ├── components/     # React组件
│       │   ├── 3D/         # 3D相关组件
│       │   │   └── Bottle3D.tsx   # 3D瓶子模型组件
│       │   ├── BeverageCard.tsx   # 饮料卡片组件
│       │   ├── BeverageImage.tsx  # 饮料图片组件
│       │   ├── ChatBot.tsx        # 聊天机器人组件
│       │   ├── CondimentCard.tsx  # 配料卡片组件
│       │   ├── ControlPanel.tsx   # 控制面板组件
│       │   ├── OrderHistory.tsx   # 订单历史组件
│       │   ├── OrderSummary.tsx   # 订单摘要组件
│       │   ├── SendIcon.tsx       # 发送图标组件
│       │   └── VendingMachineContainer.tsx # 售货机容器组件
│       ├── services/       # 前端服务
│       │   └── api.ts      # API调用
│       └── types/          # TypeScript类型定义
└── README.md               # 项目说明文档
```

## 核心功能模块

### 1. 饮料和配料系统 (装饰器模式)

系统核心采用**装饰器设计模式**（Decorator Pattern）实现饮料和配料的动态组合。装饰器模式允许在不修改原始对象结构的情况下，通过包装对象来动态地添加新的行为和特性。

#### 类结构设计
- **抽象组件 (Component)**: `Beverage` 抽象基类
  - 定义了所有饮料必须实现的接口，包括 `get_description()`, `get_cost()`, `get_calories()` 等基本方法
  - 提供饮料的基本属性如名称、描述、价格、卡路里等

- **具体组件 (Concrete Components)**:
  - `Coffee`: 咖啡类饮料，如美式咖啡、拿铁等
  - `Tea`: 茶类饮料，如绿茶、红茶等
  - `Juice`: 果汁类饮料，如橙汁、苹果汁等
  - `Soda`: 碳酸饮料，如可乐、雪碧等
  
- **抽象装饰器 (Decorator)**: `BeverageDecorator` 类
  - 继承自 `Beverage` 基类，同时包含对另一个 `Beverage` 对象的引用
  - 通过组合方式扩展基础饮料的功能，而不是通过继承
  - 实现了转发所有方法调用到被包装对象，并在必要时添加额外行为

- **具体装饰器 (Concrete Decorators)**:
  - `Milk`, `Sugar`, `Ice`, `Honey`, `Caramel`, `Vanilla` 等配料装饰器
  - 每个装饰器负责添加特定配料，并相应地调整价格和卡路里

#### 装饰器模式优势
1. **开闭原则**: 系统对扩展开放（可以添加新的饮料或配料），对修改关闭（不需要修改现有代码）
2. **单一职责**: 每个类只负责一个功能，如 `Milk` 只负责添加牛奶相关的价格和属性
3. **组合灵活**: 可以任意组合饮料和配料，甚至可以添加多份相同配料
4. **运行时配置**: 可以在运行时动态决定添加哪些配料，而不是在编译时

#### 代码示例
```python
# 基础饮料抽象类
class Beverage:
    def __init__(self, id, name, price, calories=0):
        self.id = id
        self.name = name
        self.price = price
        self.calories = calories
        
    def get_description(self):
        return self.name
        
    def get_cost(self):
        return self.price
        
    def get_calories(self):
        return self.calories
        
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "calories": self.calories,
            "description": self.get_description()
        }

# 具体饮料类
class Coffee(Beverage):
    def __init__(self, id, name, price, calories=120):
        super().__init__(id, name, price, calories)
        self.category = "coffee"

# 装饰器基类
class BeverageDecorator(Beverage):
    def __init__(self, beverage, condiment, quantity=1):
        self.beverage = beverage
        self.condiment = condiment
        self.quantity = quantity
        self.id = beverage.id
        self.name = beverage.name
        
    def get_description(self):
        return f"{self.beverage.get_description()} + {self.quantity}份{self.condiment.name}"
        
    def get_cost(self):
        return self.beverage.get_cost() + (self.condiment.price * self.quantity)
        
    def get_calories(self):
        return self.beverage.get_calories() + (self.condiment.calories * self.quantity)
        
    def to_dict(self):
        base_dict = self.beverage.to_dict()
        if not "condiments" in base_dict:
            base_dict["condiments"] = []
            
        base_dict["condiments"].append({
            "id": self.condiment.id,
            "name": self.condiment.name,
            "quantity": self.quantity
        })
        
        base_dict["price"] = self.get_cost()
        base_dict["calories"] = self.get_calories()
        base_dict["description"] = self.get_description()
        
        return base_dict
```

#### 使用场景
1. **点单流程**: 用户选择基础饮料后，可以添加多种配料，系统动态计算最终价格和卡路里
2. **自定义饮品**: 支持用户根据个人喜好自由组合饮料和配料
3. **特殊饮品推荐**: AI可以根据用户偏好推荐特定的饮料和配料组合

### 2. 订单管理系统 (工厂模式 + 观察者模式)

订单系统采用**工厂模式**创建订单对象，并使用**观察者模式**处理订单状态变更通知。

#### 订单模型设计
- **Order 类**: 订单核心模型
  - 包含订单ID、创建时间、状态、饮料列表、总价等属性
  - 支持添加/移除饮料项
  - 提供状态转换方法和总价计算

- **OrderFactory**: 负责创建和初始化订单对象
  - 生成唯一订单ID
  - 设置初始订单状态
  - 注册相关观察者

- **OrderObserver**: 订单状态变化的观察者接口
  - 当订单状态发生变化时接收通知
  - 可以执行相应的业务逻辑，如发送通知、更新库存等

#### 订单状态流转
系统支持多种订单状态，并定义了严格的状态转换规则：
1. **PENDING** (待处理): 订单初始状态
2. **PROCESSING** (处理中): 订单已确认，正在制作
3. **COMPLETED** (已完成): 订单已完成，饮料已制作完成
4. **CANCELLED** (已取消): 订单已取消

#### 代码示例
```python
# 订单模型
class Order:
    def __init__(self, order_id=None):
        self.id = order_id or str(uuid.uuid4())
        self.created_at = datetime.now().isoformat()
        self.status = "PENDING"
        self.items = []
        self.observers = []
        
    def add_item(self, beverage):
        self.items.append(beverage)
        
    def set_status(self, new_status):
        if new_status in ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"]:
            old_status = self.status
            self.status = new_status
            self._notify_observers(old_status, new_status)
    
    def _notify_observers(self, old_status, new_status):
        for observer in self.observers:
            observer.on_status_changed(self, old_status, new_status)
            
    def register_observer(self, observer):
        self.observers.append(observer)
        
    def calculate_total(self):
        return sum(item.get_cost() for item in self.items)
        
    def to_dict(self):
        return {
            "id": self.id,
            "createdAt": self.created_at,
            "status": self.status,
            "items": [item.to_dict() for item in self.items],
            "total": self.calculate_total()
        }

# 订单工厂
class OrderFactory:
    @staticmethod
    def create_order():
        order = Order()
        # 注册观察者
        order.register_observer(OrderNotificationObserver())
        order.register_observer(OrderAnalyticsObserver())
        return order
        
# 订单观察者示例
class OrderNotificationObserver:
    def on_status_changed(self, order, old_status, new_status):
        if new_status == "COMPLETED":
            # 发送订单完成通知
            print(f"订单 {order.id} 已完成，准备通知用户")
```

### 3. AI推荐和对话系统 (策略模式 + 适配器模式)

AI系统采用**策略模式**实现不同AI模型的无缝切换，并使用**适配器模式**统一不同AI提供商的接口。

#### 模型提供者设计
- **ModelProvider 接口**: 定义AI模型提供者的统一接口
  - `get_available_models()`: 获取可用模型列表
  - `generate_recommendation()`: 生成饮品推荐
  - `generate_chat_response()`: 生成聊天回复
  - `generate_code()`: 生成可执行代码

- **具体提供者实现**:
  - `GPTProvider`: OpenAI GPT模型适配器
  - `DeepseekProvider`: Deepseek模型适配器
  - 每个提供者负责将统一接口转换为特定AI服务的API调用

#### AI服务功能
1. **智能推荐系统**
   - 基于用户描述的需求和偏好推荐饮品
   - 考虑季节、天气、时间等上下文因素
   - 生成详细的推荐理由和说明

2. **智能对话功能**
   - 支持自然语言交互
   - 回答关于饮品的问题
   - 提供个性化建议

3. **代码生成系统**
   - 自动生成可执行的JavaScript代码
   - 支持一键选择推荐的饮品和配料
   - 代码包含详细注释和错误处理

#### 策略模式实现
系统可以在运行时动态切换不同的AI模型提供者，而不影响业务逻辑：

```python
class AIService:
    def __init__(self):
        self.providers = {
            "gpt": GPTProvider(),
            "deepseek": DeepseekProvider()
        }
        self.current_provider = self.providers["gpt"]  # 默认使用GPT
        
    def set_provider(self, provider_name):
        if provider_name in self.providers:
            self.current_provider = self.providers[provider_name]
            return True
        return False
        
    def get_available_models(self):
        return self.current_provider.get_available_models()
        
    def generate_recommendation(self, user_input, selected_model):
        return self.current_provider.generate_recommendation(user_input, selected_model)
        
    def generate_chat_response(self, messages, selected_model):
        return self.current_provider.generate_chat_response(messages, selected_model)
        
    def generate_code(self, recommendation):
        return self.current_provider.generate_code(recommendation)
```

#### 适配器模式示例
为不同AI服务提供统一接口：

```python
class GPTProvider:
    def __init__(self):
        self.api_key = os.getenv("GPTPROVIDER_API_KEY")
        self.available_models = json.loads(os.getenv("GPT_MODELS", '["gpt-3.5-turbo"]'))
        
    def get_available_models(self):
        return self.available_models
        
    def generate_recommendation(self, user_input, selected_model):
        # 调用OpenAI API获取推荐
        response = self._call_openai_api(
            model=selected_model,
            messages=[
                {"role": "system", "content": "你是一个饮品推荐专家..."},
                {"role": "user", "content": user_input}
            ]
        )
        
        # 解析响应并格式化为统一格式
        return {
            "recommendation": self._extract_recommendation(response),
            "code": self._generate_selection_code(response),
            "model_info": {
                "name": selected_model,
                "provider": "OpenAI"
            }
        }
        
    # 其他方法实现...
```

### 4. MVC架构设计

系统采用经典的MVC (Model-View-Controller) 架构模式，实现了关注点分离和代码组织优化：

#### Model层 (模型层)
- **数据模型**: `Beverage`, `Order` 等核心业务实体
- **数据访问**: 从JSON配置文件加载饮料和配料数据
- **业务逻辑**: 价格计算、订单处理等核心功能

#### View层 (视图层)
- **响应格式化**: `ApiResponse` 类统一处理API响应格式
- **数据序列化**: 将模型对象转换为JSON格式
- **错误处理**: 统一的错误响应格式

#### Controller层 (控制器层)
- **路由处理**: 处理HTTP请求并调用相应服务
- **参数验证**: 验证和处理请求参数
- **业务协调**: 协调不同服务之间的交互

#### 代码示例
```python
# Controller示例
@app.route('/api/beverages', methods=['GET'])
def get_beverages():
    try:
        beverages = beverage_controller.get_all_beverages()
        return ApiResponse.success(beverages)
    except Exception as e:
        return ApiResponse.error(str(e))

# Model示例 (已在前面展示)

# View示例
class ApiResponse:
    @staticmethod
    def success(data=None, message="Success"):
        return jsonify({
            "success": True,
            "message": message,
            "data": data
        })
    
    @staticmethod
    def error(message="Error", status_code=400):
        response = jsonify({
            "success": False,
            "message": message,
            "data": None
        })
        response.status_code = status_code
        return response
```

## API接口说明

### 饮料相关接口

- `GET /api/beverages` - 获取所有饮料
- `GET /api/condiments` - 获取所有配料

### 订单相关接口

- `POST /api/orders` - 创建新订单
- `GET /api/orders/history` - 获取订单历史
- `GET /api/orders/<order_id>` - 获取特定订单
- `PUT /api/orders/<order_id>/status` - 更新订单状态

### AI相关接口

- `GET /api/models/available` - 获取可用的AI模型
- `POST /api/ai-recommendation` - 获取AI推荐
- `POST /api/chat` - 聊天对话

## 技术栈

### 前端
- React 18
- TypeScript
- NextUI (基于Tailwind CSS的UI组件库)
- GSAP (动画库)
- Three.js / React Three Fiber (3D渲染)
- Axios (HTTP请求)
- highlight.js (代码语法高亮)
- react-markdown (Markdown渲染)
- react-resizable (窗口大小调整)

### 后端
- Flask (Python Web框架)
- 装饰器设计模式
- GPT和Deepseek大模型集成
- 代码生成模板系统

## 安装与部署

### 环境要求
- Python 3.8+
- Node.js 16+
- npm 8+

### 后端部署

1. 进入后端目录
   ```bash
   cd shop/backend
   ```

2. 创建并激活虚拟环境 (可选)
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac
   python -m venv venv
   source venv/bin/activate
   ```

3. 安装依赖
   ```bash
   pip install -r requirements.txt
   ```

4. 配置AI模型 (可选)
   - 复制`.env.example`创建`.env`文件
   ```
   GPTPROVIDER_API_KEY=your_openai_api_key
   DEEPSEEKPROVIDER_API_KEY=your_deepseek_api_key
   GPT_MODELS=["gpt-3.5-turbo", "gpt-4"]
   DEEPSEEK_MODELS=["deepseek-chat"]
   ```

5. 启动后端服务
   ```bash
   python app.py
   ```
   服务将在 http://localhost:5000 运行

### 前端部署

1. 进入前端目录
   ```bash
   cd shop/frontend
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 启动开发服务器
   ```bash
   npm start
   ```
   前端将在 http://localhost:3000 运行

4. 构建生产版本 (可选)
   ```bash
   npm run build
   ```

## 使用说明

1. 访问 http://localhost:3000 打开应用
2. 选择饮料和配料组合
3. 使用AI聊天功能获取推荐
4. 点击下单完成购买

## AI功能使用说明

### 智能推荐
1. 在聊天窗口输入您的偏好，如"我想喝一杯不太甜的提神饮料"
2. AI将分析您的需求并推荐合适的饮品和配料组合
3. 点击"执行"按钮可自动选择推荐的饮品和配料

### 智能对话
- 支持切换不同AI模型
- 可询问饮品相关问题
- 支持代码生成和执行

## 贡献指南

欢迎提交Issue和Pull Request对项目进行改进。贡献前请先fork项目并创建新分支。

## 许可

MIT License 